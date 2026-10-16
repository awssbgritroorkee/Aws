"""
Management command: reset_streaks
──────────────────────────────────────────────────────────────────────────────
Runs the daily streak-reset job. Should be scheduled to execute at exactly
12:00 AM (midnight, IST) every day via:

  • Render.com Cron Jobs  → 0 18 * * *  (18:30 UTC = 00:00 IST)
  • Linux/server crontab  → 30 18 * * * python manage.py reset_streaks
  • Windows Task Scheduler (local dev) — set as a daily scheduled task

Logic
─────
1. Identify every BuilderProfile where:
     last_checkin_date IS NOT NULL   AND
     last_checkin_date < today (IST) AND
     last_checkin_date < yesterday   (i.e. missed at least one day)
2. Bulk-reset their current_streak to 0.
3. Log and report how many profiles were reset.

Core-team profiles are also reset (their streak is cosmetic only — Fair Play
ensures their XP is never modified by the visit tracker).

Usage
─────
    python manage.py reset_streaks              # standard run
    python manage.py reset_streaks --dry-run   # preview without saving
"""
import datetime
import logging

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from apps.accounts.models import BuilderProfile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        'Resets current_streak to 0 for every user who missed a visit yesterday. '
        'Schedule this to run at 00:00 IST (18:30 UTC) daily.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Preview how many profiles would be reset, without actually saving.',
        )

    def handle(self, *args, **options):
        dry_run  = options['dry_run']
        today    = timezone.localdate()          # uses TIME_ZONE = 'Asia/Kolkata'
        yesterday = today - datetime.timedelta(days=1)

        # ── Identify profiles that missed yesterday ──────────────────────────
        # Condition: last_checkin_date is set BUT is older than yesterday.
        # This covers:
        #   • Visited 2+ days ago (classic streak break)
        #   • Never visited but somehow has a streak > 0 (data anomaly guard)
        stale_qs = BuilderProfile.objects.filter(
            current_streak__gt=0,               # only worth resetting if streak > 0
        ).exclude(
            last_checkin_date=today,             # still active today (very edge case)
        ).exclude(
            last_checkin_date=yesterday,         # visited yesterday — streak intact
        )

        count = stale_qs.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'[DRY RUN] Would reset streak for {count} profile(s). No changes saved.'
                )
            )
            for profile in stale_qs.select_related('user')[:20]:
                self.stdout.write(
                    f'  → {profile.user.username} | streak={profile.current_streak} '
                    f'| last_visit={profile.last_checkin_date}'
                )
            return

        # ── Bulk reset ───────────────────────────────────────────────────────
        with transaction.atomic():
            updated = stale_qs.update(current_streak=0)

        logger.info(
            '[Streak Reset] Midnight cron: reset current_streak=0 for %d profile(s) on %s',
            updated, today.isoformat(),
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Streak reset complete: {updated} profile(s) reset to 0 '
                f'(missed visit before {today.isoformat()}).'
            )
        )
