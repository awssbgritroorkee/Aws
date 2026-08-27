"""Prod settings — PostgreSQL, DEBUG=False, strict security."""
import os
import dj_database_url
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = ['*']

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Local development fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

cors_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
    for origin in ["https://aws-red.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173"]:
        if origin not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(origin)
else:
    CORS_ALLOWED_ORIGINS = [
        "https://aws-red.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

CORS_ALLOW_CREDENTIALS = True

csrf_env = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_env.split(',') if origin.strip()]
    if "https://aws-red.vercel.app" not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append("https://aws-red.vercel.app")
else:
    CSRF_TRUSTED_ORIGINS = [
        "https://aws-red.vercel.app",
    ]


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
    'API_KEY':    os.environ.get('CLOUDINARY_API_KEY', '123296571387666'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', 'Ubzge5R1WtMNjCVsDpmxzosaNqE'),
}


cloudinary.config(
    cloud_name=CLOUDINARY_STORAGE['CLOUD_NAME'],
    api_key=CLOUDINARY_STORAGE['API_KEY'],
    api_secret=CLOUDINARY_STORAGE['API_SECRET'],
    secure=True
)

DEFAULT_FILE_STORAGE = 'config.storage.SafeCloudinaryStorage'
MEDIA_URL = '/media/'

STORAGES = {
    "default": {
        "BACKEND": "config.storage.SafeCloudinaryStorage",
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


# ── Email — Temporarily disabled until custom domain is acquired ──────────────
# Real SMTP sending (Gmail port 465) is paused to avoid connection timeouts on
# Render's free tier and reduce server load.
# To re-enable: comment out the console line, uncomment the SMTP line, and
# ensure EMAIL_HOST_USER / EMAIL_HOST_PASSWORD are set in Render env vars.
#
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # re-enable later
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # prints to stdout, no network call
