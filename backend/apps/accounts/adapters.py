from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom Social Account Adapter for django-allauth.
    1. Automatically links social logins to existing users with matching email.
    2. Ensures generated usernames are unique and prevents IntegrityError collisions.
    """

    def pre_social_login(self, request, sociallogin):
        """
        Invoked just before a user is logged in via a social provider.
        If a user with the social account's email already exists in DB,
        automatically link the social account to the existing user.
        """
        # If social account is already linked to an existing user, return
        if sociallogin.is_existing:
            return

        # Extract email from social login account
        email = None
        if sociallogin.email_addresses:
            email = sociallogin.email_addresses[0].email
        elif sociallogin.account and sociallogin.account.extra_data:
            email = sociallogin.account.extra_data.get('email')

        if not email:
            return

        # Match existing user by email (case-insensitive)
        try:
            existing_user = User.objects.get(email__iexact=email)
            # Link incoming social account to existing user
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            pass

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        if user.username:
            # Ensure unique username by appending a suffix if username already exists
            base_username = user.username
            counter = 1
            while User.objects.filter(username__iexact=user.username).exists():
                user.username = f"{base_username}_{counter}"
                counter += 1
        return user
