import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Automated signal: Sends a welcome email when a new user registers or signs in via Google OAuth.
    """
    if created and instance.email:
        subject = "Welcome to AWS Student Builder Group - RIT Roorkee!"
        first_name = instance.first_name or instance.username or "Builder"
        
        message = (
            f"Hello {first_name},\n\n"
            "Welcome to the AWS Student Builder Group at RIT Roorkee!\n\n"
            "Your account has been successfully created. We are excited to have you join our vibrant student community.\n\n"
            "Our community focuses on Cloud Computing, Amazon Web Services (AWS), DevOps, and hands-on technical skills. "
            "Stay tuned for upcoming workshops, hackathons, cloud certifications guidance, and tech discussions.\n\n"
            "If you have any questions or ideas to share, feel free to reach out to our team.\n\n"
            "Happy Building!\n\n"
            "Best regards,\n"
            "AWS Student Builder Group Team\n"
            "RIT Roorkee"
        )
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AWS SBG <noreply@awssbg.com>')
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[instance.email],
                fail_silently=True,
            )
            logger.info(f"Welcome email successfully dispatched to {instance.email}")
        except Exception as exc:
            logger.error(f"Failed to send welcome email to {instance.email}: {exc}")
