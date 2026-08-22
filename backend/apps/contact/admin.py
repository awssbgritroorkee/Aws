from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields = True
    warn_unsaved_form = False

    # ── List view ───────────────────────────────────────────────────────────
    list_display        = ['name', 'email', 'year', 'domains_preview', 'created_at']
    list_filter         = ['year']
    search_fields       = ['name', 'email']
    ordering            = ['-created_at']
    date_hierarchy      = 'created_at'

    # All fields are read-only — messages come from the public form only
    readonly_fields = ['name', 'email', 'message', 'year', 'domains', 'created_at']

    fieldsets = (
        ('👤 Applicant', {
            'fields': ('name', 'email', 'year'),
        }),
        ('📝 Message', {
            'fields': ('message', 'domains'),
        }),
        ('🕒 Meta', {
            'fields': ('created_at',),
        }),
    )

    @admin.display(description='Domains')
    def domains_preview(self, obj):
        if obj.domains:
            return ', '.join(obj.domains[:3]) + ('…' if len(obj.domains) > 3 else '')
        return '—'

    def has_add_permission(self, request):
        """Messages come only from the public form — prevent manual creation."""
        return False
