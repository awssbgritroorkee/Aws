from django.db import models


class Member(models.Model):
    name     = models.CharField(max_length=100)
    role     = models.CharField(max_length=100)
    tagline  = models.CharField(max_length=200, blank=True)
    bio      = models.TextField(blank=True)
    photo    = models.ImageField(upload_to='members/', blank=True, null=True)
    skills   = models.JSONField(default=list, blank=True)
    linkedin = models.URLField(blank=True)
    github   = models.URLField(blank=True)
    is_lead  = models.BooleanField(default=False)
    order    = models.PositiveSmallIntegerField(default=0,
                                               help_text='Display order (lower = first)')

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f'{self.name} ({self.role})'
