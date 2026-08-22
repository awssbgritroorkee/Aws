import os
from django.core.wsgi import get_wsgi_application

# Default to prod — Render must use production settings.
# Override locally by setting DJANGO_SETTINGS_MODULE=config.settings.dev
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.prod')
application = get_wsgi_application()
