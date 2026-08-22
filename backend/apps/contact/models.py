from django.db import models


class ContactMessage(models.Model):
    """
    Stores a membership application / contact submission from the frontend form.
    This model is write-only from the public API — no GET endpoint is exposed.
    Messages are reviewed and managed exclusively through Django Admin.
    """
    name       = models.CharField(max_length=100)
    email      = models.EmailField()
    message    = models.TextField()
    year       = models.CharField(
                    max_length=20, blank=True,
                    help_text='Academic year, e.g. "2nd Year"')
    domains    = models.JSONField(
                    default=list, blank=True,
                    help_text='List of selected interest domains from the form')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering        = ['-created_at']
        verbose_name    = 'Contact Message'
        verbose_name_plural = 'Contact Messages'

    def __str__(self):
        return f'{self.name} <{self.email}> — {self.created_at:%Y-%m-%d %H:%M}'
