"""
Django settings — Base (shared between dev and prod).
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from import_export.formats.base_formats import CSV, XLSX

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# django-import-export formats — enable Excel (.xlsx) and CSV
IMPORT_EXPORT_FORMATS = [XLSX, CSV]

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-only-change-me')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'unfold',                    # must be before django.contrib.admin
    'unfold.contrib.filters',   # optional: enhanced filter widgets
    'unfold.contrib.forms',     # optional: styled form widgets
    'unfold.contrib.import_export', # Unfold dark templates for import/export
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.sites',
    # Cloudinary storage — must be before staticfiles
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth.registration',
    'corsheaders',
    'django_filters',
    'import_export',
    # Local apps
    'apps.accounts',
    'apps.ideas',
    'apps.teams',
    'apps.members',
    'apps.events',
    'apps.gallery',
    'apps.contact',
    'apps.students',
]

SITE_ID = 1

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
    'allauth.account.middleware.AccountMiddleware',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── DRF Configuration ─────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
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

# ── Allauth & Social Login Settings ─────────────────────────────────────────
ACCOUNT_LOGIN_METHODS = {'email', 'username'}
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_UNIQUE_EMAIL = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
SOCIALACCOUNT_STORE_TOKENS = True
SOCIALACCOUNT_ADAPTER = 'apps.accounts.adapters.CustomSocialAccountAdapter'

# ── CORS & CSRF Configuration ────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "https://aws-red.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "https://aws-red.vercel.app",
]

# ── SMTP Email Backend ───────────────────────────────────────────────────────
# Using port 465 (SSL) instead of 587 (STARTTLS) because Render.com blocks
# outbound SMTP on port 587, causing connection timeouts.
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 465))       # 465 = SSL (works on Render)
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'False').lower() == 'true'  # Must be False when using SSL
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'True').lower() == 'true'   # SSL required for port 465
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', os.environ.get('EMAIL_HOST_USER', 'AWS SBG <noreply@awssbg.com>'))
EMAIL_TIMEOUT = 30  # Increased from 10s — gives Render more time to establish SSL connection

# Django Unfold Admin Theme
UNFOLD = {
    # Branding
    "SITE_TITLE": "AWS SBG",
    "SITE_HEADER": "AWS Student Builder Group",
    "SITE_SUBHEADER": "RIT Roorkee \u00b7 Admin Dashboard",
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

    # UX
    "THEME": "dark",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "SHOW_BACK_BUTTON": True,

    "SCRIPTS": ["/static/admin/js/force-dark.js"],
    "STYLES": ["/static/admin/css/custom-unfold.css"],

    # AWS Amber/Orange colors (oklch format required by Unfold v0.91)
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

    # Structured Sidebar Navigation
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            # Overview
            {
                "title": "Dashboard",
                "separator": False,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": "/admin/",
                        "permission": lambda request: request.user.is_staff or request.user.is_superuser,
                    },
                ],
            },
            # User Management: Users, Groups, Email Broadcasts
            {
                "title": "User Management",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "manage_accounts",
                        "link": "/admin/auth/user/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('auth.view_user'),
                    },
                    {
                        "title": "Groups",
                        "icon": "shield_person",
                        "link": "/admin/auth/group/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('auth.view_group'),
                    },
                    {
                        "title": "Email Broadcasts",
                        "icon": "campaign",
                        "link": "/admin/accounts/emailbroadcast/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('accounts.view_emailbroadcast'),
                    },
                ],
            },
            # Website Content: Events, Gallery Photos, Team Members
            {
                "title": "Website Content",
                "separator": True,
                "items": [
                    {
                        "title": "Events",
                        "icon": "event",
                        "link": "/admin/events/event/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('events.view_event'),
                    },
                    {
                        "title": "Gallery Albums",
                        "icon": "photo_library",
                        "link": "/admin/gallery/galleryalbum/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('gallery.view_galleryalbum'),
                    },
                    {
                        "title": "Team Members",
                        "icon": "group",
                        "link": "/admin/members/member/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('members.view_member'),
                    },
                ],
            },
            # Event Registrations
            {
                "title": "Event Registrations",
                "separator": True,
                "items": [
                    {
                        "title": "Registrations",
                        "icon": "how_to_reg",
                        "link": "/admin/students/eventregistration/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('students.view_eventregistration'),
                    },
                    {
                        "title": "Student Profiles",
                        "icon": "school",
                        "link": "/admin/students/studentprofile/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('students.view_studentprofile'),
                    },
                ],
            },
            # Communications & Socials: Contact Messages, Social Accounts, Social Applications
            {
                "title": "Communications & Socials",
                "separator": True,
                "items": [
                    {
                        "title": "Contact Messages",
                        "icon": "mail",
                        "link": "/admin/contact/contactmessage/",
                        "permission": lambda request: request.user.is_superuser or request.user.has_perm('contact.view_contactmessage'),
                    },
                    {
                        "title": "Social Accounts",
                        "icon": "person_pin",
                        "link": "/admin/socialaccount/socialaccount/",
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": "Social Applications",
                        "icon": "apps",
                        "link": "/admin/socialaccount/socialapp/",
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            # System Architecture: Sites, Auth Tokens, Activity Logs
            {
                "title": "System Architecture",
                "separator": True,
                "items": [
                    {
                        "title": "Sites",
                        "icon": "language",
                        "link": "/admin/sites/site/",
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": "Auth Tokens",
                        "icon": "key",
                        "link": "/admin/authtoken/tokenproxy/",
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": "Activity Logs",
                        "icon": "history",
                        "link": "/admin/admin/logentry/",
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
        ],
    },

    # Tabs shown on model list/detail pages
    "TABS": [
        # User Management tab group
        {
            "models": ["auth.user", "auth.group", "accounts.emailbroadcast"],
            "items": [
                {
                    "title": "Users",
                    "link": "/admin/auth/user/",
                    "icon": "person",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('auth.view_user'),
                },
                {
                    "title": "Groups",
                    "link": "/admin/auth/group/",
                    "icon": "group",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('auth.view_group'),
                },
                {
                    "title": "Email Broadcasts",
                    "link": "/admin/accounts/emailbroadcast/",
                    "icon": "campaign",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('accounts.view_emailbroadcast'),
                },
            ],
        },
        # Website Content tab group
        {
            "models": ["events.event", "gallery.galleryalbum", "members.member"],
            "items": [
                {
                    "title": "Events",
                    "link": "/admin/events/event/",
                    "icon": "event",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('events.view_event'),
                },
                {
                    "title": "Gallery Albums",
                    "link": "/admin/gallery/galleryalbum/",
                    "icon": "photo_library",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('gallery.view_galleryalbum'),
                },
                {
                    "title": "Team Members",
                    "link": "/admin/members/member/",
                    "icon": "group",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('members.view_member'),
                },
            ],
        },
        # Event Registrations tab group
        {
            "models": ["students.eventregistration", "students.studentprofile"],
            "items": [
                {
                    "title": "Registrations",
                    "link": "/admin/students/eventregistration/",
                    "icon": "how_to_reg",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('students.view_eventregistration'),
                },
                {
                    "title": "Student Profiles",
                    "link": "/admin/students/studentprofile/",
                    "icon": "school",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('students.view_studentprofile'),
                },
            ],
        },
        # Communications & Socials tab group
        {
            "models": [
                "contact.contactmessage",
                "socialaccount.socialaccount",
                "socialaccount.socialapp",
            ],
            "items": [
                {
                    "title": "Contact Messages",
                    "link": "/admin/contact/contactmessage/",
                    "icon": "mail",
                    "permission": lambda request: request.user.is_superuser or request.user.has_perm('contact.view_contactmessage'),
                },
                {
                    "title": "Social Accounts",
                    "link": "/admin/socialaccount/socialaccount/",
                    "icon": "person_pin",
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": "Social Applications",
                    "link": "/admin/socialaccount/socialapp/",
                    "icon": "apps",
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
        # System Architecture tab group
        {
            "models": ["sites.site", "authtoken.tokenproxy", "admin.logentry"],
            "items": [
                {
                    "title": "Sites",
                    "link": "/admin/sites/site/",
                    "icon": "language",
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": "Auth Tokens",
                    "link": "/admin/authtoken/tokenproxy/",
                    "icon": "key",
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": "Activity Logs",
                    "link": "/admin/admin/logentry/",
                    "icon": "history",
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
    ],
}
