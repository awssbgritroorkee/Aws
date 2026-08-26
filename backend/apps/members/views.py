from rest_framework import generics
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound

from .models import Member
from .serializers import MemberSerializer, MyProfileSerializer


class MemberListView(generics.ListAPIView):
    """
    GET /api/members/
    Returns all team members ordered by priority_order then name.
    Read-only — team management is done exclusively through Django Admin.
    """
    queryset         = Member.objects.all()
    serializer_class = MemberSerializer


class MyProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/members/my-profile/  → return the caller's TeamMember profile
    PATCH /api/members/my-profile/  → update editable fields

    Access rules:
    ─────────────
    • Must be authenticated (Token or Session).
    • User must have a linked Member profile (team_profile OneToOneField).
    • Users can ONLY read/write their OWN profile — no ?pk= override possible.

    Fields the user CAN update:
        name, role, badge, tagline, bio, linkedin, instagram, skills, image

    Fields that are READ-ONLY (cannot be self-modified):
        id, is_lead, priority_order   (managed by superadmin only)
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]
    serializer_class       = MyProfileSerializer
    http_method_names      = ['get', 'patch', 'head', 'options']  # no PUT

    def get_object(self):
        user = self.request.user

        # ── Permission Gateway check ──────────────────────────────────────────
        if not (hasattr(user, 'team_profile') and user.team_profile is not None):
            raise PermissionDenied(
                'You do not have a linked Team Member profile. '
                'Ask a superadmin to link your account in the admin panel first.'
            )

        return user.team_profile
