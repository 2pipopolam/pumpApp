#!/bin/bash
set -e

echo "Checking installed Python packages..."
pip freeze

echo "Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "PostgreSQL is up and running!"

echo "Building React application..."
cd frontend
npm install
npm run build
cd ..

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000 &

echo "Starting React development server..."
cd frontend
npm start
