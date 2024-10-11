# reminder_bot.py

import os
import logging
import requests
import uuid
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters
)
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get the bot token and API key from environment variables
TOKEN = os.getenv('TOKEN')
BOT_API_KEY = os.getenv('BOT_API_KEY')

# Check for missing tokens
if not TOKEN:
    logger.error("TOKEN is not set in environment variables.")
    exit(1)

if not BOT_API_KEY:
    logger.error("BOT_API_KEY is not set in environment variables.")
    exit(1)

# API URLs
API_URL = 'http://127.0.0.1:8000/api/user-training-sessions/'
LINK_API_URL = 'http://127.0.0.1:8000/api/link-telegram/'

# Timezone
TIMEZONE = pytz.timezone('Europe/Lisbon')  # Replace with your timezone

# Headers for API requests
HEADERS = {
    'Authorization': f'Api-Key {BOT_API_KEY}',
    'Content-Type': 'application/json',
}

# File to store chat_id ↔ user_id mappings
CHAT_IDS_FILE = 'chat_ids.json'

def fetch_training_sessions(user_id):
    """
    Fetches the list of training sessions for the user with the given user_id.
    """
    try:
        params = {'id': user_id}
        logger.info(f"Sending request to API: {API_URL} with user_id: {user_id}")
        logger.info(f"Headers: {HEADERS}")
        response = requests.get(API_URL, headers=HEADERS, params=params)
        logger.info(f"Response status code: {response.status_code}")
        logger.info(f"Response content: {response.content}")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Error fetching training sessions for user_id {user_id}: {e}")
        return []

def day_name_to_cron(day_name):
    """
    Converts day name to cron format.
    """
    days = {
        'Monday': 'mon',
        'Tuesday': 'tue',
        'Wednesday': 'wed',
        'Thursday': 'thu',
        'Friday': 'fri',
        'Saturday': 'sat',
        'Sunday': 'sun',
    }
    return days.get(day_name.strip().capitalize(), 'mon')

def get_user_id_from_chat_id(chat_id):
    """
    Returns the user_id associated with the given chat_id.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            chat_ids = json.load(f)
        return chat_ids.get(str(chat_id))
    except FileNotFoundError:
        logger.warning(f"File {CHAT_IDS_FILE} not found.")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Error reading {CHAT_IDS_FILE}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unknown error getting user_id for chat_id {chat_id}: {e}")
        return None

async def send_reminder(context: ContextTypes.DEFAULT_TYPE):
    """
    Sends a reminder to the user.
    """
    try:
        await context.bot.send_message(
            chat_id=context.job.context['chat_id'],
            text=context.job.context['message']
        )
        logger.info(f"Reminder sent to user {context.job.context['chat_id']}")
    except Exception as e:
        logger.error(f"Error sending reminder: {e}")

def get_all_user_chat_ids():
    """
    Returns a dictionary of all chat_id and their associated user_id.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"File {CHAT_IDS_FILE} not found. Returning empty dictionary.")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Error reading {CHAT_IDS_FILE}: {e}")
        return {}
    except Exception as e:
        logger.error(f"Unknown error reading {CHAT_IDS_FILE}: {e}")
        return {}

