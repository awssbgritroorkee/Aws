from django.contrib.auth import login as django_login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.authtoken.models import Token
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


# ── Backend URL — used in SSO redirect links ───────────────────────────────────
ADMIN_BASE_URL = 'https://aws-swae.onrender.com'
FRONTEND_URL   = 'https://aws-red.vercel.app'


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


class AdminSSOView(APIView):
    """
    GET /api/auth/admin-sso/?token=<auth_token>[&next=/admin/some/path/]

    Admin Single Sign-On Bridge:
    ─────────────────────────────
    Accepts the frontend DRF auth token as a query-param, validates it,
    and — if the user is staff or superuser — establishes a Django session
    cookie so the user lands directly in the admin panel without seeing the
    login screen.

    Flow:
        1. React opens  /api/auth/admin-sso/?token=ABC&next=/admin/events/event/
           in a new tab (target="_blank").
        2. This view validates the token.
        3. Calls django.contrib.auth.login() → sets session cookie.
        4. Redirects to ?next (defaults to /admin/).

    Security:
        - Token must be valid (exists in the Token table).
        - User must have is_staff OR is_superuser.
        - Invalid / unauthorised → redirect back to frontend homepage.
        - No CSRF exemption needed — GET request, session is write-once here.
    """
    authentication_classes = []   # manual validation — no DRF auth needed
    permission_classes = [AllowAny]

    def get(self, request):
        raw_token = request.GET.get('token', '').strip()
        next_url  = request.GET.get('next', '/admin/')

        # ── Basic path sanitisation: only allow relative /admin/... paths ─────
        if not next_url.startswith('/admin/'):
            next_url = '/admin/'

        # ── Validate token ────────────────────────────────────────────────────
        if not raw_token:
            return redirect(f'{FRONTEND_URL}/?sso=missing_token')

        try:
            token_obj = Token.objects.select_related('user').get(key=raw_token)
        except Token.DoesNotExist:
            return redirect(f'{FRONTEND_URL}/?sso=invalid_token')

        user = token_obj.user

        if not user.is_active:
            return redirect(f'{FRONTEND_URL}/?sso=inactive')

        if not (user.is_staff or user.is_superuser):
            # Valid token but not an admin — refuse silently
            return redirect(f'{FRONTEND_URL}/?sso=unauthorized')

        # ── Establish Django session ──────────────────────────────────────────
        # ModelBackend is specified explicitly so allauth doesn't intercept.
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        django_login(request, user)

        return redirect(next_url)
