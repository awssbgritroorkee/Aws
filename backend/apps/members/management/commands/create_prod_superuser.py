"""
Management command: create_prod_superuser
Creates a Django superuser from environment variables.
Safe to run multiple times — skips if the user already exists.

Usage (Render Shell or build command):
    python manage.py create_prod_superuser
"""
import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from DJANGO_SUPERUSER_* environment variables (idempotent)."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email    = os.environ.get("DJANGO_SUPERUSER_EMAIL",    "admin@example.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not password:
            self.stderr.write(
                self.style.ERROR(
                    "❌  DJANGO_SUPERUSER_PASSWORD env var is not set. Aborting."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Superuser '{username}' already exists — skipping creation."
                )
            )
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(
            self.style.SUCCESS(
                f"✅  Superuser '{username}' created successfully."
            )
        )
