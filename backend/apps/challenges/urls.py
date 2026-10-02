from django.urls import path
from .views import (
    ChallengeListView,
    ChallengeDetailView,
    HackathonListView,
    HackathonDetailView,
    RegisterChallengeView,
    MyRegistrationsView,
    SubmitProjectView,
)

# ── Challenge endpoints (mounted at /api/challenges/) ────────────────────────
#
# Route ordering matters:
#   • "my-registrations/" must come BEFORE "<slug:slug>/" so the literal
#     string is matched first and doesn't get eaten by the slug pattern.
#   • "<int:challenge_id>/register/" and "<int:challenge_id>/submit/" are
#     int-prefixed so they can never collide with slug-style routes.
#
challenge_urlpatterns = [
    # Public list & detail
    path('',                             ChallengeListView.as_view(),    name='challenge-list'),

    # ── Authenticated RSVP endpoints ─────────────────────────────────────────
    path('my-registrations/',            MyRegistrationsView.as_view(),  name='my-registrations'),
    path('<int:challenge_id>/register/', RegisterChallengeView.as_view(),name='challenge-register'),
    path('<int:challenge_id>/submit/',   SubmitProjectView.as_view(),    name='challenge-submit'),

    # Slug detail — keep last so literal routes above take precedence
    path('<slug:slug>/',                 ChallengeDetailView.as_view(),  name='challenge-detail'),
]

# ── Hackathon endpoints (mounted at /api/hackathons/) ────────────────────────
hackathon_urlpatterns = [
    path('',            HackathonListView.as_view(),   name='hackathon-list'),
    path('<slug:slug>/', HackathonDetailView.as_view(), name='hackathon-detail'),
]

# Default urlpatterns points to challenges (for backward compat when included directly)
urlpatterns = challenge_urlpatterns
