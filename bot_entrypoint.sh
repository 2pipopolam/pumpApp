#!/bin/bash

# create bot data directory
mkdir -p /app/bot_data
chmod -R 755 /app/bot_data

# start the bot
exec python /app/reminder_tg_bot/reminder_bot.py
