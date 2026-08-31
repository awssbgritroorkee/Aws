from django.apps import AppConfig


class TeamupConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.teamup'
    verbose_name = 'Team Up'

    def ready(self):
        import apps.teamup.signals  # noqa: F401 — registers post_save signal
