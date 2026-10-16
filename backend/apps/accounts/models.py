from django.db import models
from django.contrib.auth.models import User


# ─────────────────────────────────────────────────────────────────────────────
# BuilderProfile — Gamification: XP, Streaks, Fair Play
# ─────────────────────────────────────────────────────────────────────────────

class BuilderProfile(models.Model):
    """
    Extended profile for every registered user that drives the gamification
    engine (XP points, daily streaks) displayed on the Student Dashboard.

    Fair Play:
        Core team members (is_core_team=True) are EXCLUDED from the public
        leaderboard and their XP is never modified by the check-in API.
        This prevents staff from dominating student rankings.
    """
    user              = models.OneToOneField(
                            User,
                            on_delete=models.CASCADE,
                            related_name='builder_profile',
                            help_text='The Django user this profile belongs to.'
                        )
    xp_points         = models.IntegerField(
                            default=0,
                            help_text='Accumulated XP points earned through check-ins and activities.'
                        )
    current_streak    = models.IntegerField(
                            default=0,
                            help_text='Number of consecutive daily check-in days.'
                        )
    longest_streak    = models.IntegerField(
                            default=0,
                            help_text='All-time longest consecutive check-in streak.'
                        )
    last_checkin_date = models.DateField(
                            null=True,
                            blank=True,
                            help_text='Date of the most recent daily check-in.'
                        )
    is_core_team      = models.BooleanField(
                            default=False,
                            help_text=(
                                'Set True for AWS SBG core team members. '
                                'Disables leaderboard XP tracking for Fair Play — '
                                'staff cannot dominate the student leaderboard.'
                            )
                        )
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Builder Profile'
        verbose_name_plural = 'Builder Profiles'
        ordering            = ['-xp_points', '-current_streak']

    def __str__(self):
        role = '🛡️ Core Team' if self.is_core_team else '🧑‍💻 Student'
        return f'{role} | {self.user.get_full_name() or self.user.username} — {self.xp_points} XP | Streak: {self.current_streak}'


# ─────────────────────────────────────────────────────────────────────────────
# EmailBroadcast — Bulk email tool for admin panel
# ─────────────────────────────────────────────────────────────────────────────

class EmailBroadcast(models.Model):
    """
    Admin-controlled model to send custom bulk or targeted emails to users
    via a background thread, without blocking the admin panel.
    """
    subject = models.CharField(
        max_length=255,
        help_text="Subject line of the broadcast email.",
    )
    message = models.TextField(
        help_text="Body of the broadcast email (plain text).",
    )
    send_to_all_users = models.BooleanField(
        default=False,
        help_text="If checked, the email will be sent to ALL registered users. "
                  "Overrides the 'Specific Users' selection.",
    )
    specific_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='email_broadcasts',
        help_text="Select individual users to receive this email. "
                  "Ignored when 'Send to all users' is enabled.",
    )
    sent_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this broadcast was saved and dispatched.",
    )

    class Meta:
        verbose_name = "Email Broadcast"
        verbose_name_plural = "Email Broadcasts"
        ordering = ['-sent_at']

    def __str__(self):
        ts = self.sent_at.strftime('%Y-%m-%d %H:%M') if self.sent_at else 'unsaved'
        target = "All Users" if self.send_to_all_users else f"{self.specific_users.count()} specific user(s)"
        return f"[{ts}] {self.subject} → {target}"


# ─────────────────────────────────────────────────────────────────────────────
# VolunteerApplication — Student volunteer hiring system
# ─────────────────────────────────────────────────────────────────────────────

