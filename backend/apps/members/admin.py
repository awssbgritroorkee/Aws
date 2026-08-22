from django.contrib import admin
from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display   = ['priority_order', 'name', 'role', 'badge', 'is_lead']
    list_editable  = ['priority_order', 'is_lead']
    list_display_links = ['name']
    ordering       = ['priority_order']
    search_fields  = ['name', 'role', 'badge']
    list_filter    = ['is_lead']
    readonly_fields = []

    fieldsets = (
        ('Identity', {
            'fields': ('name', 'role', 'badge', 'tagline', 'bio', 'image'),
        }),
        ('Skills & Links', {
            'fields': ('skills', 'linkedin', 'instagram'),
        }),
        ('Display Settings', {
            'fields': ('is_lead', 'priority_order'),
            'description': 'Lower priority_order = appears first in the team list.',
        }),
    )
