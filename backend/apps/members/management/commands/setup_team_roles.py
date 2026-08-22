from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Creates predefined Team Groups and assigns appropriate permissions.'

    def handle(self, *args, **kwargs):
        # Define the groups and the app_labels/models they should have access to
        roles_config = {
            'Event Managers': {
                'events': ['event']  # Can add, change, delete events
            },
            'Gallery Managers': {
                'gallery': ['galleryphoto']  # Can add, change, delete gallery photos
            },
            'Team Leads': {
                'members': ['member'],  # Can manage team members
                'events': ['event'],
                'gallery': ['galleryphoto']
            }
        }

        for group_name, access_rights in roles_config.items():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created group: {group_name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Group already exists: {group_name}"))

            # Assign permissions
            for app_label, models in access_rights.items():
                for model_name in models:
                    try:
                        content_type = ContentType.objects.get(app_label=app_label, model=model_name)
                        permissions = Permission.objects.filter(content_type=content_type)
                        for perm in permissions:
                            group.permissions.add(perm)
                    except ContentType.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Model {model_name} in app {app_label} not found. Skipping."))

            self.stdout.write(self.style.SUCCESS(f"Successfully assigned permissions to {group_name}"))
