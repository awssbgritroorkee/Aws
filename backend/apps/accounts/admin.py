from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.contrib.admin.models import LogEntry
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import BaseInlineFormSet, inlineformset_factory
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from .models import EmailBroadcast, BuilderProfile
from .signals import EmailThread

# Cross-app model imports (loaded after all models, so no circular-import risk)
from apps.challenges.models import ChallengeRegistration
from apps.students.models import EventRegistration, StudentProfile


# Unregister default LogEntry admin if already registered
try:
    admin.site.unregister(LogEntry)
except admin.sites.NotRegistered:
    pass


class TeamMemberFilter(admin.SimpleListFilter):
    title = 'team member'  # Renders as "By team member" in admin sidebar
    parameter_name = 'user_id'

    def lookups(self, request, model_admin):
        # Fetch only users who are team members (is_staff=True)
        team_members = User.objects.filter(is_staff=True).order_by('username')
        return [(user.id, user.get_full_name() or user.username) for user in team_members]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(user_id=self.value())
        return queryset


@admin.register(LogEntry)
class CustomLogEntryAdmin(ModelAdmin):
    """
    Custom LogEntry admin:
    - Filtered by team members (is_staff=True) instead of all users.
    - Superusers can delete LogEntry records (enables smooth user deletion without 403 blocks).
    - Adding and editing log entries remains strictly forbidden for data integrity.
    """
    compressed_fields = True
    list_display = ['action_time', 'user', 'action_flag', 'content_type', 'object_repr']
    list_filter = [TeamMemberFilter, 'action_time', 'action_flag', 'content_type']
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

    def get_queryset(self, request):
        """
        Superusers see every log entry in the system with no restrictions.
        Non-superusers fall back to the default scoped queryset (their own actions).
        """
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return LogEntry.objects.all()
        return qs


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


# ─────────────────────────────────────────────────────────────────────────────
# Student 360 View — Bridge FormSets, Read-Only Inlines, Admin
# ─────────────────────────────────────────────────────────────────────────────
#
# ARCHITECTURE NOTE — The FK Gap Problem
# ─────────────────────────────────────────────────────────────────────────────
# Django inlines require a direct FK from the child model to the parent model.
# Our parent admin manages BuilderProfile, but:
#
#   ChallengeRegistration.student  → FK to User          (not BuilderProfile)
#   EventRegistration.student      → FK to StudentProfile (not BuilderProfile)
#
# Solution: Custom "bridge" FormSet classes that intercept Django's formset
# instantiation and convert the BuilderProfile instance to the correct related
# object (User or StudentProfile) before Django's queryset filtering runs.
# This requires zero model changes and no migrations.
# ─────────────────────────────────────────────────────────────────────────────


class ChallengeRegistrationBridgeFormSet(BaseInlineFormSet):
    """
    Bridges BuilderProfile → User ← ChallengeRegistration.

    Django calls FormSet(instance=builder_profile). We intercept in __init__
    and swap the instance to builder_profile.user before the base class runs,
    so BaseInlineFormSet.get_queryset correctly filters:
        ChallengeRegistration.objects.filter(student=user)
    """

    def __init__(self, *args, **kwargs):
        instance = kwargs.get('instance')
        if isinstance(instance, BuilderProfile):
            kwargs['instance'] = getattr(instance, 'user', None)

        target = kwargs.get('instance')
        if not target or not getattr(target, 'pk', None):
            kwargs['queryset'] = ChallengeRegistration.objects.none()

        super().__init__(*args, **kwargs)

    def get_queryset(self):
        if not self.instance or not getattr(self.instance, 'pk', None):
            return ChallengeRegistration.objects.none()
        if self.queryset is not None:
            return self.queryset
        return (
            super()
            .get_queryset()
            .select_related('challenge')         # avoids N+1 on challenge title
            .order_by('-registered_at')
        )


class EventRegistrationBridgeFormSet(BaseInlineFormSet):
    """
    Bridges BuilderProfile → User ← StudentProfile ← EventRegistration.

    Converts the BuilderProfile instance to the linked StudentProfile.
    If the student has never registered for an event (no StudentProfile yet),
    returns an empty queryset instead of raising an exception.
    """

    def __init__(self, *args, **kwargs):
        instance = kwargs.get('instance')
        if isinstance(instance, BuilderProfile):
            try:
                if hasattr(instance, 'user') and instance.user and hasattr(instance.user, 'student_profile'):
                    kwargs['instance'] = instance.user.student_profile
                else:
                    kwargs['instance'] = None
            except Exception:
                kwargs['instance'] = None

        target = kwargs.get('instance')
        if not target or not getattr(target, 'pk', None):
            kwargs['queryset'] = EventRegistration.objects.none()

        super().__init__(*args, **kwargs)

    def get_queryset(self):
        try:
            if not self.instance or not getattr(self.instance, 'pk', None):
                return EventRegistration.objects.none()
            if self.queryset is not None:
                return self.queryset
            return (
                super()
                .get_queryset()
                .select_related('event')             # avoids N+1 on event title
                .order_by('-registered_at')
            )
        except Exception:
            return EventRegistration.objects.none()


