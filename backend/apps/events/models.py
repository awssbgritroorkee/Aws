from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify


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
    date              = models.DateTimeField(
                            default=timezone.now,
                            help_text='Set the exact date AND time for the event (e.g. 2026-09-05 10:00). '
                                      'The frontend countdown timer uses this precise timestamp.')
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
    slug              = models.SlugField(
                            max_length=255,
                            unique=True,
                            null=True,
                            blank=True,
                            help_text='Auto-generated from title. Used in shareable deep-link URLs (e.g. /events?event=smart-india-hackathon).')
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

    def save(self, *args, **kwargs):
        """Auto-generate slug from title on first save; preserve manual overrides."""
        if not self.slug and self.title:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            # Ensure uniqueness if two events share a title
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.title} ({self.get_status_display()} — {self.date})'
