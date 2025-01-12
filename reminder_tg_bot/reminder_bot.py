#!/usr/bin/env python3

import os
import logging
import requests
import json
from datetime import datetime
import pytz
from dotenv import load_dotenv
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)
from apscheduler.schedulers.background import BackgroundScheduler

load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class BotConfig:
    def __init__(self):
        self.TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
        self.BOT_API_KEY = os.getenv('BOT_API_KEY')
        self.API_BASE_URL = os.getenv('API_BASE_URL', 'http://web:8000')
        self.TIMEZONE = pytz.timezone(os.getenv('TIMEZONE', 'Europe/Lisbon'))
        self.CHAT_IDS_FILE = os.getenv('CHAT_IDS_FILE', '/app/bot_data/chat_ids.json')
        self.HEADERS = {
            'Authorization': f'Api-Key {self.BOT_API_KEY}',
            'Content-Type': 'application/json',
            'Host': 'web'
        }

        # bot_data directory
        os.makedirs(os.path.dirname(self.CHAT_IDS_FILE), exist_ok=True)

        self.validate_config()

    def validate_config(self):
        if not self.TOKEN:
            raise ValueError("TELEGRAM_BOT_TOKEN is not set")
        if not self.BOT_API_KEY:
            raise ValueError("BOT_API_KEY is not set")

        logger.info(f"API Base URL: {self.API_BASE_URL}")
        logger.info(f"Timezone: {self.TIMEZONE}")
        logger.info(f"Chat IDs File: {self.CHAT_IDS_FILE}")

# global config instance
config = BotConfig()

def check_api_health():
    try:
        response = requests.get(
            f"{config.API_BASE_URL}/api/health/",
            headers=config.HEADERS,
            timeout=5
        )
        return response.status_code == 200
    except requests.RequestException:
        return False

