import os
import logging
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import pytz
from dotenv import load_dotenv
import json  # Import json module

# Загрузка из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
    level=logging.INFO
)

logger = logging.getLogger(__name__)

# Токен вашего бота
TOKEN = os.getenv('TOKEN')

# URL вашего API
API_URL = 'http://127.0.0.1:8000/api/training-sessions/'

# Часовой пояс
TIMEZONE = pytz.timezone('Europe/Lisbon')

# API Credentials
API_USERNAME = os.getenv('API_USERNAME')
API_PASSWORD = os.getenv('API_PASSWORD')


def fetch_training_sessions():
    try:
        response = requests.get(API_URL, auth=(API_USERNAME, API_PASSWORD))
        response.raise_for_status()  # Raises HTTPError for bad responses (4XX, 5XX)
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Ошибка при получении сессий тренировок: {e}")
        return []


def day_name_to_cron(day_name):
    days = {
        'Monday': 'mon',
        'Tuesday': 'tue',
        'Wednesday': 'wed',
        'Thursday': 'thu',
        'Friday': 'fri',
        'Saturday': 'sat',
        'Sunday': 'sun',
    }
    return days.get(day_name.strip(), 'mon')


async def send_reminder(context: ContextTypes.DEFAULT_TYPE):
    try:
        await context.bot.send_message(
            chat_id=context.job.context['chat_id'], 
            text=context.job.context['message']
        )
        logger.info(f"Отправлено напоминание пользователю {context.job.context['chat_id']}")
    except Exception as e:
        logger.error(f"Ошибка при отправке напоминания: {e}")


def get_all_user_chat_ids():
    try:
        with open('chat_ids.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении chat_ids.json: {e}")
        return []


def save_user_chat_id(chat_id):
    try:
        with open('chat_ids.json', 'r') as f:
            chat_ids = json.load(f)
    except FileNotFoundError:
        chat_ids = []
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении chat_ids.json: {e}")
        chat_ids = []

    if chat_id not in chat_ids:
        chat_ids.append(chat_id)
        try:
            with open('chat_ids.json', 'w') as f:
                json.dump(chat_ids, f)
            logger.info(f"Сохранен новый chat_id: {chat_id}")
        except IOError as e:
            logger.error(f"Ошибка при записи в chat_ids.json: {e}")
    else:
        logger.info(f"chat_id {chat_id} уже существует.")


def schedule_reminders(app):
    scheduler = BackgroundScheduler(timezone=TIMEZONE)
    sessions = fetch_training_sessions()

    if not sessions:
        logger.warning("Нет сессий тренировок для планирования напоминаний.")
        return

    # Получаем список chat_id пользователей
    user_chat_ids = get_all_user_chat_ids()

    if not user_chat_ids:
        logger.warning("Нет сохраненных chat_id пользователей для отправки напоминаний.")
        return

    for session in sessions:
        session_id = session.get('id')
        session_date_str = session.get('date')
        session_time_str = session.get('time')
        recurrence = session.get('recurrence', 'none').lower()
        days_of_week_str = session.get('days_of_week', '')

        # Парсим дату и время
        try:
            session_date = datetime.strptime(session_date_str, '%Y-%m-%d')
            session_time = datetime.strptime(session_time_str, '%H:%M:%S').time()
            session_datetime = datetime.combine(session_date, session_time)
            session_datetime = TIMEZONE.localize(session_datetime)
        except ValueError as e:
            logger.error(f"Ошибка при парсинге даты или времени: {e}")
            continue

        for chat_id in user_chat_ids:
            if recurrence == 'weekly' and days_of_week_str:
                days_of_week = days_of_week_str.split(',')
                day_crons = [day_name_to_cron(day) for day in days_of_week]
                day_crons_str = ','.join(day_crons)

                message = (
                    f"🔔 Напоминание: у вас тренировка сегодня в {session_time.strftime('%H:%M')}!"
                    f"\n📅 Повторяемость: {recurrence.capitalize()}"
                    f"\n📆 Дни недели: {days_of_week_str}"
                )

                scheduler.add_job(
                    send_reminder,
                    trigger='cron',
                    day_of_week=day_crons_str,
                    hour=session_time.hour,
                    minute=session_time.minute,
                    kwargs={'context': {'chat_id': chat_id, 'message': message}},
                )
                logger.info(f"Запланирована еженедельная напоминание для chat_id {chat_id} по сессии {session_id}")
            else:
                if session_datetime > datetime.now(TIMEZONE):
                    message = (
                        f"🔔 Напоминание: у вас тренировка {session_date.strftime('%Y-%m-%d')} в {session_time.strftime('%H:%M')}!"
                        f"\n📅 Повторяемость: {recurrence.capitalize()}"
                    )

                    scheduler.add_job(
                        send_reminder,
                        trigger='date',
                        run_date=session_datetime,
                        kwargs={'context': {'chat_id': chat_id, 'message': message}},
                    )
                    logger.info(f"Запланирована однократная напоминание для chat_id {chat_id} по сессии {session_id}")

    scheduler.start()
    logger.info("Планировщик напоминаний запущен.")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    save_user_chat_id(chat_id)  # Сохранение chat_id

    # Fetch training sessions
    sessions = fetch_training_sessions()

    if not sessions:
        await update.message.reply_text('Нет доступных тренировочных сессий.')
        return

    # Format the training sessions
    message = "📋 Ваши тренировочные сессии:\n\n"
    for session in sessions:
        session_id = session.get('id', 'N/A')
        date = session.get('date', 'N/A')
        time = session.get('time', 'N/A')
        recurrence = session.get('recurrence', 'N/A')
        days_of_week = session.get('days_of_week', 'N/A')

        # If recurrence is weekly, include days_of_week
        if recurrence.lower() == 'weekly' and days_of_week != 'N/A':
            message += (
                f"🔹 **ID:** {session_id}\n"
                f"🔹 **Дата:** {date}\n"
                f"🔹 **Время:** {time}\n"
                f"🔹 **Повторяемость:** {recurrence}\n"
                f"🔹 **Дни недели:** {days_of_week}\n\n"
            )
        else:
            message += (
                f"🔹 **ID:** {session_id}\n"
                f"🔹 **Дата:** {date}\n"
                f"🔹 **Время:** {time}\n"
                f"🔹 **Повторяемость:** {recurrence}\n\n"
            )

    await update.message.reply_text(message, parse_mode='Markdown')


def main():
    application = ApplicationBuilder().token(TOKEN).build()

    # Добавляем обработчик команды /start
    start_handler = CommandHandler("start", start)
    application.add_handler(start_handler)

    # Запускаем планирование напоминаний
    schedule_reminders(application)

    # Запускаем бота
    application.run_polling()


if __name__ == '__main__':
    main()
