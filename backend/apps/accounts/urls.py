from django.urls import path, include
from .views import GoogleLogin, UserContextView, AdminSSOView

urlpatterns = [
    # ── Google OAuth Login ───────────────────────────────────────────────────
    path('google/', GoogleLogin.as_view(), name='google_login'),

    # ── User Context (permissions, team profile, groups) ─────────────────────
    path('user-context/', UserContextView.as_view(), name='user_context'),

    # ── Admin SSO Bridge ──────────────────────────────────────────────────────
    # GET /api/auth/admin-sso/?token=<auth_token>&next=/admin/some/path/
    # Validates the DRF token, logs in the user, and redirects to Django admin.
    path('admin-sso/', AdminSSOView.as_view(), name='admin_sso'),

    # ── Standard REST Auth Endpoints (user, login, logout) ───────────────────
    path('', include('dj_rest_auth.urls')),
]
