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

echo "==> Safely checking and creating superuser..."
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = (os.environ.get('DJANGO_SUPERUSER_USERNAME') or 'MyAws_sbg').strip()
email = (os.environ.get('DJANGO_SUPERUSER_EMAIL') or 'admin@example.com').strip()
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if password and not User.objects.filter(username__iexact=username).exists() and not (email and User.objects.filter(email__iexact=email).exists()):
    try:
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superuser {username} created successfully.')
    except Exception as e:
        print(f'Superuser creation skipped: {e}')
else:
    print(f'Superuser {username} already exists or password not set -- skipping.')
"

echo "==> Build complete ✅"
