from django.urls import path
from .views import (
    TeamRequestListCreateView,
    TeamInterestView,
    PinVerifyView,
    ReduceSlotsView,
    MyWorkspaceView,
)

urlpatterns = [
    # ── Public board + Post creation ────────────────────────────────────────────
    path('posts/',                          TeamRequestListCreateView.as_view(), name='teamup_posts'),

    # ── Post-level actions (auth required) ───────────────────────────────────────
    path('posts/<int:post_id>/interest/',   TeamInterestView.as_view(),          name='teamup_interest'),
    path('posts/<int:post_id>/verify-pin/', PinVerifyView.as_view(),             name='teamup_verify_pin'),
    path('posts/<int:post_id>/reduce-slots/', ReduceSlotsView.as_view(),         name='teamup_reduce_slots'),

    # ── Creator dashboard ───────────────────────────────────────────────────────
    path('my-workspace/',                   MyWorkspaceView.as_view(),           name='teamup_workspace'),
]
