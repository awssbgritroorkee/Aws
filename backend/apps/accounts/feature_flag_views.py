from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import SiteSettings


class FeatureFlagsView(APIView):
    """
    GET /api/settings/feature-flags/
    ─────────────────────────────────────────────────────────────────────────────
    Public, unauthenticated endpoint that returns the current feature-flag
    state for all toggleable modules.

    The React frontend calls this on every app load so that:
      - The Navbar conditionally renders module links.
      - Route wrappers can redirect disabled pages immediately.

    Response shape:
        {
          "is_challenges_active": true,
          "is_teamup_active":     true,
          "is_dashboard_active":  true,
          "is_volunteers_active": true
        }

    No authentication required — the frontend must be able to adjust the
    navbar even for logged-out visitors.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        return Response({
            'is_challenges_active': settings.is_challenges_active,
            'is_teamup_active':     settings.is_teamup_active,
            'is_dashboard_active':  settings.is_dashboard_active,
            'is_volunteers_active': settings.is_volunteers_active,
        })
