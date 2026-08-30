from django.db import models
from django.contrib.auth.models import User


class StudentProfile(models.Model):
    """
    Stores the academic details of a student who registers for events.
    One profile per Django user — reused and updated across every event registration,
    so returning attendees see their fields autofilled.
    """
    user          = models.OneToOneField(
                        User,
                        on_delete=models.CASCADE,
                        related_name='student_profile',
                        help_text='The Django user (Google SSO account) this profile belongs to.')
    full_name     = models.CharField(max_length=150, blank=True, null=True, help_text="Student's full name for certificates and official records.")
    father_name   = models.CharField(max_length=100)
    course        = models.CharField(
                        max_length=50,
                        help_text='e.g. B.Tech, BCA, MCA')
    branch        = models.CharField(
                        max_length=120,
                        help_text='e.g. Computer Science and Engineering')
    section       = models.CharField(max_length=10)
    roll_number   = models.CharField(max_length=30)
    mobile_number = models.CharField(max_length=15)

    class Meta:
        verbose_name        = 'Student Profile'
        verbose_name_plural = 'Student Profiles'

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.email} — {self.roll_number}'


class EventRegistration(models.Model):
    """
    Join table recording which student registered for which event.
    The unique_together constraint at the database level strictly prevents
    double-registrations, even under concurrent requests (IntegrityError on duplicate).
    """
    event        = models.ForeignKey(
                        'events.Event',
                        on_delete=models.CASCADE,
                        related_name='registrations',
                        help_text='The event this registration is for.')
    student      = models.ForeignKey(
                        StudentProfile,
                        on_delete=models.CASCADE,
                        related_name='registrations',
                        help_text='The student who registered.')
    registered_at = models.DateTimeField(
                        auto_now_add=True,
                        help_text='Timestamp when the registration was submitted.')

    class Meta:
        unique_together     = ('event', 'student')   # DB-level duplicate guard
        ordering            = ['-registered_at']
        verbose_name        = 'Event Registration'
        verbose_name_plural = 'Event Registrations'

    def __str__(self):
        return f'{self.student} → {self.event}'
