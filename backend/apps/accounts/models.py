from django.db import models
from django.contrib.auth.models import User


# ─────────────────────────────────────────────────────────────────────────────
# BuilderProfile — Gamification: XP, Streaks, Fair Play
# ─────────────────────────────────────────────────────────────────────────────

class BuilderProfile(models.Model):
    """
    Extended profile for every registered user that drives the gamification
    engine (XP points, daily streaks) displayed on the Student Dashboard.

    Fair Play:
        Core team members (is_core_team=True) are EXCLUDED from the public
        leaderboard and their XP is never modified by the check-in API.
        This prevents staff from dominating student rankings.
    """
    user              = models.OneToOneField(
                            User,
                            on_delete=models.CASCADE,
                            related_name='builder_profile',
                            help_text='The Django user this profile belongs to.'
                        )
    xp_points         = models.IntegerField(
                            default=0,
                            help_text='Accumulated XP points earned through check-ins and activities.'
                        )
    current_streak    = models.IntegerField(
                            default=0,
                            help_text='Number of consecutive daily check-in days.'
                        )
    longest_streak    = models.IntegerField(
                            default=0,
                            help_text='All-time longest consecutive check-in streak.'
                        )
    last_checkin_date = models.DateField(
                            null=True,
                            blank=True,
                            help_text='Date of the most recent daily check-in.'
                        )
    is_core_team      = models.BooleanField(
                            default=False,
                            help_text=(
                                'Set True for AWS SBG core team members. '
                                'Disables leaderboard XP tracking for Fair Play — '
                                'staff cannot dominate the student leaderboard.'
                            )
                        )
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Builder Profile'
        verbose_name_plural = 'Builder Profiles'
        ordering            = ['-xp_points', '-current_streak']

    def __str__(self):
        role = '🛡️ Core Team' if self.is_core_team else '🧑‍💻 Student'
        return f'{role} | {self.user.get_full_name() or self.user.username} — {self.xp_points} XP | Streak: {self.current_streak}'


# ─────────────────────────────────────────────────────────────────────────────
# EmailBroadcast — Bulk email tool for admin panel
# ─────────────────────────────────────────────────────────────────────────────

class EmailBroadcast(models.Model):
    """
    Admin-controlled model to send custom bulk or targeted emails to users
    via a background thread, without blocking the admin panel.
    """
    subject = models.CharField(
        max_length=255,
        help_text="Subject line of the broadcast email.",
    )
    message = models.TextField(
        help_text="Body of the broadcast email (plain text).",
    )
    send_to_all_users = models.BooleanField(
        default=False,
        help_text="If checked, the email will be sent to ALL registered users. "
                  "Overrides the 'Specific Users' selection.",
    )
    specific_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='email_broadcasts',
        help_text="Select individual users to receive this email. "
                  "Ignored when 'Send to all users' is enabled.",
    )
    sent_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this broadcast was saved and dispatched.",
    )

    class Meta:
        verbose_name = "Email Broadcast"
        verbose_name_plural = "Email Broadcasts"
        ordering = ['-sent_at']

    def __str__(self):
        ts = self.sent_at.strftime('%Y-%m-%d %H:%M') if self.sent_at else 'unsaved'
        target = "All Users" if self.send_to_all_users else f"{self.specific_users.count()} specific user(s)"
        return f"[{ts}] {self.subject} → {target}"
