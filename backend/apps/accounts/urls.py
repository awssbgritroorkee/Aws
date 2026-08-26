from django.urls import path, include
from .views import GoogleLogin, UserContextView

urlpatterns = [
    # ── Google OAuth Login ───────────────────────────────────────────────────
    path('google/', GoogleLogin.as_view(), name='google_login'),

    # ── User Context (permissions, team profile, groups) ─────────────────────
    path('user-context/', UserContextView.as_view(), name='user_context'),

    # ── Standard REST Auth Endpoints (user, login, logout) ───────────────────
    path('', include('dj_rest_auth.urls')),
]
