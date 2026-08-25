#!/usr/bin/env bash
# build.sh — Render build script
# Set this as the Build Command in Render dashboard:
#   chmod +x build.sh && ./build.sh
set -o errexit   # Exit on any error

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Setting Django settings module to production..."
export DJANGO_SETTINGS_MODULE=config.settings.prod

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Build complete ✅"
