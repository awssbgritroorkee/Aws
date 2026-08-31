from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator


pin_validator = RegexValidator(
    regex=r'^\d{4}$',
    message='PIN must be exactly 4 numeric digits (e.g. 4821).'
)


class TeamRequest(models.Model):
    """
    A public post on the Team Up board.

    Two modes:
      'need_members' — A team leader looking for teammates.
      'need_team'    — A solo builder looking for an existing team.

    Privacy:
      secret_pin is never serialized in GET responses.
      creator's mobile_number is only revealed to a user who has an
      active 'in_process' TeamInterest for this specific post.

    Lifecycle:
      • is_approved_by_admin=False until manually approved in the admin.
      • is_active=False (auto-hidden) when members_needed reaches 0.
      • Posts with event_ref=None auto-expire 7 days after creation
        (lazy-filtered on read, no cron required).
      • When a linked Event closes, a post_save signal deletes related posts.
    """

    MODE_CHOICES = [
        ('need_members', 'Need Members'),
        ('need_team',    'Need a Team'),
    ]

    YEAR_CHOICES = [
        ('1st', '1st Year'),
        ('2nd', '2nd Year'),
        ('3rd', '3rd Year'),
        ('4th', '4th Year'),
        ('any', 'Any Year'),
    ]

    GENDER_CHOICES = [
        ('male',   'Male'),
        ('female', 'Female'),
        ('any',    'Any'),
    ]

    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='team_requests',
        help_text='The user who created this post.'
    )
    mode = models.CharField(
        max_length=15,
        choices=MODE_CHOICES,
        db_index=True,
        help_text="'need_members': has a team, wants people. 'need_team': solo, wants a team."
    )
    event_name = models.CharField(
        max_length=200,
        help_text='Name of the hackathon/event, or "Other" for a custom project.'
    )
    event_ref = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_requests',
        help_text='Link to a registered Event. Null if the user chose "Other".'
    )
    members_needed = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0), MaxValueValidator(6)],
        help_text='Remaining open slots. Decremented on each accepted PIN. Auto-hidden at 0.'
    )
    target_year = models.CharField(
        max_length=10,
        choices=YEAR_CHOICES,
        default='any',
        help_text='Which academic year the creator is looking for.'
    )
    gender_preference = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='any',
        help_text='Preferred gender of new teammates.'
    )
    message = models.TextField(
        help_text='Detailed requirement description visible on the board.'
    )
    secret_pin = models.CharField(
        max_length=4,
        validators=[pin_validator],
        help_text='4-digit numeric PIN. Share only with people you want to accept. NEVER exposed in GET APIs.'
    )
    is_approved_by_admin = models.BooleanField(
        default=True,
        help_text='Automatically approved on creation. Admins can unapprove/delete if needed.'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Set to False automatically when members_needed reaches 0.'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Team Request'
        verbose_name_plural = 'Team Requests'

    def __str__(self):
        return f'[{self.get_mode_display()}] {self.creator.get_full_name() or self.creator.email} — {self.event_name}'


class TeamInterest(models.Model):
    """
    The 'handshake' record created when a user clicks "Interested" on a post.

    Lifecycle:
      in_process → The 4-hour timer is running. Phone numbers are revealed.
      accepted   → PIN was verified within 4 hours. Slot officially filled.
      timeout    → 4 hours elapsed without PIN entry. Lock expired.

    The timer is evaluated DYNAMICALLY on every read (no Celery required):
    the view calls sweep_expired_interests() which bulk-updates stale
    in_process records to 'timeout' before serializing the response.
    """

    STATUS_CHOICES = [
        ('in_process', 'In Process'),
        ('accepted',   'Accepted'),
        ('timeout',    'Timed Out'),
    ]

    request_post = models.ForeignKey(
        TeamRequest,
        on_delete=models.CASCADE,
        related_name='interests',
        help_text='The team request post this interest is for.'
    )
    interested_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='team_interests',
        help_text='The user who clicked Interested.'
    )
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default='in_process',
        db_index=True,
    )
    locked_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Timestamp when the 4-hour lock window started.'
    )

    class Meta:
        unique_together = ('request_post', 'interested_user')
        ordering = ['-locked_at']
        verbose_name = 'Team Interest'
        verbose_name_plural = 'Team Interests'

    def __str__(self):
        return (
            f'{self.interested_user.get_full_name() or self.interested_user.email} '
            f'→ {self.request_post} [{self.status}]'
        )
