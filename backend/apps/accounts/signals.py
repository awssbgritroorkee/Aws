import os
import sys
import logging
import socket
import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.mail import send_mail, EmailMultiAlternatives, get_connection
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailThread(threading.Thread):
    """
    Background Thread to execute email sending asynchronously.
    Supports both plain text and HTML emails via EmailMultiAlternatives.
    Prevents blocking the main Gunicorn worker thread during user registration / social login.
    Forces IPv4 address resolution to prevent dual-stack [Errno 101] Network is unreachable errors.
    """
    def __init__(self, subject, message, from_email, recipient_list, html_content=None):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        self.html_content = html_content
        threading.Thread.__init__(self)

    def _dispatch(self, connection=None):
        host_user = getattr(settings, 'EMAIL_HOST_USER', '')
        sender = host_user if host_user else self.from_email

        if self.html_content:
            msg = EmailMultiAlternatives(
                self.subject,
                self.message,
                sender,
                self.recipient_list,
                connection=connection,
            )
            msg.attach_alternative(self.html_content, "text/html")
            msg.send(fail_silently=False)
        else:
            send_mail(
                self.subject,
                self.message,
                sender,
                self.recipient_list,
                connection=connection,
                fail_silently=False,
            )

    def run(self):
        if hasattr(sys.stdout, 'reconfigure'):
            try:
                sys.stdout.reconfigure(encoding='utf-8')
            except Exception:
                pass

        # Force IPv4 socket resolution during SMTP dispatch to avoid dual-stack socket errors
        orig_getaddrinfo = socket.getaddrinfo

        def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

        socket.getaddrinfo = ipv4_getaddrinfo
        try:
            print(f"[EmailThread] Attempting to send email to {self.recipient_list}...", flush=True)
            host_user = getattr(settings, 'EMAIL_HOST_USER', '')

            # Dev fallback: If host_user is not configured and DEBUG is True, print email to console directly
            if getattr(settings, 'DEBUG', False) and not host_user:
                print("[EmailThread] EMAIL_HOST_USER not set in dev mode. Outputting email to console.", flush=True)
                console_conn = get_connection('django.core.mail.backends.console.EmailBackend')
                self._dispatch(connection=console_conn)
                print(f"[EmailThread] SUCCESS: Email printed to console for {self.recipient_list}!", flush=True)
                return

            # Attempt primary SMTP dispatch
            try:
                self._dispatch()
                print(f"[EmailThread] SUCCESS: Email sent to {self.recipient_list}!", flush=True)
                logger.info(f"Asynchronous welcome email dispatched to {self.recipient_list}")
            except Exception as smtp_err:
                # If in dev mode and SMTP fails (e.g. timeout, firewall block, unauth), fallback to console
                if getattr(settings, 'DEBUG', False):
                    print(f"[EmailThread] SMTP attempt failed ({smtp_err}). Falling back to console output in dev mode.", flush=True)
                    console_conn = get_connection('django.core.mail.backends.console.EmailBackend')
                    self._dispatch(connection=console_conn)
                    print(f"[EmailThread] SUCCESS (console fallback): Email printed for {self.recipient_list}!", flush=True)
                else:
                    raise smtp_err

        except Exception as e:
            print(f"[EmailThread] EMAIL FAILED for {self.recipient_list}: {e}", flush=True)
            logger.error(f"Background email sending failed for {self.recipient_list}: {e}")
        finally:
            socket.getaddrinfo = orig_getaddrinfo


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Automated signal: Instantiates EmailThread to send HTML welcome email in background when created=True.
    """
    if created and instance.email:
        subject = "🎉 Welcome to AWS SBG RIT Roorkee! Your Cloud Journey Starts Here ☁️"
        user_name = instance.first_name or instance.username or "Builder"

        html_content = f"""<p><strong>Hi {user_name},</strong></p>

<p>Welcome aboard! We are absolutely thrilled to have you join the <strong>AWS Student Builder Group (SBG)</strong> at Roorkee Institute of Technology.</p>

<p>By creating your account, you've just taken the first big step towards mastering Cloud Computing, AI, and DevOps. Our community is built by students, for students, to help you bridge the gap between theoretical knowledge and real-world tech.</p>

<p><strong>🚀 What to Expect (And What's in it for You!)</strong></p>
<ul>
    <li><strong>Hands-on Building:</strong> Dive deep into AWS, modern web architecture, and emerging tech through real-world projects and coding sessions.</li>
    <li><strong>Expert Workshops:</strong> Learn directly from industry professionals, seniors, and tech experts.</li>
    <li><strong>Career & Certifications:</strong> Get roadmap guidance for cracking AWS cloud certifications and building a standout tech resume.</li>
    <li><strong>Exclusive Perks:</strong> Participate in exciting community challenges, hackathons, and win awesome <strong>AWS goodies, swag, and surprises!</strong> 🎁</li>
</ul>

<p><strong>🔗 Your Next Steps – Get Connected!</strong><br>
To ensure you never miss out on upcoming events, resources, or those exclusive goodies, make sure you are connected to our official channels right now:</p>

<ul>
    <li>💬 <strong>WhatsApp Group:</strong> <a href="https://chat.whatsapp.com/CDOK76szIgzLFTOGcSPCY2">Join here for daily updates & discussions</a> <em>(Highly Recommended)</em></li>
    <li>🌐 <strong>Meetup Community:</strong> <a href="https://www.meetup.com/aws-sbg-at-roorkee-institute-of-technology/">RSVP for our upcoming events</a></li>
    <li>💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aws-sbg-on-campus-rit-roorkee?utm_source=share_via&utm_content=profile&utm_medium=member_android">Grow your professional network</a></li>
    <li>📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/aws.sbg.ritroorkee?igsi=MTAxM2dsazZrMjI0NA==">Follow behind-the-scenes & quick updates</a></li>
</ul>

<p>We can't wait to see what you build with us. If you have any questions, ideas, or just want to say hi, drop a message in the WhatsApp group!</p>

<p>Let's learn, build, and scale together! 🚀</p>

<p>Best Regards,<br>
<strong>The AWS SBG Team</strong><br>
RIT Roorkee</p>"""

        text_content = strip_tags(html_content)

        from_email = getattr(
            settings,
            'DEFAULT_FROM_EMAIL',
            getattr(settings, 'EMAIL_HOST_USER', 'AWS SBG <noreply@awssbg.com>')
        )

        # Offload email sending to background thread with HTML support
        EmailThread(
            subject=subject,
            message=text_content,
            from_email=from_email,
            recipient_list=[instance.email],
            html_content=html_content,
        ).start()
