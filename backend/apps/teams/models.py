from django.db import models


class TeamRequest(models.Model):
    project       = models.CharField(max_length=200)
    description   = models.TextField(blank=True)
    skills_needed = models.CharField(max_length=300, blank=True,
                                     help_text='Comma-separated list of skills')
    contact       = models.CharField(max_length=200, blank=True,
                                     help_text='Email or Discord handle')
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.project
