from django.contrib import admin
from .models import GalleryPhoto


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(admin.ModelAdmin):
    list_display    = ['title', 'uploaded_at']
    readonly_fields = ['uploaded_at']
    search_fields   = ['title']
    ordering        = ['-uploaded_at']
