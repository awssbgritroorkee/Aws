from django.db import models
from cloudinary.models import CloudinaryField


class GalleryPhoto(models.Model):
    """
    A single event photo shown in the public Gallery section.
    Images are mandatory and hosted on Cloudinary.
    title is an optional caption for the photo.
    """
    title       = models.CharField(max_length=200, blank=True)
    image       = CloudinaryField('image')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-uploaded_at']
        verbose_name    = 'Gallery Photo'
        verbose_name_plural = 'Gallery Photos'

    def __str__(self):
        return self.title or f'Photo #{self.pk}'
