from django.urls import path, include
from .views import GoogleLogin

urlpatterns = [
    # ── Google OAuth Login ───────────────────────────────────────────────────
    path('google/', GoogleLogin.as_view(), name='google_login'),

    # ── Standard REST Auth Endpoints (user, login, logout) ───────────────────
    path('', include('dj_rest_auth.urls')),
]
