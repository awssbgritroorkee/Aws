from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import GalleryAlbum, GalleryImage


class GalleryImageInline(TabularInline):
    """
    Inline editor for GalleryImage inside GalleryAlbum admin.
    max_num=5 hard-caps photos per album in the admin UI.
    """
    model           = GalleryImage
    extra           = 1        # show 1 blank row by default
    max_num         = 5        # absolute maximum photos per album
    fields          = ['image', 'caption']
    verbose_name        = 'Photo'
    verbose_name_plural = 'Photos (max 5)'


@admin.register(GalleryAlbum)
class GalleryAlbumAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields = True
    warn_unsaved_form = True

    # ── List view ───────────────────────────────────────────────────────────
    list_display    = ['title', 'category', 'event_date', 'image_count', 'created_by', 'created_at']
    list_filter     = ['category', 'event_date']
    search_fields   = ['title', 'category', 'description']
    ordering        = ['-event_date']
    date_hierarchy  = 'event_date'
    readonly_fields = ['created_at', 'created_by']

    # ── Inline images ───────────────────────────────────────────────────────
    inlines = [GalleryImageInline]

    # ── Fieldsets ───────────────────────────────────────────────────────────
    fieldsets = (
        ('📸 Album Details', {
            'fields': ('title', 'category', 'event_date', 'description'),
        }),
        ('🔐 Metadata', {
            'fields': ('created_by', 'created_at'),
            'description': 'Auto-filled on save. Read-only.',
        }),
    )

    def image_count(self, obj):
        count = obj.images.count()
        return f'{count} / 5'
    image_count.short_description = 'Photos'

    def save_model(self, request, obj, form, change):
        """Auto-assign the logged-in admin as creator on first save."""
        if not obj.pk and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
