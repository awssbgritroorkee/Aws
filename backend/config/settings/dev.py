import os
import dj_database_url
from .base import *  # noqa: F401, F403

DEBUG = True

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=False,
        )
    }
    # Add SSL + timeout options for Azure PostgreSQL
    DATABASES['default'].setdefault('OPTIONS', {})
    DATABASES['default']['OPTIONS']['connect_timeout'] = 10
    DATABASES['default']['OPTIONS']['sslmode'] = 'require'
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')

CORS_ALLOW_ALL_ORIGINS = False

# Serve custom static files (e.g. force-dark.js) during development
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Local media storage for development uploads
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

