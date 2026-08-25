from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from unfold.admin import ModelAdmin


@admin.action(description="📧 Send Bulk Notification Email")
def send_bulk_notification(modeladmin, request, queryset):
    """
    Custom Django Admin Action: Bulk send notification emails to selected users.
    """
    recipients = [user.email for user in queryset if user.email]
    
    if not recipients:
        modeladmin.message_user(
            request,
            "None of the selected users have a valid email address.",
            level=messages.WARNING
        )
        return

    subject = "Important Update from AWS Student Builder Group - RIT Roorkee"
    message = (
        "Hello Builders,\n\n"
        "This is an official announcement from the AWS Student Builder Group at RIT Roorkee.\n\n"
        "We have exciting upcoming workshops, cloud computing sessions, and project opportunities planned for our community. "
        "Stay active and check our platform regularly for updates!\n\n"
        "Happy Learning & Building,\n"
        "AWS Student Builder Group Team\n"
        "RIT Roorkee"
    )
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AWS SBG <noreply@awssbg.com>')

    try:
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipients,
            fail_silently=False,
        )
        modeladmin.message_user(
            request,
            f"Successfully sent bulk email notification to {sent_count} user(s).",
            level=messages.SUCCESS
        )
    except Exception as exc:
        modeladmin.message_user(
            request,
            f"Failed to send bulk email: {str(exc)}",
            level=messages.ERROR
        )


# Unregister default Django User admin
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    """
    Custom UserAdmin integrated with Unfold theme and bulk email functionality.
    """
    actions = [send_bulk_notification]
