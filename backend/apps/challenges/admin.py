from django.contrib import admin
from django.utils import timezone
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import Challenge, ChallengeRule, ChallengeReward, Hackathon, ChallengeRegistration


# ─────────────────────────────────────────────────────────────────────────────
# Inlines
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeRuleInline(TabularInline):
    """
    Inline editor for ChallengeRule entries inside the Challenge detail page.
    Allows admins to add/edit/delete rules without leaving the main form.
    """
    model          = ChallengeRule
    extra          = 1
    fields         = ['order', 'title', 'description']
    ordering       = ['order']
    verbose_name   = 'Rule'
    verbose_name_plural = 'Rules'


class ChallengeRewardInline(TabularInline):
    """
    Inline editor for ChallengeReward entries inside the Challenge detail page.
    Allows admins to manage prize tiers without leaving the main form.
    """
    model          = ChallengeReward
    extra          = 1
    fields         = ['order', 'title', 'prize_value', 'description']
    ordering       = ['order']
    verbose_name   = 'Reward'
    verbose_name_plural = 'Rewards'


class ChallengeRegistrationInline(TabularInline):
    """
    Read-only inline listing all students registered for this challenge.
    Displayed at the bottom of the Challenge detail page in Django admin.
    Admins can update the status and proof_link directly from here.
    """
    model               = ChallengeRegistration
    extra               = 0          # no blank rows — registrations come from the API
    readonly_fields     = ['student', 'registered_at', 'submitted_at']
    fields              = ['student', 'status', 'proof_link', 'registered_at', 'submitted_at']
    ordering            = ['-registered_at']
    verbose_name        = 'Registered Student'
    verbose_name_plural = 'Registered Students'

    def has_add_permission(self, request, obj=None):
        """Registrations are created via the API, not manually in admin."""
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Main Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Challenge)
class ChallengeAdmin(ModelAdmin):
    # ── Unfold cosmetics ────────────────────────────────────────────────────
    compressed_fields = True
    warn_unsaved_form = True

    # ── Inline editors (Rules & Rewards on the same page) ───────────────────
    inlines = [ChallengeRuleInline, ChallengeRewardInline, ChallengeRegistrationInline]

    # ── Slug auto-population from title ─────────────────────────────────────
    prepopulated_fields = {'slug': ('title',)}

    # ── List view ────────────────────────────────────────────────────────────
    list_display       = ['title', 'event_type_badge', 'organizer', 'total_prize_pool', 'start_time', 'end_time', 'status_badge']
    list_display_links = ['title']
    list_filter        = ['event_type']
    search_fields      = ['title', 'description', 'short_description', 'slug', 'organizer']
    ordering           = ['-end_time']
    date_hierarchy     = 'end_time'

    # ── Detail form ──────────────────────────────────────────────────────────
    fieldsets = (
        ('🎯 Event Type', {
            'fields': ('event_type',),
            'description': (
                'Choose the event type — drives frontend card styling and routing.<br>'
                '<strong>sprint</strong> → internal dev sprint &bull; '
                '<strong>hackathon</strong> → external global hackathon &bull; '
                '<strong>workshop</strong> → workshop or bootcamp &bull; '
                '<strong>event</strong> → online event / webinar.'
            ),
        }),
        ('🏆 Identity', {
            'fields': ('title', 'slug'),
            'description': 'The slug is auto-generated from the title and drives the share-link URL.',
        }),
        ('📝 Descriptions', {
            'fields': ('short_description', 'long_description', 'description'),
            'description': (
                '<strong>short_description</strong> → one-line teaser on external cards. '
                '<strong>long_description</strong> → rich detail page content. '
                '<strong>description</strong> → legacy fallback excerpt.'
            ),
        }),
        ('🖼️ Images', {
            'fields': ('image',),
            'description': 'Cover image for both list-view card and detail hero banner.',
        }),
        ('⚡ Quick Facts', {
            'fields': ('duration', 'max_seats', 'judging_type'),
            'description': 'Displayed as icon-badges on the challenge detail card (e.g. "60 Min", "40 Max").',
        }),
        ('📅 Timeline', {
            'fields': ('start_time', 'end_time'),
            'description': (
                'The frontend automatically promotes a challenge with a future end_time '
                'as the Spotlight card and demotes it to the Past list once end_time passes.'
            ),
        }),
        ('🔗 Registration', {
            'fields': ('registration_link',),
        }),
        ('🌐 External Event Data', {
            'fields': ('organizer', 'total_prize_pool', 'external_link'),
            'description': (
                'Fill in for <strong>hackathon</strong>, <strong>workshop</strong>, or <strong>event</strong> types. '
                'Leave blank for internal sprints.<br>'
                '<strong>external_link</strong> is rendered as a prominent "Join Now" CTA button on the detail page.'
            ),
        }),
        ('📤 Submission Settings', {
            'fields': ('submission_type', 'submission_instructions'),
            'description': (
                '<strong>submission_type</strong> controls what kind of link students must submit '
                'and which anti-cheat warnings are shown on their dashboard.<br>'
                '<strong>submission_instructions</strong> is displayed verbatim below the input field — '
                "e.g. \"Must include <code>#AWSSBG-RIT-2026</code> in your README.md\"."
            ),
        }),
    )

    # ── Custom display badges ─────────────────────────────────────────────────
    @display(description='Status', label={
        'Active': 'success',
        'Past':   'info',
    })
    def status_badge(self, obj):
        return 'Active' if obj.end_time > timezone.now() else 'Past'

    @display(description='Type', label={
        'Internal Sprint':    'success',
        'Global Hackathon':   'warning',
        'Workshop / Bootcamp':'info',
        'Online Event':       'info',
    })
    def event_type_badge(self, obj):
        return obj.get_event_type_display()


