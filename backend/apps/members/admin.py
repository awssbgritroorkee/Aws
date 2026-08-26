from django.contrib import admin
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
