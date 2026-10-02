from django.urls import path

from .gamification_views import DailyCheckinView, LeaderboardView, MyProfileView

urlpatterns = [
    # ── Daily Check-in ──────────────────────────────────────────────────────
    # POST /api/gamification/checkin/
    # Authenticated users call this when they open the dashboard.
    # Manages XP accumulation and streak logic.
    path('checkin/', DailyCheckinView.as_view(), name='gamification_checkin'),

    # ── Public Leaderboard ──────────────────────────────────────────────────
    # GET /api/gamification/leaderboard/
    # Returns top 10 students by XP (core team strictly excluded — Fair Play).
    path('leaderboard/', LeaderboardView.as_view(), name='gamification_leaderboard'),

    # ── My Profile ──────────────────────────────────────────────────────────
    # GET /api/gamification/my-profile/
    # Returns the authenticated user's own BuilderProfile for dashboard display.
    path('my-profile/', MyProfileView.as_view(), name='gamification_my_profile'),
]
