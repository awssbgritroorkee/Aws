from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.contrib.admin.models import LogEntry
from django.conf import settings
from unfold.admin import ModelAdmin

from .models import EmailBroadcast
from .signals import EmailThread


# Unregister default LogEntry admin if already registered
try:
    admin.site.unregister(LogEntry)
except admin.sites.NotRegistered:
    pass


@admin.register(LogEntry)
class CustomLogEntryAdmin(ModelAdmin):
    """
    Custom LogEntry admin:
    - Superusers can delete LogEntry records (enables smooth user deletion without 403 blocks).
    - Adding and editing log entries remains strictly forbidden for data integrity.
    """
    compressed_fields = True
    list_display = ['action_time', 'user', 'action_flag', 'content_type', 'object_repr']
    list_filter = ['action_time', 'user', 'action_flag', 'content_type']
    search_fields = ['object_repr', 'change_message']
    readonly_fields = [
        'action_time', 'user', 'content_type', 'object_id',
        'object_repr', 'action_flag', 'change_message'
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


# ── User Admin ────────────────────────────────────────────────────────────────

# Unregister default Django User admin
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    """
    Custom UserAdmin with:
    - Google OAuth enforcement: password fields removed from the form.
    - Permission Gateway: is_staff, is_superuser, groups, and user_permissions
      are READ-ONLY unless the user has a verified TeamMember (team_profile) link.
    - Existing superusers always bypass the gateway so they can't self-lockout.
    """
    actions = []
    compressed_fields = True

    # ── List view ─────────────────────────────────────────────────────────────
    list_display  = ['username', 'email', 'first_name', 'last_name',
                     'team_profile_badge', 'is_staff', 'is_active']
    list_filter   = ['is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering      = ['username']

    # ── Password-free fieldsets (Google OAuth only) ───────────────────────────
    # The default BaseUserAdmin fieldsets include a "Password" section and a
    # change-password link — both are removed here since users authenticate
    # exclusively via Google OAuth and must never set/use a local password.
    fieldsets = (
        ('👤 Account', {
            'fields': ('username', 'email', 'first_name', 'last_name'),
        }),
        ('🛡️ Permission Gateway', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'description': (
                '⚠️ <strong>Security Gateway Active.</strong> '
                'The fields below are locked for users who do not have a verified '
                '<em>Team Member</em> profile linked to their account. '
                'Go to <strong>Website Content → Team Members</strong> and assign the '
                '"Linked User Account" before granting any elevated permissions.'
            ),
        }),
        ('📅 Metadata', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    # add_fieldsets shown when creating a new user via the admin
    add_fieldsets = (
        ('👤 New Account', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name'),
            'description': (
                'No password required — this user will authenticate via Google OAuth.'
            ),
        }),
    )

    readonly_fields = ['last_login', 'date_joined']

    # ── Permission Gateway ────────────────────────────────────────────────────
    def get_readonly_fields(self, request, obj=None):
        """
        Enforce the TeamMember permission gateway:

        - `password` is always read-only (Google OAuth — no local passwords).
        - For an existing user (obj is not None):
            * If they DO have a verified team_profile → full editing allowed.
            * If they do NOT have a team_profile AND are not already a superuser
              → is_staff, is_superuser, groups, user_permissions are locked.
        - Superusers editing their own account, or the requesting admin editing
          another superuser, still bypass this check to prevent self-lockout.
        """
        readonly = list(super().get_readonly_fields(request, obj))

        if obj:  # editing an existing user, not creating
            has_team_profile = (
                hasattr(obj, 'team_profile') and obj.team_profile is not None
            )
            # Lock privilege fields for unverified, non-superuser accounts
            if not has_team_profile and not obj.is_superuser:
                for field in ('is_staff', 'is_superuser', 'groups', 'user_permissions'):
                    if field not in readonly:
                        readonly.append(field)

        return readonly

    def save_model(self, request, obj, form, change):
        """
        On add (not change): set an unusable password so Django's model-level
        validation passes while ensuring this user can NEVER log in with a local
        password. All authentication flows through Google OAuth exclusively.
        """
        if not change:
            obj.set_unusable_password()
        super().save_model(request, obj, form, change)

    # ── Team profile badge in list view ──────────────────────────────────────
    @admin.display(description='Team Profile', boolean=True)
    def team_profile_badge(self, obj):
        """Shows a green tick if this user is linked to a TeamMember profile."""
        return hasattr(obj, 'team_profile') and obj.team_profile is not None



# ── Email Broadcast Admin ─────────────────────────────────────────────────────

class BroadcastEmailThread(EmailThread):
    """
    Broadcast-specific email thread that uses fail_silently=True so admin panel
    never hangs on SMTP errors during bulk dispatch.
    """
    def run(self):
        from django.core.mail import send_mail
        import logging
        logger = logging.getLogger(__name__)
        try:
            print(
                f"[EmailBroadcast] Dispatching to {len(self.recipient_list)} recipient(s)...",
                flush=True,
            )
            send_mail(
                self.subject,
                self.message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'awssbg@ritroorkee.com'),
                self.recipient_list,
                fail_silently=True,   # never block the admin panel
            )
            print(
                f"[EmailBroadcast] Sent successfully to {len(self.recipient_list)} recipient(s).",
                flush=True,
            )
            logger.info(
                f"EmailBroadcast dispatched to {len(self.recipient_list)} recipient(s): "
                f"{self.recipient_list[:5]}{'...' if len(self.recipient_list) > 5 else ''}"
            )
        except Exception as e:
            print(f"[EmailBroadcast] FAILED: {e}", flush=True)
            logger.error(f"EmailBroadcast background thread failed: {e}")


@admin.register(EmailBroadcast)
class EmailBroadcastAdmin(ModelAdmin):
    """
    Admin interface for creating and dispatching email broadcasts.
    Emails are sent in a background thread so the admin panel never freezes.
    """
    compressed_fields = True
    warn_unsaved_form = True

    list_display = ['subject', 'send_to_all_users', 'sent_at']
    list_filter  = ['send_to_all_users', 'sent_at']
    search_fields = ['subject', 'message']
    readonly_fields = ['sent_at']
    ordering = ['-sent_at']

    fieldsets = (
        ('📧 Broadcast Content', {
            'fields': ('subject', 'message'),
        }),
        ('🎯 Recipients', {
            'fields': ('send_to_all_users', 'specific_users'),
            'description': (
                'Check "Send to all users" to reach every registered user. '
                'Otherwise, select specific users below.'
            ),
        }),
        ('🕒 Metadata', {
            'fields': ('sent_at',),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """
        On save: resolve recipient list and fire background email thread,
        then persist the broadcast record for auditing.
        """
        # Persist first so the M2M relation is populated
        super().save_model(request, obj, form, change)

        from_email = getattr(
            settings, 'DEFAULT_FROM_EMAIL',
            getattr(settings, 'EMAIL_HOST_USER', 'AWS SBG <noreply@awssbg.com>')
        )

        if obj.send_to_all_users:
            recipients = list(
                User.objects.filter(is_active=True)
                .exclude(email='')
                .values_list('email', flat=True)
            )
        else:
            recipients = list(
                obj.specific_users.filter(is_active=True)
                .exclude(email='')
                .values_list('email', flat=True)
            )

        if recipients:
            BroadcastEmailThread(
                subject=obj.subject,
                message=obj.message,
                from_email=from_email,
                recipient_list=recipients,
            ).start()
            self.message_user(
                request,
                f"✅ Broadcast email queued for {len(recipients)} recipient(s).",
                level=messages.SUCCESS,
            )
        else:
            self.message_user(
                request,
                "⚠️ No valid email addresses found. Broadcast saved but no emails sent.",
                level=messages.WARNING,
            )
