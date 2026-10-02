import os
import dj_database_url
from .base import *  # noqa: F401, F403

DEBUG = True

USE_SQLITE = os.environ.get('USE_SQLITE', 'False').lower() in ('true', '1', 't')
DATABASE_URL = None if USE_SQLITE else os.environ.get('DATABASE_URL')

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

# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth — Local Dev Fix
#
# In production, allauth reads the Google client_id / secret from the
# SocialApp database record (populated via Django admin on the live DB).
# On localhost the SQLite DB starts empty, so there is no SocialApp record
# and allauth raises a 500 error when exchanging the Google access token.
#
# Fix: supply credentials directly via SOCIALACCOUNT_PROVIDERS — allauth
# prefers these settings over the DB record, making a DB record unnecessary
# for local development.
# ─────────────────────────────────────────────────────────────────────────────
_GOOGLE_CLIENT_ID     = os.environ.get('GOOGLE_CLIENT_ID',  '656631199167-f3f2hodcbcq4ltkctn5adc2livl0nk09.apps.googleusercontent.com')
_GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')  # set in .env for full local testing

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': _GOOGLE_CLIENT_ID,
            'secret':    _GOOGLE_CLIENT_SECRET,
            'key':       '',
        },
        # Request the minimum scopes needed (email + profile)
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        # Skip email verification requirement — Google already verifies it
        'EMAIL_AUTHENTICATION': False,
        'VERIFIED_EMAIL': True,
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Cookie security — relax for localhost (http, not https)
# ─────────────────────────────────────────────────────────────────────────────
SESSION_COOKIE_SECURE = False   # allow session cookie over http on localhost
CSRF_COOKIE_SECURE    = False   # allow CSRF cookie over http on localhost