# ─────────────────────────────────────────────────────────────────────────────
# Standalone admin views for Rule / Reward (accessible from sidebar too)
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(ChallengeRule)
class ChallengeRuleAdmin(ModelAdmin):
    """Standalone admin for browsing / bulk-editing rules across all challenges."""
    compressed_fields  = True
    list_display       = ['challenge', 'order', 'title']
    list_display_links = ['title']
    list_filter        = ['challenge']
    search_fields      = ['title', 'description', 'challenge__title']
    ordering           = ['challenge', 'order']


@admin.register(ChallengeReward)
class ChallengeRewardAdmin(ModelAdmin):
    """Standalone admin for browsing / bulk-editing rewards across all challenges."""
    compressed_fields  = True
    list_display       = ['challenge', 'order', 'title', 'prize_value']
    list_display_links = ['title']
    list_filter        = ['challenge']
    search_fields      = ['title', 'description', 'challenge__title']
    ordering           = ['challenge', 'order']


# ─────────────────────────────────────────────────────────────────────────────
# Hackathon Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Hackathon)
class HackathonAdmin(ModelAdmin):
    """
    Django admin panel for the Hackathon model.
    Supports TinyMCE rich text for long_description and auto-slug from title.
    """
    compressed_fields = True
    warn_unsaved_form = True

    # ── Slug auto-population from title ────────────────────────────────
    prepopulated_fields = {'slug': ('title',)}

    # ── List view ──────────────────────────────────────────────────────────
    list_display       = ['title', 'organizer', 'start_date', 'end_date', 'mode', 'status_badge']
    list_display_links = ['title']
    list_filter        = ['mode', 'organizer']
    search_fields      = ['title', 'organizer', 'short_description', 'slug']
    ordering           = ['-start_date']
    date_hierarchy     = 'start_date'

    # ── Detail form fieldsets ───────────────────────────────────────────────
    fieldsets = (
        ('🏆 Identity', {
            'fields': ('title', 'slug'),
            'description': 'Slug is auto-generated from title and used in share-link URLs.',
        }),
        ('🏛️ Organizer', {
            'fields': ('organizer',),
        }),
        ('🖼️ Cover Image', {
            'fields': ('cover_image',),
        }),
        ('🔗 Registration', {
            'fields': ('registration_link',),
        }),
        ('📅 Timeline', {
            'fields': ('start_date', 'end_date'),
            'description': 'Status is computed automatically from these dates.',
        }),
        ('💰 Prize & Mode', {
            'fields': ('total_prize_pool', 'mode'),
        }),
        ('📝 Descriptions', {
            'fields': ('short_description', 'long_description'),
            'description': (
                '<strong>short_description</strong> → one-line teaser on cards. '
                '<strong>long_description</strong> → rich detail page content via TinyMCE.'
            ),
        }),
    )

    # ── Custom status badge column ─────────────────────────────────────────────
    @display(description='Status', label={
        'Upcoming':  'warning',
        'Live':      'success',
        'Concluded': 'info',
    })
    def status_badge(self, obj):
        now = timezone.now()
        if now < obj.start_date:
            return 'Upcoming'
        if obj.start_date <= now <= obj.end_date:
            return 'Live'
        return 'Concluded'