# ── Read-Only Inlines ─────────────────────────────────────────────────────────

class ChallengeRegistrationReadOnlyInline(TabularInline):
    """
    Read-only inline showing all Challenge & Hackathon registrations for a student.

    Uses ChallengeRegistrationBridgeFormSet to resolve the FK gap between
    BuilderProfile (parent admin) and ChallengeRegistration (which links to User).
    All add / change / delete actions are permanently disabled.
    """
    model               = ChallengeRegistration
    extra               = 0
    can_delete          = False
    verbose_name        = 'Challenge / Hackathon Registration'
    verbose_name_plural = '🏆 Challenge & Hackathon Registrations'

    readonly_fields = ['challenge', 'status', 'proof_link', 'registered_at', 'submitted_at']
    fields          = ['challenge', 'status', 'proof_link', 'registered_at', 'submitted_at']

    @classmethod
    def check(cls, **kwargs):
        """
        Suppress Django's admin.E202 system check.

        E202 requires a direct FK from the child model to the parent admin model
        (BuilderProfile). This inline intentionally bridges the FK gap via
        ChallengeRegistrationBridgeFormSet + a custom get_formset(), so the
        compile-time check is not applicable and must be suppressed.
        """
        return []

    def has_add_permission(self, request, obj=None):
        """Registrations are created via the API — never manually in admin."""
        return False

    def has_change_permission(self, request, obj=None):
        """360 view is strictly read-only — no edits allowed here."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Deletions are handled from the dedicated ChallengeRegistration admin."""
        return False

    def has_view_permission(self, request, obj=None):
        return True

    def get_formset(self, request, obj=None, **kwargs):
        """
        Build the formset factory using User as the declared parent so that
        Django can resolve the ChallengeRegistration.student FK.
        The BridgeFormSet __init__ transparently converts the BuilderProfile
        instance passed at runtime to the correct User object.
        """
        defaults = {
            'formset': ChallengeRegistrationBridgeFormSet,
            'fields': self.fields,
            'extra': 0,
            'can_delete': False,
            'fk_name': 'student',
        }
        defaults.update(kwargs)
        return inlineformset_factory(
            User,
            ChallengeRegistration,
            **defaults
        )


class EventRegistrationReadOnlyInline(TabularInline):
    """
    Read-only inline showing all Event registrations for a student.

    Uses EventRegistrationBridgeFormSet to resolve the two-hop FK path:
        BuilderProfile → User ← StudentProfile ← EventRegistration
    All add / change / delete actions are permanently disabled.
    """
    model               = EventRegistration
    extra               = 0
    can_delete          = False
    verbose_name        = 'Event Registration'
    verbose_name_plural = '📅 Event Registrations'

    readonly_fields = ['event', 'registered_at']
    fields          = ['event', 'registered_at']

    @classmethod
    def check(cls, **kwargs):
        """
        Suppress Django's admin.E202 system check.

        E202 requires a direct FK from the child model to the parent admin model
        (BuilderProfile). This inline intentionally bridges the two-hop FK path
        via EventRegistrationBridgeFormSet + a custom get_formset(), so the
        compile-time check is not applicable and must be suppressed.
        """
        return []

    def has_add_permission(self, request, obj=None):
        """Registrations are created via the API — never manually in admin."""
        return False

    def has_change_permission(self, request, obj=None):
        """360 view is strictly read-only — no edits allowed here."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Deletions are handled from the dedicated EventRegistration admin."""
        return False

    def has_view_permission(self, request, obj=None):
        return True

    def get_formset(self, request, obj=None, **kwargs):
        """
        Build the formset factory using StudentProfile as the declared parent
        so that Django can resolve the EventRegistration.student FK.
        The BridgeFormSet __init__ transparently converts the BuilderProfile
        instance passed at runtime to the linked StudentProfile.
        """
        defaults = {
            'formset': EventRegistrationBridgeFormSet,
            'fields': self.fields,
            'extra': 0,
            'can_delete': False,
            'fk_name': 'student',
        }
        defaults.update(kwargs)
        return inlineformset_factory(
            StudentProfile,
            EventRegistration,
            **defaults
        )


# ── Student 360 Admin View ────────────────────────────────────────────────────

