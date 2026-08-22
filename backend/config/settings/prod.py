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

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# Render terminates SSL at the load balancer — Django must NOT redirect again
# SECURE_SSL_REDIRECT would cause an infinite redirect loop on Render
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ── Static files (WhiteNoise) ─────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_USE_FINDERS = True          # serve un-collected files as fallback
WHITENOISE_AUTOREFRESH = True
