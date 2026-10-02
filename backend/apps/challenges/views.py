from rest_framework import generics
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as drf_status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Challenge, Hackathon, ChallengeRegistration
from .serializers import (
    ChallengeSerializer,
    HackathonSerializer,
    ChallengeRegistrationSerializer,
)
from .utils import validate_github_repo


class ChallengeListView(generics.ListAPIView):
    """
    GET /api/challenges/
    Returns all challenges ordered by end_time descending.
    Active challenges (end_time in future) naturally surface first.

    Includes nested `rules` and `rewards` for each challenge so the
    frontend needs only a single API call.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class       = ChallengeSerializer

    def get_queryset(self):
        """Pre-fetch related rules and rewards to avoid N+1 queries."""
        return (
            Challenge.objects
            .prefetch_related('rules', 'rewards')
            .order_by('-end_time')
        )


class ChallengeDetailView(generics.RetrieveAPIView):
    """
    GET /api/challenges/<slug>/
    Returns a single challenge by its slug, including nested rules and rewards.

    Deep-link example: /api/challenges/sih-hackathon-2026/
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class       = ChallengeSerializer
    lookup_field           = 'slug'

    def get_queryset(self):
        """Pre-fetch related rules and rewards to avoid N+1 queries."""
        return (
            Challenge.objects
            .prefetch_related('rules', 'rewards')
        )


# ─────────────────────────────────────────────────────────────────────────────
# Hackathon views
# ─────────────────────────────────────────────────────────────────────────────

class HackathonListView(generics.ListAPIView):
    """
    GET /api/hackathons/
    Returns all hackathons ordered by start_date descending (most recent first).
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class       = HackathonSerializer

    def get_queryset(self):
        return Hackathon.objects.all().order_by('-start_date')


class HackathonDetailView(generics.RetrieveAPIView):
    """
    GET /api/hackathons/<slug>/
    Returns a single hackathon by its slug.

    Deep-link example: /api/hackathons/aws-build-on-india-2026/
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class       = HackathonSerializer
    lookup_field           = 'slug'

    def get_queryset(self):
        return Hackathon.objects.all()


# ─────────────────────────────────────────────────────────────────────────────
# RSVP / Registration views  (all require authentication)
# ─────────────────────────────────────────────────────────────────────────────

_AUTH = [TokenAuthentication, SessionAuthentication]


