from django.db import models
from django.contrib.auth.models import User


class Member(models.Model):
    CATEGORY_CHOICES = (
        ('LEADERSHIP', 'Group Leader & Faculty'),
        ('FOUNDING', 'Founding Member'),
        ('CORE', 'Core Member'),
    )
    """
    Represents a team member shown on the /team page.
    priority_order controls display order: lower numbers appear first,
    ensuring leadership (e.g. Aditya Raj) is always pinned at the top.

    The `user` OneToOneField is the cornerstone of the Permission Gateway:
    only users linked to a Member profile can be granted is_staff,
    is_superuser, or group/permission assignments via the admin panel.
    """
    # ── Permission Gateway Link ────────────────────────────────────────────────
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_profile',
        help_text=(
            'Link this team member to a Django user account. '
            'Only linked users can be granted admin permissions (is_staff / is_superuser).'
        ),
    )

    # ── Public Profile Fields ──────────────────────────────────────────────────
    name           = models.CharField(max_length=100)
    role           = models.CharField(max_length=100)
    badge          = models.CharField(
                        max_length=50, blank=True,
                        help_text='e.g. "⭐ Advisor" or "Group Lead"')
    tagline        = models.CharField(max_length=200, blank=True)
    bio            = models.TextField(blank=True)
    image          = models.ImageField(upload_to='members/', blank=True, null=True)
    skills         = models.JSONField(default=list, blank=True)
    linkedin       = models.URLField(blank=True)
    instagram      = models.URLField(blank=True)
    portfolio_url  = models.URLField(max_length=255, blank=True, null=True)
    is_lead        = models.BooleanField(default=False)
    category       = models.CharField(
                        max_length=20,
                        choices=CATEGORY_CHOICES,
                        default='CORE',
                        help_text='Controls which section this member appears in on the Team page.')
    priority_order = models.PositiveSmallIntegerField(
                        default=10,
                        help_text='Display order — lower number = closer to top (within each category).')

    class Meta:
        ordering = ['priority_order', 'name']
        verbose_name        = 'Team Member'
        verbose_name_plural = 'Team Members'

    def __str__(self):
        linked = f' → @{self.user.username}' if self.user_id else ''
        return f'{self.name} ({self.role}){linked}'
