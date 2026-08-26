from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


class GoogleLogin(SocialLoginView):
    """
    Google OAuth2 Social Login API Endpoint.
    Accepts access_token or id_token from the React frontend,
    authenticates or registers the user, and returns DRF auth token/user details.
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client


class UserContextView(APIView):
    """
    Returns rich user context for the frontend permission gateway.

    Payload:
        {
            "id": 1,
            "username": "johndoe",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "is_superuser": false,
            "is_staff": false,
            "is_team_member": true,
            "groups": ["Event Managers"],
            "picture": "https://..."   // from social account if available
        }

    Requires a valid DRF Token in the Authorization header or an active session.
    Returns 401 if the token is invalid / user has been deleted — the frontend
    Axios interceptor catches this and forces an automatic logout.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ── Team profile check (Permission Gateway) ───────────────────────────
        is_team_member = (
            hasattr(user, 'team_profile') and user.team_profile is not None
        )

        # ── Group names ───────────────────────────────────────────────────────
        groups = list(user.groups.values_list('name', flat=True))

        # ── Profile picture from Google social account ────────────────────────
        picture = ''
        try:
            social_account = user.socialaccount_set.filter(provider='google').first()
            if social_account:
                picture = social_account.extra_data.get('picture', '')
        except Exception:
            pass

        return Response({
            'id': user.pk,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'is_team_member': is_team_member,
            'groups': groups,
            'picture': picture,
        })
