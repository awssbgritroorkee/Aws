import os
import logging
import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailThread(threading.Thread):
    """
    Background Thread to execute send_mail asynchronously.
    Prevents blocking the main Gunicorn worker thread during user registration / social login.
    """
    def __init__(self, subject, message, from_email, recipient_list):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)

    def run(self):
        try:
            print(f"Attempting to send email to {self.recipient_list}...")
            send_mail(
                self.subject,
                self.message,
                getattr(settings, 'EMAIL_HOST_USER', self.from_email),
                self.recipient_list,
                fail_silently=False,
            )
            print(f"Email sent successfully to {self.recipient_list}!")
            logger.info(f"Asynchronous welcome email dispatched to {self.recipient_list}")
        except Exception as e:
            print(f"EMAIL FAILED for {self.recipient_list}: {e}")
            logger.error(f"Background email sending failed for {self.recipient_list}: {e}")


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Automated signal: Instantiates EmailThread to send welcome email in background when created=True.
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
        
        from_email = getattr(
            settings,
            'DEFAULT_FROM_EMAIL',
            getattr(settings, 'EMAIL_HOST_USER', 'AWS SBG <noreply@awssbg.com>')
        )
        
        # Offload email sending to background thread
        EmailThread(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[instance.email],
        ).start()
