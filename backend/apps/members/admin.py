from django.contrib import admin
from django.contrib.admin.models import LogEntry
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Member


@admin.register(Member)
class MemberAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields   = True
    warn_unsaved_form   = True

    # ── List view ───────────────────────────────────────────────────────────
    list_display        = ['priority_order', 'name', 'role', 'badge_label', 'is_lead_badge']
    list_editable       = ['priority_order']
    list_display_links  = ['name']
    ordering            = ['priority_order']
    search_fields       = ['name', 'role', 'badge']
    list_filter         = ['is_lead']

    # ── Detail form ─────────────────────────────────────────────────────────
    fieldsets = (
        ('🔐 Permission Gateway', {
            'fields': ('user',),
            'description': (
                'Link a Django user account to this team member. '
                'Once linked, that user can be granted is_staff / is_superuser '
                'from the Users admin panel.'
            ),
        }),
        ('👤 Identity', {
            'fields': ('name', 'role', 'badge', 'tagline', 'bio', 'image'),
        }),
        ('🔗 Skills & Links', {
            'fields': ('skills', 'linkedin', 'instagram'),
        }),
        ('⚙️ Display Settings', {
            'fields': ('is_lead', 'priority_order'),
            'description': 'Lower priority_order = appears first in the team list.',
        }),
    )

    @display(description='Badge', label=True)
    def badge_label(self, obj):
        return obj.badge or '—'

    @display(description='Lead', boolean=True)
    def is_lead_badge(self, obj):
        return obj.is_lead


@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields = True

    # What columns to show in the table
    list_display = ['action_time', 'user', 'action_flag', 'content_type', 'object_repr']

    # Add filters on the right side
    list_filter = ['action_time', 'user', 'action_flag', 'content_type']

    # Add a search bar
    search_fields = ['object_repr', 'change_message']

    # Make everything READ-ONLY (No one can fake or delete logs)
    readonly_fields = [
        'action_time', 'user', 'content_type', 'object_id',
        'object_repr', 'action_flag', 'change_message'
    ]

    # Security blocks: Prevent anyone (even superusers) from adding, editing, or deleting log entries
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