# ─────────────────────────────────────────────────────────────────────────────
# ChallengeRegistration Admin — RSVP & submission tracker
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(ChallengeRegistration)
class ChallengeRegistrationAdmin(ModelAdmin):
    """
    Standalone admin for managing all RSVP registrations across challenges.
    Core team can review student registration proof screenshots and approve/reject
    submissions via custom admin actions.
    """
    compressed_fields = True
    warn_unsaved_form = True

    # ── List view ───────────────────────────────────────────────────────────────────
    list_display       = ['student', 'challenge', 'reg_status_badge', 'proof_link_display', 'registered_at']
    list_display_links = ['student']
    list_filter        = ['status', 'challenge__event_type', 'challenge']
    search_fields      = ['student__email', 'student__first_name', 'student__last_name', 'challenge__title']
    ordering           = ['-registered_at']
    date_hierarchy     = 'registered_at'
    readonly_fields    = ['registered_at', 'submitted_at']
    actions            = ['approve_proofs', 'reject_proofs']

    # ── Detail form ──────────────────────────────────────────────────────────────────
    fieldsets = (
        ('🧑‍💻 Registration', {
            'fields': ('student', 'challenge'),
        }),
        ('📊 Status', {
            'fields': ('status',),
            'description': (
                'Move the status forward as the student progresses: '
                '<strong>Registered</strong> → <strong>Under Review</strong> → <strong>Approved</strong> / <strong>Rejected</strong>.'
            ),
        }),
        ('🔗 Proof of Registration', {
            'fields': ('proof_link', 'submitted_at'),
            'description': 'Public Google Drive link of registration screenshot. submitted_at is set automatically by the API when the student submits.',
        }),
        ('📅 Audit', {
            'fields': ('registered_at',),
            'classes': ('collapse',),
        }),
    )

    # ── Admin Actions ─────────────────────────────────────────────────────────
    @admin.action(description='✅ Approve selected registration proofs (+50 XP)')
    def approve_proofs(self, request, queryset):
        approved_count = 0
        xp_awarded_count = 0
        from apps.accounts.models import BuilderProfile

        for reg in queryset.filter(status='pending_approval'):
            reg.status = 'approved'
            reg.save(update_fields=['status'])
            approved_count += 1

            # Award +50 XP to non-core team members
            try:
                profile, _ = BuilderProfile.objects.get_or_create(user=reg.student)
                if not profile.is_core_team:
                    profile.xp_points += 50
                    profile.save(update_fields=['xp_points'])
                    xp_awarded_count += 1
            except Exception:
                pass

        self.message_user(
            request,
            f"Approved {approved_count} registration proof(s). Awarded +50 XP to {xp_awarded_count} non-core student(s)."
        )

    @admin.action(description='❌ Reject selected registration proofs')
    def reject_proofs(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f"Rejected {updated} registration proof(s).")

    # ── Custom display columns ────────────────────────────────────────────────────────────────
    @display(description='Status', label={
        'Registered':   'info',
        'Under Review': 'warning',
        'Approved':     'success',
        'Rejected':     'danger',
    })
    def reg_status_badge(self, obj):
        return obj.get_status_display()

    @display(description='Proof Link')
    def proof_link_display(self, obj):
        if obj.proof_link:
            return obj.proof_link[:55] + ('...' if len(obj.proof_link) > 55 else '')
        return '—'
