"""
apps/teamup/signals.py

Auto-cleanup: when an Event's is_registration_open is flipped to False
(or status changes to 'past'), all linked TeamRequest posts for that event
are deleted. This is a reactive signal — no cron or Celery required.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.events.models import Event


@receiver(post_save, sender=Event)
def cleanup_team_requests_on_event_close(sender, instance, **kwargs):
    """
    When an Event is saved and is no longer open for registration,
    delete all TeamRequest posts that reference it via event_ref.
    This handles the case where an admin closes registrations or marks
    the event as 'past'.
    """
    from apps.teamup.models import TeamRequest  # local import avoids circular reference

    if not instance.is_registration_open or instance.status == 'past':
        deleted_count, _ = TeamRequest.objects.filter(event_ref=instance).delete()
        if deleted_count:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(
                '[TeamUp] Deleted %d TeamRequest(s) linked to closed Event "%s" (id=%d).',
                deleted_count, instance.title, instance.pk
            )
