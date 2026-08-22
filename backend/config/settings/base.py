"""
Django settings — Base (shared between dev and prod).
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-only-change-me')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'unfold',                    # must be before django.contrib.admin
    'unfold.contrib.filters',   # optional: enhanced filter widgets
    'unfold.contrib.forms',     # optional: styled form widgets
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    # Cloudinary storage — must be before staticfiles
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
    # Local apps
    'apps.ideas',
    'apps.teams',
    'apps.members',
    'apps.events',
    'apps.gallery',
    'apps.contact',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'

# ── Cloudinary (media storage for all environments) ──────────────────────────
import cloudinary
import cloudinary.uploader
import cloudinary.api

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
MEDIA_ROOT = BASE_DIR / 'media'



DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF defaults
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# ── Django Unfold Admin Theme ─────────────────────────────────────────────────
UNFOLD = {
    # ── Branding ──────────────────────────────────────────────────────────────
    "SITE_TITLE": "AWS SBG",
    "SITE_HEADER": "AWS Student Builder Group",
    "SITE_SUBHEADER": "RIT Roorkee · Admin Dashboard",
    "SITE_ICON": {
        "light": lambda request: "/static/logo.svg",
        "dark": lambda request: "/static/logo.svg",
    },
    "SITE_FAVICONS": [
        {
            "rel": "icon",
            "href": "/static/favicon.svg",
            "type": "image/svg+xml",
        },
    ],

    # ── UX ────────────────────────────────────────────────────────────────────
    "THEME": "dark",          # sets initial HTML class="dark" before Alpine loads
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "SHOW_BACK_BUTTON": True,

    # Force dark mode via localStorage before Alpine.js initialises
    "SCRIPTS": ["/static/admin/js/force-dark.js"],

    # ── AWS Amber/Orange — oklch() format required by Unfold v0.91 ─────────────
    "COLORS": {
        "base": {
            "50":  "oklch(98.5% .002 247.839)",
            "100": "oklch(96.7% .003 264.542)",
            "200": "oklch(92.8% .006 264.531)",
            "300": "oklch(87.2% .010 258.338)",
            "400": "oklch(70.7% .022 261.325)",
            "500": "oklch(55.1% .027 264.364)",
            "600": "oklch(44.6% .030 256.802)",
            "700": "oklch(37.3% .034 259.733)",
            "800": "oklch(27.8% .033 256.848)",
            "900": "oklch(21.0% .034 264.665)",
            "950": "oklch(13.0% .028 261.692)",
        },
        "primary": {
            # Amber/Orange — AWS brand identity
            "50":  "oklch(98.7% .026 95.277)",
            "100": "oklch(97.3% .071 95.765)",
            "200": "oklch(94.5% .129 96.688)",
            "300": "oklch(90.5% .182 98.111)",
            "400": "oklch(85.2% .199 91.936)",
            "500": "oklch(76.9% .189 70.080)",
            "600": "oklch(66.6% .179 58.318)",
            "700": "oklch(55.5% .163 48.998)",
            "800": "oklch(47.3% .137 46.201)",
            "900": "oklch(41.4% .112 45.904)",
            "950": "oklch(27.0% .079 36.259)",
        },
    },

    # ── Structured Sidebar Navigation with Icons ───────────────────────────────
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "📊 Overview",
                "separator": False,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": "/admin/",
                    },
                    {
                        "title": "Activity Logs",
                        "icon": "history",
                        "link": "/admin/admin/logentry/",
                    },
                ],
            },
            {
                "title": "🎓 People",
                "separator": True,
                "items": [
                    {
                        "title": "Team Members",
                        "icon": "group",
                        "link": "/admin/members/member/",
                    },
                    {
                        "title": "Users",
                        "icon": "manage_accounts",
                        "link": "/admin/auth/user/",
                    },
                    {
                        "title": "Groups",
                        "icon": "shield_person",
                        "link": "/admin/auth/group/",
                    },
                ],
            },
            {
                "title": "📅 Events & Gallery",
                "separator": True,
                "items": [
                    {
                        "title": "Events",
                        "icon": "event",
                        "link": "/admin/events/event/",
                    },
                    {
                        "title": "Gallery Photos",
                        "icon": "photo_library",
                        "link": "/admin/gallery/galleryphoto/",
                    },
                ],
            },
            {
                "title": "📬 Inbox",
                "separator": True,
                "items": [
                    {
                        "title": "Contact Messages",
                        "icon": "mail",
                        "link": "/admin/contact/contactmessage/",
                    },
                ],
            },
        ],
    },

    # ── Tabs (shown on model list pages) ──────────────────────────────────────
    "TABS": [
        {
            "models": ["auth.user", "auth.group"],
            "items": [
                {"title": "Users",  "link": "/admin/auth/user/",  "icon": "person"},
                {"title": "Groups", "link": "/admin/auth/group/", "icon": "group"},
            ],
        },
        {
            "models": ["events.event"],
            "items": [
                {"title": "All Events",      "link": "/admin/events/event/",                  "icon": "event"},
                {"title": "Gallery Photos",  "link": "/admin/gallery/galleryphoto/",           "icon": "photo_library"},
            ],
        },
    ],
}
