# reminder_bot.py

import os
import logging
import requests
import uuid
from telegram import Update
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import pytz
from dotenv import load_dotenv
import json

from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters
)

# Загрузка переменных окружения из .env файла
load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TOKEN = os.getenv('TOKEN')
BOT_API_KEY = os.getenv('BOT_API_KEY')

if not TOKEN:
    logger.error("TOKEN не установлен в переменных окружения.")
    exit(1)

if not BOT_API_KEY:
    logger.error("BOT_API_KEY не установлен в переменных окружения.")
    exit(1)


API_URL = 'http://127.0.0.1:8000/api/user-training-sessions/'
LINK_API_URL = 'http://127.0.0.1:8000/api/link-telegram/'

# Часовой пояс
TIMEZONE = pytz.timezone('Europe/Lisbon')

# Заголовки для API-запросов
HEADERS = {
    'Authorization': f'Api-Key {BOT_API_KEY}',     
    'Content-Type': 'application/json',
}

# Файл для хранения связей chat_id ↔ user_id
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
    Преобразует название дня недели на английском в формат, используемый cron.
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
    Возвращает user_id, связанный с данным chat_id.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            chat_ids = json.load(f)
        return chat_ids.get(str(chat_id))
    except FileNotFoundError:
        logger.warning(f"Файл {CHAT_IDS_FILE} не найден.")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении {CHAT_IDS_FILE}: {e}")
        return None
    except Exception as e:
        logger.error(f"Неизвестная ошибка при получении user_id для chat_id {chat_id}: {e}")
        return None

async def send_reminder(context: ContextTypes.DEFAULT_TYPE):
    """
    Отправляет напоминание пользователю.
    """
    try:
        await context.bot.send_message(
            chat_id=context.job.context['chat_id'],
            text=context.job.context['message']
        )
        logger.info(f"Отправлено напоминание пользователю {context.job.context['chat_id']}")
    except Exception as e:
        logger.error(f"Ошибка при отправке напоминания: {e}")

def get_all_user_chat_ids():
    """
    Возвращает словарь всех chat_id и соответствующих им user_id.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Файл {CHAT_IDS_FILE} не найден. Возвращаем пустой словарь.")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении {CHAT_IDS_FILE}: {e}")
        return {}
    except Exception as e:
        logger.error(f"Неизвестная ошибка при чтении {CHAT_IDS_FILE}: {e}")
        return {}

def save_user_chat_id(chat_id, user_id):
    """
    Сохраняет или обновляет связь между chat_id и user_id в файле chat_ids.json.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            chat_ids = json.load(f)
    except FileNotFoundError:
        chat_ids = {}
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении {CHAT_IDS_FILE}: {e}")
        chat_ids = {}
    except Exception as e:
        logger.error(f"Неизвестная ошибка при чтении {CHAT_IDS_FILE}: {e}")
        chat_ids = {}

    if user_id is not None:
        if chat_id not in chat_ids:
            chat_ids[chat_id] = user_id
            logger.info(f"Сохранен новый chat_id: {chat_id} с user_id: {user_id}")
        else:
            if chat_ids[chat_id] != user_id:
                chat_ids[chat_id] = user_id
                logger.info(f"Обновлен chat_id: {chat_id} с новым user_id: {user_id}")
            else:
                logger.info(f"chat_id {chat_id} уже существует с user_id {chat_ids[chat_id]}.")
    
        try:
            with open(CHAT_IDS_FILE, 'w') as f:
                json.dump(chat_ids, f, indent=4)
            logger.info(f"Файл {CHAT_IDS_FILE} успешно обновлен.")
        except IOError as e:
            logger.error(f"Ошибка при записи в {CHAT_IDS_FILE}: {e}")
    else:
        logger.info(f"user_id для chat_id {chat_id} не задан. Не сохраняем в {CHAT_IDS_FILE}.")

