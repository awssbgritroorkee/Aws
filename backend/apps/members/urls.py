from django.urls import path
from .views import MemberListView, MyProfileView

urlpatterns = [
    # ── Public list ───────────────────────────────────────────────────────────
    path('', MemberListView.as_view(), name='member-list'),

    # ── Authenticated: own profile read + patch ───────────────────────────────
    # GET  /api/members/my-profile/  → retrieve own TeamMember profile
    # PATCH /api/members/my-profile/  → update editable fields
    path('my-profile/', MyProfileView.as_view(), name='my-profile'),
]
