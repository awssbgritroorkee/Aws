from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import GalleryPhoto


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields   = True
    warn_unsaved_form   = True

    # ── List view ───────────────────────────────────────────────────────────
    list_display    = ['title', 'uploaded_at']
    readonly_fields = ['uploaded_at']
    search_fields   = ['title']
    ordering        = ['-uploaded_at']
    date_hierarchy  = 'uploaded_at'
