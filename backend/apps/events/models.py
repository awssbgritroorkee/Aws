from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    """
    Represents a chapter event — workshop, bootcamp, hackathon, etc.
    status drives which tab it appears in on the frontend (upcoming/past).
    """
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('past',     'Past'),
    ]

    title             = models.CharField(max_length=200)
    date              = models.DateField()
    description       = models.TextField(blank=True)
    poster            = models.ImageField(upload_to='events/', blank=True, null=True)
    status            = models.CharField(
                            max_length=10,
                            choices=STATUS_CHOICES,
                            default='upcoming',
                            db_index=True)
    registration_link      = models.URLField(blank=True)
    is_registration_open   = models.BooleanField(
                                default=True,
                                help_text='Uncheck to close registrations. The Register button will become disabled on the frontend.')
    created_by        = models.ForeignKey(
                            User,
                            on_delete=models.SET_NULL,
                            null=True,
                            blank=True,
                            related_name='events',
                            help_text='User who created this event. Preserved if user is deleted.')
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-date']
        verbose_name    = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return f'{self.title} ({self.get_status_display()} — {self.date})'
