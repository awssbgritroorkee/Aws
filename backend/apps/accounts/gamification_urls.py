from django.urls import path

from .gamification_views import DailyCheckinView, LeaderboardView, MyProfileView, DailyVisitView

urlpatterns = [
    # ── Daily Check-in ──────────────────────────────────────────────────────
    # POST /api/gamification/checkin/
    # Dashboard-only check-in — awards +10 XP (legacy, unchanged).
    path('checkin/', DailyCheckinView.as_view(), name='gamification_checkin'),

    # ── Global Daily-Visit Engagement Tracker ───────────────────────────────
    # POST /api/gamification/daily-visit/
    # Triggered by the 5-second rule on ANY page — awards +5 XP per unique day,
    # +20 bonus at every 5-day milestone. Powers the streak display everywhere.
    path('daily-visit/', DailyVisitView.as_view(), name='gamification_daily_visit'),

    # ── Public Leaderboard ──────────────────────────────────────────────────
    # GET /api/gamification/leaderboard/
    # Returns top 10 students by XP (core team strictly excluded — Fair Play).
    path('leaderboard/', LeaderboardView.as_view(), name='gamification_leaderboard'),

    # ── My Profile ──────────────────────────────────────────────────────────
    # GET /api/gamification/my-profile/
    # Returns the authenticated user's own BuilderProfile for dashboard display.
    path('my-profile/', MyProfileView.as_view(), name='gamification_my_profile'),
]
