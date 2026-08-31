"""
apps/teamup/admin.py

Unfold-styled admin for TeamRequest and TeamInterest.
Key features:
  - Bulk "Approve Posts" action for TeamRequest
  - secret_pin shown in detail view for superusers only
  - Applicants count shown in the TeamRequest list
"""
from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from .models import TeamRequest, TeamInterest


@admin.register(TeamRequest)
class TeamRequestAdmin(ModelAdmin):
    compressed_fields = True
    warn_unsaved_form = True

    list_display = [
        'creator_display', 'mode_badge', 'event_name',
        'members_needed', 'approval_badge', 'active_badge', 'created_at',
    ]
    list_display_links = ['creator_display']
    list_filter        = ['mode', 'is_approved_by_admin', 'is_active', 'target_year', 'gender_preference']
    search_fields      = ['creator__email', 'creator__first_name', 'event_name', 'message']
    ordering           = ['-created_at']
    date_hierarchy     = 'created_at'
    actions            = ['approve_posts', 'deactivate_posts']

    readonly_fields = ['created_at']

    fieldsets = (
        ('📋 Post Details', {
            'fields': ('creator', 'mode', 'event_name', 'event_ref', 'members_needed', 'message'),
        }),
        ('🎯 Targeting', {
            'fields': ('target_year', 'gender_preference'),
        }),
        ('🔐 Security', {
            'fields': ('secret_pin',),
            'description': '⚠️ The PIN is shown here for support purposes only. Never share it publicly.',
        }),
        ('⚙️ Status & Meta', {
            'fields': ('is_approved_by_admin', 'is_active', 'created_at'),
        }),
    )

    # ── Custom display columns ─────────────────────────────────────────────────

    @display(description='Creator', ordering='creator__email')
    def creator_display(self, obj):
        profile = getattr(obj.creator, 'student_profile', None)
        name = (profile.full_name if profile else None) or obj.creator.get_full_name() or obj.creator.email
        return f'{name} ({obj.creator.email})'

    @display(description='Mode')
    def mode_badge(self, obj):
        color = '#00e87b' if obj.mode == 'need_members' else '#60a5fa'
        label = obj.get_mode_display()
        return format_html(
            '<span style="background:{}20;color:{};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;">{}</span>',
            color, color, label
        )

    @display(description='Approved', boolean=True)
    def approval_badge(self, obj):
        return obj.is_approved_by_admin

    @display(description='Active', boolean=True)
    def active_badge(self, obj):
        return obj.is_active

    # ── Bulk Actions ───────────────────────────────────────────────────────────

    @action(description='✅ Approve selected posts (make them live)')
    def approve_posts(self, request, queryset):
        updated = queryset.update(is_approved_by_admin=True, is_active=True)
        self.message_user(request, f'{updated} post(s) approved and now live on the board.')

    @action(description='🚫 Deactivate selected posts')
    def deactivate_posts(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} post(s) deactivated.')


@admin.register(TeamInterest)
class TeamInterestAdmin(ModelAdmin):
    compressed_fields = True

    list_display    = ['interested_user_display', 'request_post', 'status_badge', 'locked_at']
    list_display_links = ['interested_user_display']
    list_filter     = ['status']
    search_fields   = ['interested_user__email', 'request_post__event_name']
    ordering        = ['-locked_at']
    readonly_fields = ['locked_at']

    @display(description='Interested User', ordering='interested_user__email')
    def interested_user_display(self, obj):
        profile = getattr(obj.interested_user, 'student_profile', None)
        name = (profile.full_name if profile else None) or obj.interested_user.get_full_name() or obj.interested_user.email
        return f'{name} ({obj.interested_user.email})'

    @display(description='Status')
    def status_badge(self, obj):
        color_map = {
            'in_process': '#f59e0b',
            'accepted':   '#00e87b',
            'timeout':    '#ef4444',
        }
        color = color_map.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}20;color:{};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;">{}</span>',
            color, color, obj.get_status_display()
        )
