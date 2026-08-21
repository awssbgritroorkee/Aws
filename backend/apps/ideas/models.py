from django.db import models


class Idea(models.Model):
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    author      = models.CharField(max_length=100, blank=True, default='Anonymous')
    tags        = models.JSONField(default=list, blank=True)
    votes       = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-votes', '-created_at']

    def __str__(self):
        return self.title
