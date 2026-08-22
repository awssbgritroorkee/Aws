from django.db import models
from cloudinary.models import CloudinaryField


class Member(models.Model):
    """
    Represents a team member shown on the /team page.
    Images are hosted on Cloudinary — no local media storage needed.
    priority_order controls display order: lower numbers appear first,
    ensuring leadership (e.g. Aditya Raj) is always pinned at the top.
    """
    name           = models.CharField(max_length=100)
    role           = models.CharField(max_length=100)
    badge          = models.CharField(
                        max_length=50, blank=True,
                        help_text='e.g. "⭐ Advisor" or "Group Lead"')
    tagline        = models.CharField(max_length=200, blank=True)
    bio            = models.TextField(blank=True)
    image          = CloudinaryField('image', blank=True, null=True)
    skills         = models.JSONField(default=list, blank=True)
    linkedin       = models.URLField(blank=True)
    instagram      = models.URLField(blank=True)
    is_lead        = models.BooleanField(default=False)
    priority_order = models.PositiveSmallIntegerField(
                        default=10,
                        help_text='Display order — lower number = closer to top.')

    class Meta:
        ordering = ['priority_order', 'name']
        verbose_name        = 'Team Member'
        verbose_name_plural = 'Team Members'

    def __str__(self):
        return f'{self.name} ({self.role})'
