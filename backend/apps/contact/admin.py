from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import action, display
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields = True
    warn_unsaved_form = False

    # ── List view ───────────────────────────────────────────────────────────
    list_display        = ['read_badge', 'name', 'email', 'mobile', 'year', 'created_at']
    list_display_links  = ['name']
    list_filter         = ['is_read', 'year']
    search_fields       = ['name', 'email', 'mobile']
    ordering            = ['is_read', '-created_at']  # Unread (False) first, newest within each group
    date_hierarchy      = 'created_at'

    # ── Bulk actions ────────────────────────────────────────────────────────
    actions = ['mark_as_read', 'mark_as_unread']

    # All public form fields are read-only; only is_read is toggleable
    readonly_fields = ['name', 'email', 'mobile', 'message', 'year', 'domains', 'created_at']

    fieldsets = (
        ('📬 Read Status', {
            'fields': ('is_read',),
            'description': 'Toggle to mark as reviewed. Unread messages appear in the sidebar badge counter.',
        }),
        ('👤 Applicant', {
            'fields': ('name', 'email', 'mobile', 'year'),
        }),
        ('📝 Message', {
            'fields': ('message', 'domains'),
        }),
        ('🕒 Meta', {
            'fields': ('created_at',),
        }),
    )

    # ── Custom display: coloured read/unread dot ─────────────────────────────
    @display(description='')
    def read_badge(self, obj):
        if obj.is_read:
            return format_html(
                '<span title="Read" style="display:inline-block;width:10px;height:10px;'
                'border-radius:50%;background:#22c55e;"></span>'
            )
        return format_html(
            '<span title="Unread" style="display:inline-block;width:10px;height:10px;'
            'border-radius:50%;background:#f59e0b;"></span>'
        )

    # ── Bulk actions ─────────────────────────────────────────────────────────
    @admin.action(description='✅ Mark selected messages as Read')
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} message(s) marked as read.')

    @admin.action(description='🔵 Mark selected messages as Unread')
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} message(s) marked as unread.')

    def has_add_permission(self, request):
        """Messages come only from the public form — prevent manual creation."""
        return False