def save_user_chat_id(chat_id, user_id):
    """
    Saves or updates the mapping between chat_id and user_id in chat_ids.json.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            chat_ids = json.load(f)
    except FileNotFoundError:
        chat_ids = {}
    except json.JSONDecodeError as e:
        logger.error(f"Error reading {CHAT_IDS_FILE}: {e}")
        chat_ids = {}
    except Exception as e:
        logger.error(f"Unknown error reading {CHAT_IDS_FILE}: {e}")
        chat_ids = {}

    if user_id is not None:
        if chat_id not in chat_ids:
            chat_ids[chat_id] = user_id
            logger.info(f"Saved new chat_id: {chat_id} with user_id: {user_id}")
        else:
            if chat_ids[chat_id] != user_id:
                chat_ids[chat_id] = user_id
                logger.info(f"Updated chat_id: {chat_id} with new user_id: {user_id}")
            else:
                logger.info(f"chat_id {chat_id} already exists with user_id {chat_ids[chat_id]}.")
    
        try:
            with open(CHAT_IDS_FILE, 'w') as f:
                json.dump(chat_ids, f, indent=4)
            logger.info(f"File {CHAT_IDS_FILE} successfully updated.")
        except IOError as e:
            logger.error(f"Error writing to {CHAT_IDS_FILE}: {e}")
    else:
        logger.info(f"user_id for chat_id {chat_id} not set. Not saving to {CHAT_IDS_FILE}.")

def schedule_reminders(app):
    """
    Schedules reminders for all users who have a linked user_id.
    """
    scheduler = BackgroundScheduler(timezone=TIMEZONE)
    user_chat_ids = get_all_user_chat_ids()

    if not user_chat_ids:
        logger.warning("No saved chat_id users for sending reminders.")
        return

    for chat_id, user_id in user_chat_ids.items():
        if not user_id:
            logger.warning(f"user_id for chat_id {chat_id} not set. Skipping.")
            continue

        # Get the list of training sessions for this user_id
        sessions = fetch_training_sessions(user_id=user_id)

        if not sessions:
            logger.warning(f"No training sessions for user_id {user_id}.")
            continue

        for session in sessions:
            session_id = session.get('id')
            date_str = session.get('date')
            time_str = session.get('time')
            recurrence = session.get('recurrence', 'none').lower()
            days_of_week_str = session.get('days_of_week', '')  # e.g., "Monday,Wednesday"

            # Parse date and time
            try:
                session_datetime = datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M:%S')
                session_datetime = TIMEZONE.localize(session_datetime)
            except ValueError as e:
                logger.error(f"Error parsing datetime for session {session_id}: {e}")
                continue

            if recurrence == 'weekly' and days_of_week_str:
                days_of_week = days_of_week_str.split(',')
                day_crons = [day_name_to_cron(day) for day in days_of_week]
                day_crons_str = ','.join(day_crons)

                message = (
                    f"🔔 Reminder: You have a training session today at {session_datetime.strftime('%H:%M')}!"
                    f"\n📅 Recurrence: {recurrence.capitalize()}"
                    f"\n📆 Days of Week: {days_of_week_str}"
                )

                scheduler.add_job(
                    send_reminder,
                    trigger='cron',
                    day_of_week=day_crons_str,
                    hour=session_datetime.hour,
                    minute=session_datetime.minute,
                    kwargs={'context': {'chat_id': chat_id, 'message': message}},
                )
                logger.info(f"Scheduled weekly reminder for chat_id {chat_id} for session {session_id}")
            else:
                if session_datetime > datetime.now(TIMEZONE):
                    message = (
                        f"🔔 Reminder: You have a training session on {session_datetime.strftime('%Y-%m-%d')} at {session_datetime.strftime('%H:%M')}!"
                        f"\n📅 Recurrence: {recurrence.capitalize()}"
                    )

                    scheduler.add_job(
                        send_reminder,
                        trigger='date',
                        run_date=session_datetime,
                        kwargs={'context': {'chat_id': chat_id, 'message': message}},
                    )
                    logger.info(f"Scheduled one-time reminder for chat_id {chat_id} for session {session_id}")

    scheduler.start()
    logger.info("Reminder scheduler started.")

async def handle_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handles the /start command. Extracts the linking code if present.
    """
    chat_id = update.effective_chat.id
    args = context.args  # This will contain the parameters passed to /start

    if args:
        # Assuming the linking code is the first argument
        linking_code = args[0]
        # Now, proceed to link the account using the linking code
        await process_linking_code(update, linking_code)
    else:
        # No linking code provided, send a welcome message
        await update.message.reply_text(
            "Welcome! Your account is not linked with Telegram. Please request a linking code on the website and scan the QR code."
        )

