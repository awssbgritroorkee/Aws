from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from tinymce.models import HTMLField

User = get_user_model()


class Challenge(models.Model):
    """
    Unified event model — acts as a single source of truth for all
    builder-focused events published by AWS SBG RIT:

      • sprint     → Internal cloud/dev challenge sprints
      • hackathon  → External global hackathons (AWS, Devfolio, MLH …)
      • workshop   → Workshops and bootcamps
      • event      → Online events / webinars

    Spotlight vs past logic is determined by the frontend using `end_time`:
      - Active  → end_time is in the future
      - Past    → end_time is in the past

    The computed `status` property returns one of: UPCOMING | LIVE | CONCLUDED
    """

    # ── Event type ────────────────────────────────────────────────────────────
    EVENT_TYPE_CHOICES = [
        ('sprint',    'Internal Sprint'),
        ('hackathon', 'Global Hackathon'),
        ('workshop',  'Workshop / Bootcamp'),
        ('event',     'Online Event'),
    ]

    # ── Identity ───────────────────────────────────────────────────────────────
    event_type        = models.CharField(
                            max_length=20,
                            choices=EVENT_TYPE_CHOICES,
                            default='sprint',
                            help_text='The type of event — drives frontend routing and card styling.')
    title             = models.CharField(max_length=200)
    slug              = models.SlugField(
                            max_length=220,
                            unique=True,
                            blank=True,
                            null=True,
                            help_text='Auto-generated from title. Used in share-link URLs.')

    # ── Descriptions ──────────────────────────────────────────────────────────
    short_description = models.TextField(
                            blank=True,
                            help_text='One-line teaser shown on external challenge cards.')
    long_description  = HTMLField(
                            blank=True,
                            help_text=(
                                'Rich HTML content for the challenge detail page. '
                                'Edited via TinyMCE. Rendered as HTML in the React frontend.'
                            ))
    description       = models.TextField(
                            help_text='Legacy full description field. '
                                      'Still used as a fallback for the list-card excerpt.')

    # ── Images ────────────────────────────────────────────────────────────────
    image             = models.ImageField(
                            upload_to='challenges/',
                            blank=True,
                            null=True,
                            help_text='Cover image for both list-view card and detail hero banner.')

    # ── Meta / Quick-facts ────────────────────────────────────────────────────
    duration          = models.CharField(
                            max_length=50,
                            blank=True,
                            help_text='E.g. "60 Min" — displayed as a quick-fact badge.')
    max_seats         = models.CharField(
                            max_length=50,
                            blank=True,
                            help_text='E.g. "40 Max" — displayed as a quick-fact badge.')
    judging_type      = models.CharField(
                            max_length=100,
                            blank=True,
                            help_text='E.g. "Live Instant Judging" — displayed as a quick-fact badge.')

    # ── Timeline ──────────────────────────────────────────────────────────────
    start_time        = models.DateTimeField(
                            default=timezone.now,
                            help_text='When the challenge kicks off.')
    end_time          = models.DateTimeField(
                            help_text='Deadline — when the challenge closes. '
                                      'The frontend uses this to auto-shrink the spotlight card.')

    # ── Registration ──────────────────────────────────────────────────────────
    registration_link = models.URLField(
                            max_length=500,
                            blank=True,
                            help_text='External registration / submission link (Devfolio, Unstop, etc.).')

    # ── External event extras ─────────────────────────────────────────────────
    organizer         = models.CharField(
                            max_length=100,
                            blank=True,
                            null=True,
                            help_text='Organizer name — e.g. AWS, MLH, GitHub. Leave blank for internal sprints.')
    total_prize_pool  = models.CharField(
                            max_length=100,
                            blank=True,
                            null=True,
                            help_text='Prize pool value — e.g. "$28,000" or "₹1 Lakh". Leave blank if none.')
    external_link     = models.URLField(
                            blank=True,
                            null=True,
                            help_text='Official hackathon registration page (opens in a new tab on the detail page).')

    # ── Submission type ───────────────────────────────────────────────────────
    SUBMISSION_TYPE_CHOICES = [
        ('github',   'GitHub Repository URL'),
        ('drive',    'Google Drive Link (Screenshot/Doc)'),
        ('live_url', 'Live Project/Website URL'),
        ('official', 'Official Platform URL (Devpost/Unstop/Taikai)'),
    ]

    submission_type         = models.CharField(
                                  max_length=20,
                                  choices=SUBMISSION_TYPE_CHOICES,
                                  default='github',
                                  help_text='Controls what type of link students must submit and which anti-cheat rules are shown.')
    submission_instructions = models.TextField(
                                  blank=True,
                                  null=True,
                                  help_text="Additional submission rules shown to students on their dashboard — e.g. 'Must include #AWSSBG-RIT-2026 in README'.")

    # ── Audit ─────────────────────────────────────────────────────────────────
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    # ── Computed status ────────────────────────────────────────────────────────

    @property
    def end_date(self):
        """Alias for end_time to support end_date attribute access."""
        return self.end_time

    @property
    def status(self) -> str:
        """
        Returns the current lifecycle state of the challenge based on server time.

        Returns:
            "UPCOMING"   — challenge has not started yet
            "LIVE"       — challenge is currently running
            "CONCLUDED"  — challenge has ended
        """
        now = timezone.now()
        if now < self.start_time:
            return 'UPCOMING'
        if self.start_time <= now <= self.end_time:
            return 'LIVE'
        return 'CONCLUDED'

    # ── Meta ──────────────────────────────────────────────────────────────────
    class Meta:
        ordering            = ['-end_time']
        verbose_name        = 'Challenge'
        verbose_name_plural = 'Challenges'

    def save(self, *args, **kwargs):
        """Auto-populate slug from title if not set."""
        if not self.slug and self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.get_event_type_display()}] {self.title} [{self.status}] — ends {self.end_time:%Y-%m-%d}'