class RegisterChallengeView(APIView):
    """
    POST /api/challenges/<challenge_id>/register/

    Registers the authenticated user for a challenge.
    Idempotent guard: returns 400 if the user is already registered.
    Fair Play guard: returns 403 if the user is a core team member.
    Time-Lock guard: returns 400 if current time > challenge end date.

    Responses:
        201  {"detail": "Successfully registered!"}
        400  {"detail": "Registration for this event has closed."}
        400  {"detail": "You are already registered for this event."}
        403  {"detail": "Fair Play Policy: Core team members cannot register for challenges."}
        404  challenge not found
    """
    authentication_classes = _AUTH
    permission_classes     = [IsAuthenticated]

    def post(self, request, challenge_id):
        # Fair Play guard: Core team members cannot register for challenges
        try:
            from apps.accounts.models import BuilderProfile
            profile, _ = BuilderProfile.objects.get_or_create(user=request.user)
            if profile.is_core_team:
                return Response(
                    {"detail": "Fair Play Policy: Core team members cannot register for challenges."},
                    status=drf_status.HTTP_403_FORBIDDEN,
                )
        except Exception:
            pass

        challenge = get_object_or_404(Challenge, pk=challenge_id)

        # Time-Lock guard: Check if registration period has ended
        if timezone.now() > challenge.end_date:
            return Response(
                {"detail": "Registration for this event has closed."},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        if ChallengeRegistration.objects.filter(
            challenge=challenge,
            student=request.user,
        ).exists():
            return Response(
                {'detail': 'You are already registered for this event.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        ChallengeRegistration.objects.create(
            challenge=challenge,
            student=request.user,
            status='registered',
        )
        return Response(
            {'detail': 'Successfully registered!'},
            status=drf_status.HTTP_201_CREATED,
        )


class MyRegistrationsView(APIView):
    """
    GET /api/challenges/my-registrations/

    Returns all ChallengeRegistration records for the authenticated user,
    ordered by most recently registered first.  Each record includes
    denormalized challenge fields (title, event_type, slug, image, status)
    so the frontend can render cards without extra API calls.

    Responses:
        200  [ { ...registration + challenge fields... }, ... ]
    """
    authentication_classes = _AUTH
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        registrations = (
            ChallengeRegistration.objects
            .filter(student=request.user)
            .select_related('challenge')   # single JOIN — avoids N+1 on challenge fields
            .order_by('-registered_at')
        )
        serializer = ChallengeRegistrationSerializer(
            registrations,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=drf_status.HTTP_200_OK)


class SubmitProjectView(APIView):
    """
    POST /api/challenges/<challenge_id>/submit/

    Body: { "proof_link": "<url>" }   (also accepts legacy key "project_link")

    Behaviour is branched on challenge.submission_type:

    │ github   │ Auto-validated via GitHub REST API.                         │
    │          │ Rules: repo created ≥ event_start; last push ≤ event_end.   │
    │          │ On pass  → status='approved', +50 XP (non-core team).       │
    │          │ On fail  → 400 with specific validator error message.        │
    ├──────────┼────────────────────────────────────────────────────────────│
    │ drive    │ No auto-validation. status='pending_approval'.               │
    │ official │ No auto-validation. status='pending_approval'.               │
    │ live_url │ No auto-validation. status='pending_approval'.               │

    Common guards (all types):
        400  Registration for this event has closed.   (time-lock)
        400  Proof already submitted.                  (idempotency)
        400  proof_link is required.
        404  No registration for this user + challenge.
    """
    authentication_classes = _AUTH
    permission_classes     = [IsAuthenticated]

    def post(self, request, challenge_id):
        challenge = get_object_or_404(Challenge, pk=challenge_id)

        # ── Time-Lock guard ────────────────────────────────────────────────
        if timezone.now() > challenge.end_date:
            return Response(
                {"detail": "Registration for this event has closed."},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        # ── Must be registered ───────────────────────────────────────────────
        registration = get_object_or_404(
            ChallengeRegistration,
            challenge=challenge,
            student=request.user,
        )

        # ── Idempotency guard ──────────────────────────────────────────────
        if registration.status in ('pending_approval', 'approved'):
            return Response(
                {'detail': 'Proof already submitted.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        # ── Extract link ──────────────────────────────────────────────────
        proof_link = (
            request.data.get('proof_link')
            or request.data.get('project_link')
            or ''
        ).strip()
        if not proof_link:
            return Response(
                {'detail': 'proof_link is required.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        submission_type = challenge.submission_type  # 'github' | 'drive' | 'live_url' | 'official'

        # ════════════════════════════════════════════════════════════════════
        # PATH A — GitHub auto-validation
        # ════════════════════════════════════════════════════════════════════
        if submission_type == 'github':
            try:
                validate_github_repo(
                    repo_url    = proof_link,
                    event_start = challenge.start_time,
                    event_end   = challenge.end_time,
                )
            except ValueError as exc:
                # Student-facing validation failure — 400 with exact message
                return Response(
                    {'detail': str(exc)},
                    status=drf_status.HTTP_400_BAD_REQUEST,
                )
            except RuntimeError as exc:
                # GitHub API unreachable — 503 so the student knows to retry
                return Response(
                    {'detail': str(exc)},
                    status=drf_status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            # Validation passed — auto-approve and award XP
            registration.proof_link   = proof_link
            registration.status       = 'approved'
            registration.submitted_at = timezone.now()
            registration.save(update_fields=['proof_link', 'status', 'submitted_at'])

            xp_awarded = False
            try:
                from apps.accounts.models import BuilderProfile
                profile, _ = BuilderProfile.objects.get_or_create(user=request.user)
                if not profile.is_core_team:
                    profile.xp_points += 50
                    profile.save(update_fields=['xp_points'])
                    xp_awarded = True
            except Exception:
                pass  # XP is non-critical; never break the submission response

            detail = (
                '✅ Project verified and approved! +50 XP has been added to your profile.'
                if xp_awarded else
                '✅ Project verified and approved!'
            )
            return Response(
                {'detail': detail, 'auto_approved': True},
                status=drf_status.HTTP_200_OK,
            )

        # ════════════════════════════════════════════════════════════════════
        # PATH B — Manual review (drive / official / live_url)
        # ════════════════════════════════════════════════════════════════════
        registration.proof_link   = proof_link
        registration.status       = 'pending_approval'
        registration.submitted_at = timezone.now()
        registration.save(update_fields=['proof_link', 'status', 'submitted_at'])

        return Response(
            {'detail': '⏳ Proof submitted successfully. Under review by admins.', 'auto_approved': False},
            status=drf_status.HTTP_200_OK,
        )
