from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom Social Account Adapter for django-allauth.
    Ensures generated usernames are unique and prevents IntegrityError when a username collision occurs.
    """

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
