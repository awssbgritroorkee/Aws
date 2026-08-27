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
    list_display        = ['priority_order', 'name', 'role', 'badge_label', 'category_badge', 'is_lead_badge']
    list_editable       = ['priority_order', 'category']
    list_display_links  = ['name']
    ordering            = ['priority_order']
    search_fields       = ['name', 'role', 'badge']
    list_filter         = ['category', 'is_lead']

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
            'fields': ('category', 'is_lead', 'priority_order'),
            'description': (
                'category controls which section of the Team page this member appears in. '
                'Lower priority_order = appears first within that section.'
            ),
        }),
    )

    @display(description='Badge', label=True)
    def badge_label(self, obj):
        return obj.badge or '—'

    @display(description='Category', label=True)
    def category_badge(self, obj):
        labels = {'LEADERSHIP': 'Leadership', 'CORE': 'Core Team'}
        return labels.get(obj.category, obj.category)

    @display(description='Lead', boolean=True)
    def is_lead_badge(self, obj):
        return obj.is_lead
