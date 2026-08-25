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
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Create a superuser from DJANGO_SUPERUSER_* environment variables (idempotent)."

    def handle(self, *args, **options):
        User = get_user_model()

        username = (os.environ.get("DJANGO_SUPERUSER_USERNAME") or "admin").strip()
        email    = (os.environ.get("DJANGO_SUPERUSER_EMAIL") or "admin@example.com").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not password:
            self.stderr.write(
                self.style.ERROR(
                    "DJANGO_SUPERUSER_PASSWORD env var is not set. Aborting."
                )
            )
            return

        # Check if user already exists by username (case-insensitive) or email
        if User.objects.filter(username__iexact=username).exists() or (email and User.objects.filter(email__iexact=email).exists()):
            self.stdout.write(
                self.style.WARNING(
                    f"Superuser '{username}' or email '{email}' already exists -- skipping creation."
                )
            )
            return

        try:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' created successfully."
                )
            )
        except IntegrityError as exc:
            self.stdout.write(
                self.style.WARNING(
                    f"Superuser '{username}' already exists in database ({exc}) -- skipping creation."
                )
            )
        except Exception as exc:
            self.stderr.write(
                self.style.ERROR(
                    f"Error creating superuser '{username}': {exc}"
                )
            )