def schedule_reminders(app):
    """
    Планирует напоминания для всех пользователей, у которых есть связанный user_id.
    """
    scheduler = BackgroundScheduler(timezone=TIMEZONE)
    user_chat_ids = get_all_user_chat_ids()

    if not user_chat_ids:
        logger.warning("Нет сохраненных chat_id пользователей для отправки напоминаний.")
        return

    for chat_id, user_id in user_chat_ids.items():
        if not user_id:
            logger.warning(f"user_id для chat_id {chat_id} не задан. Пропуск.")
            continue

        # список тренировок для user_id
        sessions = fetch_training_sessions(user_id=user_id)

        if not sessions:
            logger.warning(f"Нет сессий тренировок для user_id {user_id}.")
            continue

        for session in sessions:
            session_id = session.get('id')
            date_str = session.get('date')
            time_str = session.get('time')
            recurrence = session.get('recurrence', 'none').lower()
            days_of_week_str = session.get('days_of_week', '')  

            try:
               
                session_datetime = datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M:%S')
                session_datetime = TIMEZONE.localize(session_datetime)
            except ValueError as e:
                logger.error(f"Ошибка при парсинге datetime для сессии {session_id}: {e}")
                continue

            if recurrence == 'weekly' and days_of_week_str:
                days_of_week = days_of_week_str.split(',')
                day_crons = [day_name_to_cron(day) for day in days_of_week]
                day_crons_str = ','.join(day_crons)

                message = (
                    f"🔔 Напоминание: у вас тренировка сегодня в {session_datetime.strftime('%H:%M')}!"
                    f"\n📅 Повторяемость: {recurrence.capitalize()}"
                    f"\n📆 Дни недели: {days_of_week_str}"
                )

                scheduler.add_job(
                    send_reminder,
                    trigger='cron',
                    day_of_week=day_crons_str,
                    hour=session_datetime.hour,
                    minute=session_datetime.minute,
                    kwargs={'context': {'chat_id': chat_id, 'message': message}},
                )
                logger.info(f"Запланировано еженедельное напоминание для chat_id {chat_id} по сессии {session_id}")
            else:
                if session_datetime > datetime.now(TIMEZONE):
                    message = (
                        f"🔔 Напоминание: у вас тренировка {session_datetime.strftime('%Y-%m-%d')} в {session_datetime.strftime('%H:%M')}!"
                        f"\n📅 Повторяемость: {recurrence.capitalize()}"
                    )

                    scheduler.add_job(
                        send_reminder,
                        trigger='date',
                        run_date=session_datetime,
                        kwargs={'context': {'chat_id': chat_id, 'message': message}},
                    )
                    logger.info(f"Запланировано однократное напоминание для chat_id {chat_id} по сессии {session_id}")

    scheduler.start()
    logger.info("Планировщик напоминаний запущен.")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Обработчик команды /start.
    """
    chat_id = update.effective_chat.id

    user_id = get_user_id_from_chat_id(chat_id)

    if user_id:
        
        sessions = fetch_training_sessions(user_id=user_id)

        if not sessions:
            await update.message.reply_text('Нет доступных тренировочных сессий.')
            return

        # Форматируем сообщение
        message = "📋 Ваши тренировочные сессии:\n\n"
        for session in sessions:
            session_id = session.get('id', 'N/A')
            date_str = session.get('date', 'N/A')
            time_str = session.get('time', 'N/A')
            recurrence = session.get('recurrence', 'N/A')
            days_of_week = session.get('days_of_week', 'N/A')

            # Форматирование сообщения
            if recurrence.lower() == 'weekly' and days_of_week != 'N/A':
                message += (
                    f"🔹 **ID:** {session_id}\n"
                    f"🔹 **Дата:** {date_str}\n"
                    f"🔹 **Время:** {time_str}\n"
                    f"🔹 **Повторяемость:** {recurrence}\n"
                    f"🔹 **Дни недели:** {days_of_week}\n\n"
                )
            else:
                message += (
                    f"🔹 **ID:** {session_id}\n"
                    f"🔹 **Дата:** {date_str}\n"
                    f"🔹 **Время:** {time_str}\n"
                    f"🔹 **Повторяемость:** {recurrence}\n\n"
                )

        await update.message.reply_text(message, parse_mode='Markdown')
    else:
        await update.message.reply_text(
            'Ваш аккаунт не связан с Telegram. Пожалуйста, отправьте код связывания.'
        )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Обработчик всех текстовых сообщений (предполагается, что это код связывания).
    """
    message_text = update.message.text.strip()
    chat_id = update.message.from_user.id

    # Проверка, является ли сообщение кодом связывания (например, UUID)
    try:
        uuid_obj = uuid.UUID(message_text, version=4)
    except ValueError:
        await update.message.reply_text(
            "❌ Неверный формат кода. Пожалуйста, проверьте и попробуйте снова."
        )
        return

   
    try:
        logger.info(f"Отправка запроса связывания для chat_id {chat_id} с кодом {message_text}")
        response = requests.post(
            f"{LINK_API_URL}confirm/",
            json={'code': message_text, 'telegram_user_id': str(chat_id)},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        data = response.json()
        if data.get('detail') == 'Telegram успешно связан.':
            user_id = data.get('user_id')
            if user_id:
                save_user_chat_id(chat_id, user_id)
                await update.message.reply_text(
                    "✅ Ваш аккаунт успешно связан с Telegram!"
                )
            else:
                await update.message.reply_text(
                    "❌ Произошла ошибка при получении вашего идентификатора пользователя."
                )
        else:
            await update.message.reply_text(
                data.get('detail', '❌ Неизвестная ошибка.')
            )
    except requests.HTTPError as e:
        if e.response.status_code == 400:
            data = e.response.json()
            await update.message.reply_text(
                f"❌ Ошибка: {data.get('detail', 'Неверный запрос.')}"
            )
        elif e.response.status_code == 404:
            await update.message.reply_text(
                "❌ Эндпоинт для подтверждения связывания не найден."
            )
        else:
            logger.error(f"Ошибка при связывании Telegram: {e}")
            await update.message.reply_text(
                "❌ Произошла ошибка при связывании. Пожалуйста, попробуйте позже."
            )
    except requests.RequestException as e:
        logger.error(f"Ошибка при связывании Telegram: {e}")
        await update.message.reply_text(
            "❌ Произошла ошибка при связывании. Пожалуйста, попробуйте позже."
        )

def convert_chat_ids_to_dict():
    """
    Преобразует chat_ids.json из списка в словарь, если необходимо.
    """
    try:
        with open(CHAT_IDS_FILE, 'r') as f:
            data = json.load(f)
        if isinstance(data, list):
            chat_ids = {str(chat_id): None for chat_id in data}
            with open(CHAT_IDS_FILE, 'w') as f:
                json.dump(chat_ids, f, indent=4)
            logger.info("Преобразование chat_ids.json из списка в словарь завершено.")
    except FileNotFoundError:
        # Файл не существует, пустой словарь
        with open(CHAT_IDS_FILE, 'w') as f:
            json.dump({}, f)
        logger.info(f"Файл {CHAT_IDS_FILE} создан как пустой словарь.")
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка при чтении {CHAT_IDS_FILE}: {e}")
    except Exception as e:
        logger.error(f"Неизвестная ошибка при конвертации {CHAT_IDS_FILE}: {e}")

def main():
    
    # Преобразование формата chat_ids.json при запуске
    convert_chat_ids_to_dict()

    application = ApplicationBuilder().token(TOKEN).build()

    # Обработчик команды /start
    start_handler = CommandHandler("start", start)
    application.add_handler(start_handler)

    # Обработчик сообщений с кодом связывания
    message_handler = MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
    application.add_handler(message_handler)

    # Планирование напоминаний
    schedule_reminders(application)

    logger.info("Запуск Telegram-бота.")
    application.run_polling()

if __name__ == '__main__':
    main()