def fetch_training_sessions(user_id):
    try:
        response = requests.get(
            f"{config.API_BASE_URL}/api/user-training-sessions/",
            headers=config.HEADERS,
            params={'id': user_id},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Error fetching training sessions: {e}")
        return []

class ChatIDManager:
    @staticmethod
    def get_user_id(chat_id):
        try:
            if os.path.exists(config.CHAT_IDS_FILE):
                with open(config.CHAT_IDS_FILE, 'r') as f:
                    chat_ids = json.load(f)
                return chat_ids.get(str(chat_id))
        except Exception as e:
            logger.error(f"Error reading chat_ids: {e}")
        return None

    @staticmethod
    def save_user_id(chat_id, user_id):
        try:
            chat_ids = {}
            if os.path.exists(config.CHAT_IDS_FILE):
                with open(config.CHAT_IDS_FILE, 'r') as f:
                    chat_ids = json.load(f)

            chat_ids[str(chat_id)] = user_id

            with open(config.CHAT_IDS_FILE, 'w') as f:
                json.dump(chat_ids, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving chat_id: {e}")

    @staticmethod
    def get_all_mappings():
        try:
            if os.path.exists(config.CHAT_IDS_FILE):
                with open(config.CHAT_IDS_FILE, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading mappings: {e}")
        return {}

def schedule_reminders(app):
    scheduler = BackgroundScheduler(timezone=config.TIMEZONE)
    user_chat_ids = ChatIDManager.get_all_mappings()

    if not user_chat_ids:
        logger.warning("No users found for reminders")
        return

    for chat_id, user_id in user_chat_ids.items():
        if not user_id:
            continue

        sessions = fetch_training_sessions(user_id)
        if not sessions:
            continue

        for session in sessions:
            try:
                session_datetime = datetime.strptime(
                    f"{session['date']} {session['time']}",
                    '%Y-%m-%d %H:%M:%S'
                ).replace(tzinfo=config.TIMEZONE)

                if session_datetime > datetime.now(config.TIMEZONE):
                    message = (
                        f"🔔 Напоминание: У вас тренировка "
                        f"{session_datetime.strftime('%Y-%m-%d')} в "
                        f"{session_datetime.strftime('%H:%M')}!"
                    )

                    scheduler.add_job(
                        send_reminder,
                        'date',
                        run_date=session_datetime,
                        args=[app, chat_id, message]
                    )
                    logger.info(f"Scheduled reminder for chat_id {chat_id}")
            except Exception as e:
                logger.error(f"Error scheduling reminder: {e}")

    scheduler.start()
    logger.info("Reminder scheduler started")

async def send_reminder(app, chat_id, message):
    try:
        await app.bot.send_message(chat_id=chat_id, text=message)
        logger.info(f"Reminder sent to {chat_id}")
    except Exception as e:
        logger.error(f"Error sending reminder: {e}")

def get_keyboard():
    keyboard = [[KeyboardButton("📅 Получить календарь тренировок")]]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

async def handle_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    chat_id = update.effective_chat.id

    if not context.args:
        await update.message.reply_text(
            "Добро пожаловать! Ваш аккаунт не связан с Telegram. "
            "Пожалуйста, запросите код привязки на сайте и отсканируйте QR-код.",
            reply_markup=get_keyboard()
        )
        return

    linking_code = context.args[0]
    try:
        response = requests.post(
            f"{config.API_BASE_URL}/api/link-telegram/confirm/",
            json={'code': linking_code, 'telegram_user_id': str(chat_id)},
            headers=config.HEADERS,
            timeout=10
        )

        data = response.json()
        if response.status_code == 200 and data.get('detail') == 'Telegram успешно связан.':
            user_id = data.get('user_id')
            if user_id:
                ChatIDManager.save_user_id(str(chat_id), user_id)
                await update.message.reply_text(
                    "✅ Ваш аккаунт успешно связан с Telegram!",
                    reply_markup=get_keyboard()
                )

                sessions = fetch_training_sessions(user_id)
                if sessions:
                    message = format_training_sessions(sessions)
                    await update.message.reply_text(message, parse_mode='Markdown')
        else:
            await update.message.reply_text(
                f"❌ Ошибка: {data.get('detail', 'Неизвестная ошибка')}",
                reply_markup=get_keyboard()
            )
    except Exception as e:
        logger.error(f"Error linking account: {e}")
        await update.message.reply_text(
            "❌ Произошла ошибка при привязке. Пожалуйста, попробуйте позже.",
            reply_markup=get_keyboard()
        )

async def handle_get_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle calendar request"""
    chat_id = update.effective_chat.id
    user_id = ChatIDManager.get_user_id(chat_id)

    if not user_id:
        await update.message.reply_text(
            "❌ Ваш аккаунт не связан с Telegram. Пожалуйста, используйте /start с вашим кодом привязки."
        )
        return

    sessions = fetch_training_sessions(user_id)
    if not sessions:
        await update.message.reply_text("📅 У вас нет предстоящих тренировок.")
        return

    message = format_training_sessions(sessions)
    await update.message.reply_text(message, parse_mode='Markdown')

def format_training_sessions(sessions):
    message = "📋 *Ваши тренировки:*\n\n"
    for session in sessions:
        date_str = session.get('date', 'N/A')
        time_str = session.get('time', 'N/A')
        message += (
            f"🔹 *Дата:* {date_str}\n"
            f"🔹 *Время:* {time_str}\n\n"
        )
    return message

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")
    if update and update.effective_chat:
        await update.effective_chat.send_message(
            "⚠️ Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."
        )

def main():
    application = (
        Application.builder()
        .token(config.TOKEN)
        .build()
    )

    application.add_handler(CommandHandler("start", handle_start))
    application.add_handler(MessageHandler(
        filters.Regex("^📅 Получить календарь тренировок$"),
        handle_get_calendar
    ))
    application.add_error_handler(error_handler)

    # Wait for API
    for _ in range(30):
        if check_api_health():
            logger.info("API is available")
            break
        logger.info("Waiting for API...")
        import time
        time.sleep(2)
    else:
        logger.error("API is not available after maximum retries")
        return

    schedule_reminders(application)

    logger.info("Starting Telegram bot")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
