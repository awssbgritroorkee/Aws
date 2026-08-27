from django.db import models
from django.contrib.auth.models import User


CATEGORY_CHOICES = (
    ('Workshop',   'Workshop'),
    ('Hackathon',  'Hackathon'),
    ('Project',    'Project Showcase'),
    ('Meetup',     'Meetup / Community'),
    ('Bootcamp',   'Cloud Bootcamp'),
    ('Other',      'Other'),
)


class GalleryAlbum(models.Model):
    """
    An event-based photo album shown in the public Gallery section.
    Each album can have up to 5 GalleryImage children (enforced in admin).
    """
    title       = models.CharField(max_length=100)
    category    = models.CharField(
                    max_length=50,
                    choices=CATEGORY_CHOICES,
                    default='Other',
                    help_text='Event type — used as a filter tag on the frontend.')
    description = models.TextField(blank=True, null=True)
    event_date  = models.DateField(help_text='Date the event took place.')
    created_by  = models.ForeignKey(
                    User,
                    on_delete=models.SET_NULL,
                    null=True,
                    blank=True,
                    related_name='gallery_albums',
                    help_text='Admin who created this album.')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-event_date', '-created_at']
        verbose_name    = 'Gallery Album'
        verbose_name_plural = 'Gallery Albums'

    def __str__(self):
        return f'{self.title} ({self.category} — {self.event_date})'

    @property
    def cover_image(self):
        """Returns the first image URL for use as a cover/thumbnail."""
        first = self.images.first()
        return first.image if first else None


class GalleryImage(models.Model):
    """
    A single photo belonging to a GalleryAlbum.
    Max 5 images per album (enforced by max_num=5 in TabularInline).
    """
    album   = models.ForeignKey(
                GalleryAlbum,
                on_delete=models.CASCADE,
                related_name='images',
                help_text='Parent album this image belongs to.')
    image   = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        verbose_name        = 'Gallery Image'
        verbose_name_plural = 'Gallery Images'

    def __str__(self):
        return self.caption or f'Image #{self.pk} — {self.album.title}'
