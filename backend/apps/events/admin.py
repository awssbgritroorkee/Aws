from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Event


@admin.register(Event)
class EventAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields   = True
    warn_unsaved_form   = True

    # ── List view ───────────────────────────────────────────────────────────
    list_display        = ['title', 'date', 'status_badge', 'is_registration_open', 'registration_link']
    list_filter         = ['status']
    list_editable       = []          # status editing moved to change form
    list_display_links  = ['title']
    date_hierarchy      = 'date'
    search_fields       = ['title', 'description']
    ordering            = ['-date']

    readonly_fields     = ['created_by']

    # ── Detail form ─────────────────────────────────────────────────────────
    fieldsets = (
        ('📅 Event Details', {
            'fields': ('title', 'date', 'status', 'description', 'poster', 'created_by'),
        }),
        ('🔗 Registration', {
            'fields': ('registration_link', 'meeting_link', 'is_registration_open'),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    @display(description='Status', label={
        'upcoming': 'info',
        'ongoing':  'warning',
        'past':     'success',
    })
    def status_badge(self, obj):
        return obj.status
