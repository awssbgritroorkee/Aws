from django.urls import path

from .gamification_views import (
    CreateBuilderProfileView,
    ProfileStatusView,
    DailyCheckinView,
    DailyVisitView,
    LeaderboardView,
    MyProfileView,
)

urlpatterns = [
    # ── Onboarding ──────────────────────────────────────────────────────────
    # POST /api/gamification/create-builder/
    # Student submits this once to create their BuilderProfile and begin
    # XP/streak tracking. Blocked for admins and if profile already exists.
    path('create-builder/', CreateBuilderProfileView.as_view(), name='gamification_create_builder'),

    # ── Profile Status (dashboard mount check) ───────────────────────────────
    # GET /api/gamification/profile-status/
    # Returns { is_admin, has_builder_profile, profile? } — used by the
    # dashboard to decide which view to render (onboarding form / dashboard / admin msg).
    path('profile-status/', ProfileStatusView.as_view(), name='gamification_profile_status'),

    # ── Daily Check-in ──────────────────────────────────────────────────────
    # POST /api/gamification/checkin/
    # Dashboard check-in, awards +10 XP. Silent no-op for admins / no-profile.
    path('checkin/', DailyCheckinView.as_view(), name='gamification_checkin'),

    # ── Global 5-second Engagement Tracker ──────────────────────────────────
    # POST /api/gamification/daily-visit/
    # +5 XP/day, +20 at every 5-day milestone. Silent no-op if no profile.
    path('daily-visit/', DailyVisitView.as_view(), name='gamification_daily_visit'),

    # ── Public Leaderboard ──────────────────────────────────────────────────
    # GET /api/gamification/leaderboard/
    path('leaderboard/', LeaderboardView.as_view(), name='gamification_leaderboard'),

    # ── My Profile ──────────────────────────────────────────────────────────
    # GET/PATCH /api/gamification/my-profile/
    path('my-profile/', MyProfileView.as_view(), name='gamification_my_profile'),
]
