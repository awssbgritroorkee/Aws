from django.db import models
from cloudinary.models import CloudinaryField


class Event(models.Model):
    """
    Represents a chapter event — workshop, bootcamp, hackathon, etc.
    status drives which tab it appears in on the frontend (upcoming/past).
    poster is Cloudinary-hosted so it survives PaaS restarts.
    """
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('past',     'Past'),
    ]

    title             = models.CharField(max_length=200)
    date              = models.DateField()
    description       = models.TextField(blank=True)
    poster            = CloudinaryField('image', blank=True, null=True)
    status            = models.CharField(
                            max_length=10,
                            choices=STATUS_CHOICES,
                            default='upcoming',
                            db_index=True)
    registration_link = models.URLField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-date']
        verbose_name    = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return f'{self.title} ({self.get_status_display()} — {self.date})'
