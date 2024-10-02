import os 
import logging
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import pytz
from dotenv import load_dotenv

# Загрузка из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
    level=logging.INFO
)

# Токен вашего бота
TOKEN = os.getenv('TOKEN')

# URL вашего API
API_URL = 'http://127.0.0.1:8000/api/training-sessions/'

# Часовой пояс
TIMEZONE = pytz.timezone('Europe/Lisbon')


def fetch_training_sessions():
    response = requests.get(API_URL)
    if response.status_code == 200:
        return response.json()
    else:
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
    await context.bot.send_message(
        chat_id=context.job.context['chat_id'], 
        text=context.job.context['message']
    )


# Заглушка
def get_all_user_chat_ids():
    print("ИДИ НА ХУЙ!!!")
    return []  # Возвращайте список chat_id пользователей


def schedule_reminders(app):
    scheduler = BackgroundScheduler(timezone=TIMEZONE)
    sessions = fetch_training_sessions()

    # Предположим, у нас есть список chat_id пользователей
    user_chat_ids = get_all_user_chat_ids()  # Реализуйте функцию для получения chat_id пользователей

    for session in sessions:
        session_date = datetime.strptime(session['date'], '%Y-%m-%d')
        session_time = datetime.strptime(session['time'], '%H:%M:%S').time()
        session_datetime = datetime.combine(session_date, session_time)
        session_datetime = TIMEZONE.localize(session_datetime)

        for chat_id in user_chat_ids:
            if session['recurrence'] == 'weekly' and session.get('days_of_week'):
                days_of_week = session['days_of_week'].split(',')
                day_nums = [day_name_to_cron(day) for day in days_of_week]
                day_nums_str = ','.join(day_nums)

                scheduler.add_job(
                    send_reminder,
                    trigger='cron',
                    day_of_week=day_nums_str,
                    hour=session_time.hour,
                    minute=session_time.minute,
                    args=[],  # No positional args
                    kwargs={'context': {'chat_id': chat_id, 'message': f'Напоминание: у вас тренировка сегодня в {session_time.strftime("%H:%M")}!'}},
                )
            else:
                if session_datetime > datetime.now(TIMEZONE):
                    scheduler.add_job(
                        send_reminder,
                        trigger='date',
                        run_date=session_datetime,
                        args=[],  # No positional args
                        kwargs={'context': {'chat_id': chat_id, 'message': f'Напоминание: у вас тренировка {session_date.strftime("%Y-%m-%d")} в {session_time.strftime("%H:%M")}!'}},
                    )
    scheduler.start()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    # Сохраните chat_id в базе данных или файле
    save_user_chat_id(chat_id)  # Реализуйте эту функцию
    await update.message.reply_text('Здравствуйте! Я буду напоминать вам о ваших тренировках.')


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