async def process_linking_code(update: Update, linking_code: str):
    """
    Processes the linking code to link the user's account.
    """
    chat_id = update.effective_chat.id

    try:
        logger.info(f"Processing linking code for chat_id {chat_id} with code {linking_code}")
        response = requests.post(
            f"{LINK_API_URL}confirm/",
            json={'code': linking_code, 'telegram_user_id': str(chat_id)},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        data = response.json()
        if data.get('detail') == 'Telegram успешно связан.':
            user_id = data.get('user_id')
            if user_id:
                save_user_chat_id(chat_id, user_id)
                await update.message.reply_text(
                    "✅ Your account has been successfully linked with Telegram!"
                )
                # Optionally, fetch and display the user's training sessions
                sessions = fetch_training_sessions(user_id=user_id)
                if sessions:
                    message = "📋 Your training sessions:\n\n"
                    for session in sessions:
                        session_id = session.get('id', 'N/A')
                        date_str = session.get('date', 'N/A')
                        time_str = session.get('time', 'N/A')
                        recurrence = session.get('recurrence', 'N/A')
                        days_of_week = session.get('days_of_week', 'N/A')

                        if recurrence.lower() == 'weekly' and days_of_week != 'N/A':
                            message += (
                                f"🔹 **ID:** {session_id}\n"
                                f"🔹 **Date:** {date_str}\n"
                                f"🔹 **Time:** {time_str}\n"
                                f"🔹 **Recurrence:** {recurrence}\n"
                                f"🔹 **Days of Week:** {days_of_week}\n\n"
                            )
                        else:
                            message += (
                                f"🔹 **ID:** {session_id}\n"
                                f"🔹 **Date:** {date_str}\n"
                                f"🔹 **Time:** {time_str}\n"
                                f"🔹 **Recurrence:** {recurrence}\n\n"
                            )
                    await update.message.reply_text(message, parse_mode='Markdown')
            else:
                await update.message.reply_text(
                    "❌ An error occurred while retrieving your user ID."
                )
        else:
            await update.message.reply_text(
                data.get('detail', '❌ Unknown error.')
            )
    except requests.HTTPError as e:
        if e.response.status_code == 400:
            data = e.response.json()
            await update.message.reply_text(
                f"❌ Error: {data.get('detail', 'Invalid request.')}"
            )
        elif e.response.status_code == 404:
            await update.message.reply_text(
                "❌ The endpoint for linking confirmation was not found."
            )
        else:
            logger.error(f"Error linking Telegram: {e}")
            await update.message.reply_text(
                "❌ An error occurred while linking. Please try again later."
            )
    except requests.RequestException as e:
        logger.error(f"Error linking Telegram: {e}")
        await update.message.reply_text(
            "❌ An error occurred while linking. Please try again later."
        )

def convert_chat_ids_to_dict():
    """
    Converts chat_ids.json from a list to a dictionary if necessary.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            data = json.load(f)
        if isinstance(data, list):
            chat_ids = {str(chat_id): None for chat_id in data}
            with open(CHAT_IDS_FILE, 'w') as f:
                json.dump(chat_ids, f, indent=4)
            logger.info("Converted chat_ids.json from list to dictionary.")
    except FileNotFoundError:
        # File does not exist, create an empty dictionary
        with open(CHAT_IDS_FILE, 'w') as f:
            json.dump({}, f)
        logger.info(f"File {CHAT_IDS_FILE} created as empty dictionary.")
    except json.JSONDecodeError as e:
        logger.error(f"Error reading {CHAT_IDS_FILE}: {e}")
    except Exception as e:
        logger.error(f"Unknown error converting {CHAT_IDS_FILE}: {e}")

def main():
    """
    Main function to run the bot.
    """
    # Convert chat_ids.json format on startup
    convert_chat_ids_to_dict()

    application = ApplicationBuilder().token(TOKEN).build()

    # Handler for the /start command
    start_handler = CommandHandler("start", handle_start)
    application.add_handler(start_handler)

    # Schedule reminders
    schedule_reminders(application)

    logger.info("Starting Telegram bot.")
    application.run_polling()

if __name__ == '__main__':
    main()
