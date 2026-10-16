from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VolunteerApplication
from .volunteer_serializers import VolunteerApplicationSerializer


class VolunteerApplicationCreateView(APIView):
    """
    POST /api/auth/volunteer/apply/
    ─────────────────────────────────────────────────────────────────────────────
    Accepts a new volunteer application from an authenticated student.

    Behaviour:
    - Requires authentication (Google SSO token).
    - Injects `user` from the request — never trusted from client body.
    - Returns 201 Created with the serialized application on success.
    - Returns 400 with field errors on validation failure or duplicate submission.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = VolunteerApplicationSerializer(
            data=request.data,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VolunteerApplicationStatusView(APIView):
    """
    GET /api/auth/volunteer/status/
    ─────────────────────────────────────────────────────────────────────────────
    Returns the current volunteer application status for the authenticated user.

    Used by the frontend dashboard to render the application badge.

    Responses:
    - 200 { applied: true, status: "Pending"|"Accepted"|"Rejected", ... }
    - 200 { applied: false }          — user has not yet submitted
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            application = VolunteerApplication.objects.get(user=request.user)
            serializer  = VolunteerApplicationSerializer(application)
            return Response({
                'applied': True,
                **serializer.data,
            })
        except VolunteerApplication.DoesNotExist:
            return Response({'applied': False})
