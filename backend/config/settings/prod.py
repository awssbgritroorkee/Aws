"""Prod settings — PostgreSQL, DEBUG=False, strict security."""
from .base import *  # noqa: F401, F403
import dj_database_url  # pip install dj-database-url psycopg2-binary

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'aws-swae.onrender.com').split(',')

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', ''),
        conn_max_age=600,
    )
}

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
STATIC_ROOT = BASE_DIR / 'staticfiles'