class VolunteerApplication(models.Model):
    """
    Volunteer application submitted by a registered student.
    The admin can review and update the status to Accepted or Rejected.
    One student may only submit one application (enforced via unique constraint).
    """

    # ── Choice constants ──────────────────────────────────────────────────────
    GENDER_CHOICES = [
        ('Male',   'Male'),
        ('Female', 'Female'),
    ]

    ACCOMMODATION_CHOICES = [
        ('Hostler',     'Hostler'),
        ('Day Scholar', 'Day Scholar'),
    ]

    COURSE_CHOICES = [
        ('B.Tech',  'B.Tech'),
        ('BCA',     'BCA'),
        ('MCA',     'MCA'),
        ('BBA',     'BBA'),
        ('Others',  'Others'),
    ]

    SECTION_CHOICES = [
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'),
        ('E', 'E'), ('F', 'F'), ('G', 'G'), ('H', 'H'), ('I', 'I'),
    ]

    YEAR_CHOICES = [
        ('2nd Year', '2nd Year'),
        ('3rd Year', '3rd Year'),
    ]

    STATUS_CHOICES = [
        ('Pending',  'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    # ── Core fields ──────────────────────────────────────────────────────────
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='volunteer_application',
        help_text='The user account that submitted this volunteer application.',
    )
    full_name = models.CharField(
        max_length=150,
        help_text="Applicant's full name.",
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        help_text="Applicant's gender.",
    )
    mobile_number = models.CharField(
        max_length=15,
        help_text='10-digit mobile number.',
    )
    accommodation = models.CharField(
        max_length=15,
        choices=ACCOMMODATION_CHOICES,
        help_text='Whether the student lives in the hostel or commutes.',
    )

    # ── Academic fields ───────────────────────────────────────────────────────
    course = models.CharField(
        max_length=10,
        choices=COURSE_CHOICES,
        help_text='Enrolled degree programme.',
    )
    branch = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Branch / specialisation (e.g. CSE, ECE). Leave blank for non-B.Tech.',
    )
    section = models.CharField(
        max_length=2,
        choices=SECTION_CHOICES,
        help_text='Section / division within the batch.',
    )
    academic_year = models.CharField(
        max_length=10,
        choices=YEAR_CHOICES,
        help_text='Current academic year.',
    )
    roll_number = models.IntegerField(
        help_text="Applicant's college roll number.",
    )

    # ── Motivation & skills ───────────────────────────────────────────────────
    skills = models.TextField(
        help_text='Free-text description of the applicant\u2019s skills.',
    )
    motivation = models.TextField(
        help_text='Why does the applicant want to join as a volunteer?',
    )
    other_club_member = models.BooleanField(
        default=False,
        help_text='True if the applicant is a member of any other college club.',
    )

    # ── Admin-managed fields ──────────────────────────────────────────────────
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Pending',
        db_index=True,
        help_text='Application review status — updated by the admin team.',
    )
    admin_notes = models.TextField(
        blank=True,
        default='',
        help_text='Internal notes visible only to admins (not exposed to the student).',
    )

    # ── Audit ─────────────────────────────────────────────────────────────────
    applied_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Volunteer Application'
        verbose_name_plural = 'Volunteer Applications'
        ordering            = ['-applied_at']

    def __str__(self):
        return (
            f'{self.full_name} | {self.academic_year} | '
            f'{self.course} | Status: {self.status}'
        )


# ─────────────────────────────────────────────────────────────────────────────
# SiteSettings — Feature Flag / Control Center (Singleton)
# ─────────────────────────────────────────────────────────────────────────────

class SiteSettings(models.Model):
    """
    Global feature-flag singleton for the AWS SBG platform.

    Singleton pattern — only ONE row ever exists (pk=1).
    The admin panel restricts creation of additional rows.
    Changes here propagate to the frontend within seconds via the
    /api/settings/feature-flags/ public endpoint (no auth required).

    Naming convention
    -----------------
    is_<feature>_active = True  → feature is publicly visible and routable
    is_<feature>_active = False → nav links hidden; direct URL access → disabled screen
    """

    # ── Feature toggles ───────────────────────────────────────────────────────
    is_challenges_active = models.BooleanField(
        default=True,
        verbose_name='Challenges module active',
        help_text=(
            'Controls the /challenges route and its nav link. '
            'Disable to hide Challenges from both the navbar and direct URL access.'
        ),
    )
    is_teamup_active = models.BooleanField(
        default=True,
        verbose_name='Team Up module active',
        help_text=(
            'Controls the /teamup route and its nav link. '
            'Disable to hide Team Up from both the navbar and direct URL access.'
        ),
    )
    is_dashboard_active = models.BooleanField(
        default=True,
        verbose_name='Student Dashboard active',
        help_text=(
            'Controls the /dashboard route and the "Dashboard" user-dropdown item. '
            'Disable to prevent students from accessing their dashboard.'
        ),
    )
    is_volunteers_active = models.BooleanField(
        default=True,
        verbose_name='Volunteer module active',
        help_text=(
            'Controls the /volunteer route and its nav link. '
            'Disable to hide the volunteer application form.'
        ),
    )

    # ── Audit ─────────────────────────────────────────────────────────────────
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        flags = []
        if not self.is_challenges_active: flags.append('Challenges OFF')
        if not self.is_teamup_active:     flags.append('Team Up OFF')
        if not self.is_dashboard_active:  flags.append('Dashboard OFF')
        if not self.is_volunteers_active: flags.append('Volunteers OFF')
        return f'Feature Flags — {", ".join(flags) if flags else "all modules ON"}'

    def save(self, *args, **kwargs):
        """Enforce singleton — always use pk=1."""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent accidental deletion of the singleton row."""
        pass  # no-op

    @classmethod
    def load(cls):
        """
        Returns the singleton instance, creating it with defaults on first call.
        Use this everywhere in code instead of objects.get(pk=1).
        """
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

