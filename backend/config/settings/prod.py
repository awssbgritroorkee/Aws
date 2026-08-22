"""Prod settings — PostgreSQL, DEBUG=False, strict security."""
from .base import *  # noqa: F401, F403
import dj_database_url  # pip install dj-database-url psycopg2-binary

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'aws-swae.onrender.com').split(',')

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        ssl_require=False,
    )
}

cors_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
else:
    CORS_ALLOW_ALL_ORIGINS = True


import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Render terminates SSL at the load balancer — Django must NOT redirect again
# SECURE_SSL_REDIRECT would cause an infinite redirect loop on Render
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ── Cloudinary Media Storage (Production) ────────────────────────────────────
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', 's7hoxer7'),
    'API_KEY':    os.environ.get('CLOUDINARY_API_KEY', '395953442862514'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', 'qIgbhaVyCUCvwssifEps0wHnLP4'),
}

cloudinary.config(
    cloud_name=CLOUDINARY_STORAGE['CLOUD_NAME'],
    api_key=CLOUDINARY_STORAGE['API_KEY'],
    api_secret=CLOUDINARY_STORAGE['API_SECRET'],
    secure=True
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
MEDIA_URL = '/media/'

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# ── Static files (WhiteNoise) ─────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False
WHITENOISE_USE_FINDERS = True          # serve un-collected files as fallback
WHITENOISE_AUTOREFRESH = True