class ChallengeRule(models.Model):
    """
    A single rule / guideline entry for a Challenge.
    Rules are displayed in order on the challenge detail page.

    Example:
        title       = "Prompt Reveal at Minute 00"
        description = "The challenge prompt will be revealed exactly at the start time. ..."
        order       = 1
    """
    challenge   = models.ForeignKey(
                      Challenge,
                      on_delete=models.CASCADE,
                      related_name='rules',
                      help_text='Parent challenge this rule belongs to.')
    title       = models.CharField(
                      max_length=255,
                      help_text='Short heading for the rule (e.g. "Prompt Reveal at Minute 00").')
    description = models.TextField(
                      help_text='Full rule explanation. Markdown supported.')
    order       = models.IntegerField(
                      default=0,
                      help_text='Display order — lower numbers appear first.')

    class Meta:
        ordering            = ['order', 'id']
        verbose_name        = 'Challenge Rule'
        verbose_name_plural = 'Challenge Rules'

    def __str__(self):
        return f'[{self.challenge.title}] Rule {self.order}: {self.title}'


class ChallengeReward(models.Model):
    """
    A prize / reward tier for a Challenge.
    Rewards are displayed in order on the challenge detail page.

    Example:
        title       = "1st Place Champion"
        prize_value = "$40 Value"
        description = "AWS credits, swag kit, and a personal shout-out from the team."
        order       = 1
    """
    challenge   = models.ForeignKey(
                      Challenge,
                      on_delete=models.CASCADE,
                      related_name='rewards',
                      help_text='Parent challenge this reward belongs to.')
    title       = models.CharField(
                      max_length=255,
                      help_text='Prize tier label (e.g. "1st Place Champion").')
    prize_value = models.CharField(
                      max_length=100,
                      blank=True,
                      help_text='Monetary / credit value (e.g. "$40 Value"). Optional.')
    description = models.TextField(
                      help_text='What the winner receives. Markdown supported.')
    order       = models.IntegerField(
                      default=0,
                      help_text='Display order — lower numbers appear first.')

    class Meta:
        ordering            = ['order', 'id']
        verbose_name        = 'Challenge Reward'
        verbose_name_plural = 'Challenge Rewards'

    def __str__(self):
        return f'[{self.challenge.title}] {self.title} ({self.prize_value})'


# ─────────────────────────────────────────────────────────────────────────────
# Hackathon — external / global hackathons aggregator
# ─────────────────────────────────────────────────────────────────────────────

