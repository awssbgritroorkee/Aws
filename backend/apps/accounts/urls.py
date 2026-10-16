from django.urls import path, include
from .views import GoogleLogin, UserContextView, AdminSSOView
from .volunteer_views import VolunteerApplicationCreateView, VolunteerApplicationStatusView

urlpatterns = [
    # ── Google OAuth Login ───────────────────────────────────────────────────
    path('google/', GoogleLogin.as_view(), name='google_login'),

    # ── User Context (permissions, team profile, groups) ─────────────────────
    path('user-context/', UserContextView.as_view(), name='user_context'),

    # ── Admin SSO Bridge ──────────────────────────────────────────────────────
    # GET /api/auth/admin-sso/?token=<auth_token>&next=/admin/some/path/
    # Validates the DRF token, logs in the user, and redirects to Django admin.
    path('admin-sso/', AdminSSOView.as_view(), name='admin_sso'),

    # ── Volunteer Hiring System ───────────────────────────────────────────────
    # POST /api/auth/volunteer/apply/   → submit application
    # GET  /api/auth/volunteer/status/  → check application status
    path('volunteer/apply/',  VolunteerApplicationCreateView.as_view(), name='volunteer_apply'),
    path('volunteer/status/', VolunteerApplicationStatusView.as_view(), name='volunteer_status'),

    # ── Standard REST Auth Endpoints (user, login, logout) ───────────────────
    path('', include('dj_rest_auth.urls')),
]