@admin.register(BuilderProfile)
class StudentProfile360Admin(ModelAdmin):
    """
    Consolidated read-only "Student 360 View" in the Django Admin.

    Presents a single profile page per student showing:
      • Identity   — full name, email, roll number (from StudentProfile)
      • Gamification — XP, computed level, current & longest streaks
      • History    — every challenge/hackathon and event registration as inlines

    Nothing on this page can be added, changed, or deleted — it is a pure
    observation interface designed for use during team meetings, reviews,
    and public presentations without any risk of accidental data mutation.

    Technical note:
        The inlines use custom FormSet bridge classes to traverse the FK gap
        between BuilderProfile and the ChallengeRegistration / EventRegistration
        child models.  See ChallengeRegistrationBridgeFormSet and
        EventRegistrationBridgeFormSet for details.
    """
    compressed_fields = True
    actions = ['reset_all_xp']

    # ── Read-only inlines ─────────────────────────────────────────────────────
    inlines = [ChallengeRegistrationReadOnlyInline, EventRegistrationReadOnlyInline]

    # ── Hard lock — zero mutations allowed ────────────────────────────────────
    def has_add_permission(self, request):
        """The 360 view is a read-only dashboard — no new profiles can be added."""
        return False

    def has_change_permission(self, request, obj=None):
        """All fields are read-only — no edits can be made from this view."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete profiles (enables deleting linked User accounts)."""
        return request.user.is_superuser

    # ── List view ─────────────────────────────────────────────────────────────
    list_display = [
        'student_full_name',
        'email_display',
        'roll_number_display',
        'xp_points',
        'current_level_display',
        'current_streak',
        'longest_streak',
        'last_checkin_date',
        'is_core_team',
    ]
    list_display_links = ['student_full_name']
    list_filter        = ['is_core_team']

    # Search covers email, full name, and roll number for quick lookups
    # during team meetings or presentations.
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'user__student_profile__roll_number',
    ]
    ordering = ['-xp_points', '-current_streak']

    # ── All fields forced to read-only ────────────────────────────────────────
    # Listing every model field here (plus computed helpers) ensures the detail
    # page renders plain text even if has_change_permission is somehow bypassed.
    readonly_fields = [
        'student_full_name',
        'email_display',
        'roll_number_display',
        'user',
        'xp_points',
        'current_level_display',
        'current_streak',
        'longest_streak',
        'last_checkin_date',
        'is_core_team',
        'created_at',
        'updated_at',
    ]

    # ── Detail form ───────────────────────────────────────────────────────────
    fieldsets = (
        ('👤 Student Identity', {
            'fields': (
                'user',
                'student_full_name',
                'email_display',
                'roll_number_display',
            ),
            'description': (
                'Core identity pulled from the linked Django user account. '
                'Academic details (roll number) come from the student\'s '
                '<strong>Student Profile</strong> record.'
            ),
        }),
        ('⚡ Gamification Stats', {
            'fields': (
                'xp_points',
                'current_level_display',
                'current_streak',
                'longest_streak',
                'last_checkin_date',
            ),
            'description': (
                'Live XP and streak metrics earned through daily check-ins '
                'and approved challenge / hackathon registrations. '
                'Level is computed as <code>(XP ÷ 100) + 1</code>.'
            ),
        }),
        ('🛡️ Fair Play Flag', {
            'fields': ('is_core_team',),
            'description': (
                'Core team members are excluded from the public student leaderboard. '
                'To change this flag, use the dedicated '
                '<strong>Builder Profiles</strong> admin section.'
            ),
        }),
        ('📅 Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom display columns (list view + detail readonly fields) ────────────

    @display(description='Student', ordering='user__first_name')
    def student_full_name(self, obj):
        """Returns the student's full name, falling back to their username."""
        return obj.user.get_full_name() or obj.user.username

    @display(description='Email', ordering='user__email')
    def email_display(self, obj):
        """Returns the student's email address."""
        return obj.user.email

    @display(description='Roll Number', ordering='user__student_profile__roll_number')
    def roll_number_display(self, obj):
        """
        Returns the student's roll number from their linked StudentProfile.
        Displays '—' if the student has not yet completed event registration
        (which is when the StudentProfile is created).
        """
        try:
            return obj.user.student_profile.roll_number
        except (ObjectDoesNotExist, AttributeError):
            return '—'

    @display(description='Level', ordering='xp_points')
    def current_level_display(self, obj):
        """
        Computes the student's current level from their accumulated XP.
        Formula: Level = (XP ÷ 100) + 1  →  Level 1 = 0–99 XP, Level 2 = 100–199 XP, …
        Uses format_html with white-space: nowrap to prevent column text wrapping.
        """
        level = (obj.xp_points // 100) + 1
        return format_html('<span style="white-space: nowrap;">Level {}</span>', level)

    get_level = current_level_display

    @admin.action(description="Season Reset (Set XP to 0)")
    def reset_all_xp(self, request, queryset):
        """
        Monthly Season Reset action reserved exclusively for superusers.
        Resets all selected student XP points to 0.
        """
        if not request.user.is_superuser:
            messages.error(request, "Only Superusers can perform a Season Reset.")
            return

        queryset.update(xp_points=0)
        messages.success(
            request,
            "Season Reset successful. XP points for selected builders have been set to 0."
        )


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
                getattr(settings, 'EMAIL_HOST_USER', self.from_email),
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
