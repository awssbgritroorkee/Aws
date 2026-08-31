from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.events.models import Event
from .models import StudentProfile, EventRegistration
from .serializers import StudentProfileSerializer, EventRegistrationSerializer


class StudentProfileView(APIView):
    """
    GET /api/student-profile/

    Returns the authenticated user's StudentProfile for autofilling the
    EventRegistrationModal. Returns an empty object ({}) instead of 404
    when the user has never registered before, so the frontend can safely
    try to autofill without error handling for first-time users.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            # First-time user — return empty dict so the modal opens with blank fields
            return Response({}, status=status.HTTP_200_OK)

        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)


class EventRegisterView(APIView):
    """
    POST /api/events/<event_id>/register/

    Accepts student profile details and creates/updates the StudentProfile,
    then creates the EventRegistration.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request, event_id):
        # ── 1. Fetch & validate event ─────────────────────────────────────────
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── 2. Check registration window ──────────────────────────────────────
        if event.status.lower() == 'past' or not event.is_registration_open:
            return Response(
                {'detail': 'Registration is closed or the event has already passed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── 3. Validate incoming fields ───────────────────────────────────────
        serializer = EventRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        vd = serializer.validated_data

        # ── 4. Upsert StudentProfile for this user ────────────────────────────
        profile, _ = StudentProfile.objects.update_or_create(
            user=request.user,
            defaults={
                'full_name':     vd.get('full_name', ''),
                'course':        vd['course'],
                'branch':        vd['branch'],
                'section':       vd['section'],
                'roll_number':   vd['roll_number'],
                'mobile_number': vd['mobile_number'],
                'academic_year': vd.get('academic_year') or None,
            }
        )

        # ── 5. Create EventRegistration (duplicate → IntegrityError) ──────────
        try:
            EventRegistration.objects.create(event=event, student=profile)
        except IntegrityError:
            return Response(
                {'detail': 'You have already registered for this event.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'detail': 'Registration successful.'},
            status=status.HTTP_201_CREATED
        )
