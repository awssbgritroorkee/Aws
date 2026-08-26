from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import GalleryPhoto


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields   = True
    warn_unsaved_form   = True

    # ── List view ───────────────────────────────────────────────────────────
    list_display    = ['title', 'created_by', 'uploaded_at']
    readonly_fields = ['uploaded_at', 'created_by']
    search_fields   = ['title']
    ordering        = ['-uploaded_at']
    date_hierarchy  = 'uploaded_at'

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