class Hackathon(models.Model):
    """
    Represents an external hackathon event (e.g. AWS, Devfolio, MLH) curated
    and surfaced by AWS SBG RIT for community members.

    The computed `status` property returns one of: UPCOMING | LIVE | CONCLUDED
    """

    MODE_CHOICES = [
        ('Online',    'Online'),
        ('In-Person', 'In-Person'),
        ('Hybrid',    'Hybrid'),
    ]

    # ── Identity ───────────────────────────────────────────────────────────────
    title              = models.CharField(
                             max_length=255,
                             help_text='Full name of the hackathon.')
    slug               = models.SlugField(
                             max_length=270,
                             unique=True,
                             help_text='URL-safe identifier. Auto-generated from title.')

    # ── Organizer ─────────────────────────────────────────────────────────────
    organizer          = models.CharField(
                             max_length=100,
                             help_text='e.g., AWS, Devfolio, MLH, GitHub')

    # ── Images ────────────────────────────────────────────────────────────────
    cover_image        = models.ImageField(
                             upload_to='hackathons/',
                             blank=True,
                             null=True,
                             help_text='Banner / card cover image for the hackathon.')

    # ── Registration ──────────────────────────────────────────────────────────
    registration_link  = models.URLField(
                             max_length=500,
                             help_text='Official link to register or join the hackathon.')

    # ── Timeline ──────────────────────────────────────────────────────────────
    start_date         = models.DateTimeField(
                             help_text='When the hackathon begins.')
    end_date           = models.DateTimeField(
                             help_text='When the hackathon ends / submissions close.')

    # ── Prize & Mode ──────────────────────────────────────────────────────────
    total_prize_pool   = models.CharField(
                             max_length=100,
                             blank=True,
                             help_text='e.g., "$28,000" or "₹1 Lakh". Leave blank if not disclosed.')
    mode               = models.CharField(
                             max_length=50,
                             choices=MODE_CHOICES,
                             default='Online',
                             help_text='Format of the hackathon.')

    # ── Descriptions ──────────────────────────────────────────────────────────
    short_description  = models.TextField(
                             blank=True,
                             help_text='One-line teaser shown on the hackathon card.')
    long_description   = HTMLField(
                             blank=True,
                             help_text=(
                                 'Rich HTML content for the hackathon detail page. '
                                 'Edited via TinyMCE. Rendered with dangerouslySetInnerHTML in React.'
                             ))

    # ── Audit ─────────────────────────────────────────────────────────────────
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    # ── Computed status ────────────────────────────────────────────────────────

    @property
    def status(self) -> str:
        """
        Returns the current lifecycle state based on server time.

        Returns:
            "UPCOMING"   — hackathon has not started yet
            "LIVE"       — hackathon is currently running
            "CONCLUDED"  — hackathon has ended
        """
        now = timezone.now()
        if now < self.start_date:
            return 'UPCOMING'
        if self.start_date <= now <= self.end_date:
            return 'LIVE'
        return 'CONCLUDED'

    # ── Meta ──────────────────────────────────────────────────────────────────
    class Meta:
        ordering            = ['-start_date']
        verbose_name        = 'Hackathon'
        verbose_name_plural = 'Hackathons'

    def save(self, *args, **kwargs):
        """Auto-populate slug from title if not already set."""
        if not self.slug and self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.title} [{self.status}] — {self.organizer}'


