import logging

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VolunteerApplication
from .volunteer_serializers import VolunteerApplicationSerializer

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helper — map VolunteerApplication year format → StudentProfile format
# ─────────────────────────────────────────────────────────────────────────────
_YEAR_MAP = {
    '1st Year': '1st',
    '2nd Year': '2nd',
    '3rd Year': '3rd',
    '4th Year': '4th',
}


def _sync_student_profile(user, validated_data: dict) -> None:
    """
    Create or update the user's StudentProfile using the data that was
    just submitted in the volunteer form.

    Field mapping
    ─────────────
    VolunteerApplication.full_name     → StudentProfile.full_name
    VolunteerApplication.course        → StudentProfile.course
    VolunteerApplication.branch        → StudentProfile.branch  ('' if None)
    VolunteerApplication.section       → StudentProfile.section
    VolunteerApplication.roll_number   → StudentProfile.roll_number  (str)
    VolunteerApplication.mobile_number → StudentProfile.mobile_number
    VolunteerApplication.academic_year → StudentProfile.academic_year (normalised)

    Called inside the same atomic transaction as the application save, so both
    records are committed or rolled back together.
    """
    from apps.students.models import StudentProfile

    raw_year      = validated_data.get('academic_year', '')
    mapped_year   = _YEAR_MAP.get(raw_year, raw_year)   # "2nd Year" → "2nd"

    profile_defaults = {
        'full_name':     validated_data.get('full_name', ''),
        'course':        validated_data.get('course', ''),
        'branch':        validated_data.get('branch') or '',  # null → ''
        'section':       validated_data.get('section', ''),
        'roll_number':   str(validated_data.get('roll_number', '')),
        'mobile_number': validated_data.get('mobile_number', ''),
        'academic_year': mapped_year,
    }

    _, created = StudentProfile.objects.update_or_create(
        user=user,
        defaults=profile_defaults,
    )

    action = 'created' if created else 'updated'
    logger.info(
        '[Volunteer] StudentProfile %s for user=%s (roll=%s)',
        action, user.username, profile_defaults['roll_number'],
    )


# ─────────────────────────────────────────────────────────────────────────────
# A. Submit Application — POST /api/auth/volunteer/apply/
# ─────────────────────────────────────────────────────────────────────────────

class VolunteerApplicationCreateView(APIView):
    """
    POST /api/auth/volunteer/apply/
    ─────────────────────────────────────────────────────────────────────────────
    Accepts a new volunteer application from an authenticated student.

    Behaviour:
    • Requires authentication (Google SSO token).
    • Injects `user` from the request — never trusted from client body.
    • Atomically saves VolunteerApplication AND syncs academic data to
      StudentProfile (create-or-update) in a single DB transaction.
    • Returns 201 Created with the serialized application on success.
    • Returns 400 with field errors on validation failure or duplicate submission.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = VolunteerApplicationSerializer(
            data=request.data,
            context={'request': request},
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # ── Atomic save: both writes succeed or both roll back ──────────────
        with transaction.atomic():
            application = serializer.save(user=request.user)

            # Sync the same academic data to StudentProfile
            _sync_student_profile(request.user, serializer.validated_data)

        logger.info(
            '[Volunteer] New application submitted: user=%s name="%s" status=%s',
            request.user.username, application.full_name, application.status,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# B. Application Status — GET /api/auth/volunteer/status/
# ─────────────────────────────────────────────────────────────────────────────

class VolunteerApplicationStatusView(APIView):
    """
    GET /api/auth/volunteer/status/
    ─────────────────────────────────────────────────────────────────────────────
    Returns the current volunteer application status for the authenticated user.

    Responses:
    • 200 { applied: true,  status: "Pending"|"Accepted"|"Rejected", ... }
    • 200 { applied: false }  — user has not yet submitted
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            application = VolunteerApplication.objects.get(user=request.user)
            serializer  = VolunteerApplicationSerializer(application)
            return Response({'applied': True, **serializer.data})
        except VolunteerApplication.DoesNotExist:
            return Response({'applied': False})

