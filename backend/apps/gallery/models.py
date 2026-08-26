from django.db import models
from django.contrib.auth.models import User


class GalleryPhoto(models.Model):
    """
    A single event photo shown in the public Gallery section.
    title is an optional caption for the photo.
    """
    title       = models.CharField(max_length=200, blank=True)
    image       = models.ImageField(upload_to='gallery/')
    created_by  = models.ForeignKey(
                    User,
                    on_delete=models.SET_NULL,
                    null=True,
                    blank=True,
                    related_name='gallery_photos',
                    help_text='User who uploaded this photo. Preserved if user is deleted.')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-uploaded_at']
        verbose_name    = 'Gallery Photo'
        verbose_name_plural = 'Gallery Photos'

    def __str__(self):
        return self.title or f'Photo #{self.pk}'
