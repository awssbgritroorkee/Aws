from django.db import models
from django.contrib.auth.models import User


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
