#!/bin/bash
set -e

# wait for database
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database is available"

mkdir -p /app/media
mkdir -p /app/static
mkdir -p /app/frontend/build/static

chown -R www-data:www-data /app/media /app/static
chmod -R 755 /app/media /app/static

python manage.py migrate

# frontend dependencies and start development server
if [ "$SERVICE_NAME" = "web" ]; then
    echo "Setting up frontend..."
    cd /app/frontend
    npm install
    # start react development server in the background
    npm start &
    cd /app
fi

# collect static files
python manage.py collectstatic --noinput

# start django development server
python manage.py runserver 0.0.0.0:8000