# ─────────────────────────────────────────────────────────────────────────────
# ChallengeRegistration — RSVP & submission tracking
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeRegistration(models.Model):
    """
    Links a student (User) to a Challenge and tracks their participation journey:

        registered       → student has RSVPed / joined
        pending_approval → student submitted proof of registration, waiting for admin review
        approved         → proof approved by core team (+50 XP awarded)
        rejected         → proof screenshot rejected as invalid

    Constraints:
        • unique_together('challenge', 'student') — one registration per student
          per event; prevents accidental duplicate RSVPs.

    Fair Play note:
        BuilderProfile.is_core_team should be checked before awarding XP for
        challenge registrations so core team activity doesn't inflate rankings.
    """

    STATUS_CHOICES = (
        ('registered',       'Registered'),
        ('pending_approval', 'Under Review'),
        ('approved',         'Approved'),
        ('rejected',         'Rejected'),
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    challenge     = models.ForeignKey(
                        Challenge,
                        on_delete=models.CASCADE,
                        related_name='registrations',
                        help_text='The challenge this registration belongs to.'
                    )
    student       = models.ForeignKey(
                        User,
                        on_delete=models.CASCADE,
                        related_name='challenge_registrations',
                        help_text='The registered student user.'
                    )

    # ── Status ─────────────────────────────────────────────────────────────────
    status        = models.CharField(
                        max_length=20,
                        choices=STATUS_CHOICES,
                        default='registered',
                        help_text='Current participation stage for this student.'
                    )

    # ── Submission ─────────────────────────────────────────────────────────────
    proof_link       = models.URLField(
                           blank=True,
                           null=True,
                           help_text='Public Google Drive link of the registration screenshot'
                       )
    rejection_reason = models.TextField(
                           blank=True,
                           null=True,
                           help_text='Explanation provided by admins if submission proof is rejected.'
                       )

    # ── Approval Audit ─────────────────────────────────────────────────────────
    approved_by      = models.ForeignKey(
                           User,
                           null=True,
                           blank=True,
                           on_delete=models.SET_NULL,
                           related_name='approved_challenges',
                           help_text='Admin user who approved this registration.'
                       )

    # ── Timestamps ─────────────────────────────────────────────────────────────
    registered_at = models.DateTimeField(
                        auto_now_add=True,
                        help_text='When the student registered for this challenge.'
                    )
    submitted_at  = models.DateTimeField(
                        blank=True,
                        null=True,
                        help_text='Timestamp of when the proof screenshot was submitted.'
                    )

    # ── Constraints ───────────────────────────────────────────────────────────
    class Meta:
        unique_together     = ('challenge', 'student')
        ordering            = ['-registered_at']
        verbose_name        = 'Challenge Registration'
        verbose_name_plural = 'Challenge Registrations'

    def clean(self):
        super().clean()
        if self.status == 'approved' and not (self.proof_link and self.proof_link.strip()):
            raise ValidationError('Cannot approve a registration without a submitted proof link.')

    def save(self, *args, **kwargs):
        """
        State-tracking save:
        Validates proof link presence for approved status, awards +50 XP to non-core team members
        when status transitions to 'approved', and rolls back 50 XP if status transitions away from 'approved'.
        """
        self.clean()
        if self.pk:
            old_instance = ChallengeRegistration.objects.filter(pk=self.pk).first()
            if old_instance:
                # Transition: Non-Approved -> Approved (+50 XP)
                if old_instance.status != 'approved' and self.status == 'approved':
                    try:
                        from apps.accounts.models import BuilderProfile
                        profile, _ = BuilderProfile.objects.get_or_create(user=self.student)
                        if not profile.is_core_team:
                            profile.xp_points += 50
                            profile.save(update_fields=['xp_points'])
                    except Exception:
                        pass
                # Transition: Approved -> Non-Approved (-50 XP Rollback)
                elif old_instance.status == 'approved' and self.status != 'approved':
                    try:
                        from apps.accounts.models import BuilderProfile
                        profile, _ = BuilderProfile.objects.get_or_create(user=self.student)
                        if not profile.is_core_team:
                            profile.xp_points = max(0, profile.xp_points - 50)
                            profile.save(update_fields=['xp_points'])
                    except Exception:
                        pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        XP Rollback on deletion:
        If an approved registration is deleted, deduct 50 XP from non-core team members.
        """
        if self.status == 'approved':
            try:
                from apps.accounts.models import BuilderProfile
                profile, _ = BuilderProfile.objects.get_or_create(user=self.student)
                if not profile.is_core_team:
                    profile.xp_points = max(0, profile.xp_points - 50)
                    profile.save(update_fields=['xp_points'])
            except Exception:
                pass
        super().delete(*args, **kwargs)

    def __str__(self):
        name = self.student.get_full_name() or self.student.first_name or self.student.username
        return f'{name} — {self.challenge.title} [{self.get_status_display()}]'
