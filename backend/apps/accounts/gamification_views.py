import datetime
import logging

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import BuilderProfile
from .gamification_serializers import BuilderProfileSerializer

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# XP constants
# ─────────────────────────────────────────────────────────────────────────────
DAILY_VISIT_XP          = 5    # XP earned per unique-day visit (5-second rule)
STREAK_MILESTONE_XP     = 20   # Bonus XP awarded at every 5-day streak multiple
STREAK_MILESTONE_EVERY  = 5    # Check milestone at multiples of this number


# ─────────────────────────────────────────────────────────────────────────────
# Guards
# ─────────────────────────────────────────────────────────────────────────────

def _is_admin(user) -> bool:
    """True for is_staff or is_superuser — excluded from all gamification."""
    return user.is_staff or user.is_superuser


def _get_profile_or_none(user) -> 'BuilderProfile | None':
    """
    Returns the user's BuilderProfile if it exists, else None.
    Admin/superuser accounts always return None (they cannot have profiles).
    """
    if _is_admin(user):
        return None
    try:
        return BuilderProfile.objects.get(user=user)
    except BuilderProfile.DoesNotExist:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# A. Create Builder Profile — POST /api/gamification/create-builder/
# ─────────────────────────────────────────────────────────────────────────────

class CreateBuilderProfileView(APIView):
    """
    POST /api/gamification/create-builder/
    ─────────────────────────────────────────────────────────────────────────────
    Explicit onboarding endpoint. Students submit this form once from the
    dashboard to create their BuilderProfile and begin XP/streak tracking.

    Guardrails
    ──────────
    • Admin / superuser accounts → 403 Forbidden (they must never have profiles).
    • Profile already exists → 400 with a clear user-facing message.
    • Accepted body fields: full_name, roll_number, course, branch, section,
      academic_year, mobile_number.

    On success
    ──────────
    • Creates BuilderProfile (xp=0, streak=0).
    • Syncs academic details to StudentProfile (create-or-update).
    • Returns 201 with the serialized profile including has_builder_profile=True.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # ── Admin gate ──────────────────────────────────────────────────────
        if _is_admin(user):
            return Response(
                {'detail': 'Admin and superuser accounts cannot participate in student gamification.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── Idempotency guard ────────────────────────────────────────────────
        if BuilderProfile.objects.filter(user=user).exists():
            return Response(
                {'detail': 'Builder Profile already exists. You can only create one profile.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Validate required fields ─────────────────────────────────────────
        data = request.data
        required = ['full_name', 'roll_number', 'course', 'section', 'academic_year', 'mobile_number']
        errors = {}
        for field in required:
            val = str(data.get(field, '')).strip()
            if not val:
                errors[field] = f'{field.replace("_", " ").title()} is required.'
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # ── Create BuilderProfile ────────────────────────────────────────────
        from django.db import transaction
        from apps.students.models import StudentProfile

        _YEAR_MAP = {'1st Year': '1st', '2nd Year': '2nd', '3rd Year': '3rd', '4th Year': '4th'}
        raw_year   = str(data.get('academic_year', '')).strip()
        mapped_year = _YEAR_MAP.get(raw_year, raw_year)

        full_name = str(data.get('full_name', '')).strip()

        with transaction.atomic():
            profile = BuilderProfile.objects.create(user=user)

            # Update Django user's first/last name for display consistency
            name_parts = full_name.split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name  = name_parts[1] if len(name_parts) > 1 else ''
            user.save(update_fields=['first_name', 'last_name'])

            # Sync to StudentProfile (for event registrations autofill)
            StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    'full_name':     full_name,
                    'course':        str(data.get('course', '')).strip(),
                    'branch':        str(data.get('branch', '')).strip(),
                    'section':       str(data.get('section', '')).strip(),
                    'roll_number':   str(data.get('roll_number', '')).strip(),
                    'mobile_number': str(data.get('mobile_number', '')).strip(),
                    'academic_year': mapped_year,
                },
            )

        logger.info(
            '[Onboarding] BuilderProfile created — user=%s name="%s" roll=%s',
            user.username, full_name, data.get('roll_number'),
        )

        serializer = BuilderProfileSerializer(profile)
        resp_data  = serializer.data
        resp_data['has_builder_profile'] = True
        return Response(resp_data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# B. Profile Status Check — GET /api/gamification/profile-status/
# ─────────────────────────────────────────────────────────────────────────────

class ProfileStatusView(APIView):
    """
    GET /api/gamification/profile-status/
    ─────────────────────────────────────────────────────────────────────────────
    Lightweight check used by the dashboard on mount to decide which view to
    render:
        • Admin/superuser  → { is_admin: true }
        • No profile yet   → { has_builder_profile: false }
        • Profile exists   → { has_builder_profile: true, profile: {...} }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if _is_admin(user):
            return Response({'is_admin': True, 'has_builder_profile': False})

        profile = _get_profile_or_none(user)
        if profile is None:
            return Response({'is_admin': False, 'has_builder_profile': False})

        serializer = BuilderProfileSerializer(profile)
        return Response({
            'is_admin':           False,
            'has_builder_profile': True,
            'profile':            serializer.data,
        })


# ─────────────────────────────────────────────────────────────────────────────
# C. Daily Check-in — POST /api/gamification/checkin/   (hardened)
# ─────────────────────────────────────────────────────────────────────────────

class DailyCheckinView(APIView):
    """
    Handles the daily check-in gamification event.
    Called when an authenticated user opens the dashboard.

    Guardrails (NEW):
        • Admin/superuser    → silent no-op (no XP/streak modifications).
        • No BuilderProfile  → silent no-op (user hasn't onboarded yet).
        • is_core_team       → acknowledge but DO NOT modify XP / streaks.
        • Already checked in today → inform the user, no changes.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user    = request.user
        today   = datetime.date.today()

        # ── Admin gate ──────────────────────────────────────────────────────
        if _is_admin(user):
            return Response(
                {'message': 'Admin check-in acknowledged. Gamification disabled.', 'is_admin': True},
                status=status.HTTP_200_OK,
            )

        # ── Profile gate ────────────────────────────────────────────────────
        profile = _get_profile_or_none(user)
        if profile is None:
            return Response(
                {'message': 'Complete your Builder Profile to start earning XP and streaks!',
                 'has_builder_profile': False},
                status=status.HTTP_200_OK,
            )

        # ── Fair Play gate ──────────────────────────────────────────────────
        if profile.is_core_team:
            return Response(
                {'message': 'Admin check-in successful. XP tracking disabled for Fair Play.',
                 'is_core_team': True},
                status=status.HTTP_200_OK,
            )

        last = profile.last_checkin_date

        # ── Already checked in today ────────────────────────────────────────
        if last == today:
            return Response(
                {
                    'message': 'Already checked in today! Come back tomorrow to keep your streak alive. 🔥',
                    'already_checked_in': True,
                    'profile': BuilderProfileSerializer(profile).data,
                },
                status=status.HTTP_200_OK,
            )

        # ── First-time or continuation / reset logic ────────────────────────
        yesterday = today - datetime.timedelta(days=1)
        if last == yesterday:
            profile.current_streak += 1
        else:
            profile.current_streak = 1

        profile.xp_points        += 10
        profile.last_checkin_date = today

        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

        profile.save()
        logger.info(
            '[Gamification] Check-in — %s: streak=%d xp=%d',
            user.username, profile.current_streak, profile.xp_points,
        )

        return Response(
            {
                'message': f'Check-in successful! +10 XP 🎉 Streak: {profile.current_streak} day(s).',
                'already_checked_in': False,
                'profile': BuilderProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# D. Leaderboard — GET /api/gamification/leaderboard/
# ─────────────────────────────────────────────────────────────────────────────

class LeaderboardView(APIView):
    """
    Returns the top 10 students by XP points.
    Core team members are strictly excluded (Fair Play).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        top_students = (
            BuilderProfile.objects
            .filter(is_core_team=False)
            .order_by('-xp_points', '-current_streak')[:10]
        )
        serializer = BuilderProfileSerializer(top_students, many=True)
        return Response(
            {'count': top_students.count(), 'leaderboard': serializer.data},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# E. My Profile — GET/PATCH /api/gamification/my-profile/   (hardened)
# ─────────────────────────────────────────────────────────────────────────────

class MyProfileView(APIView):
    """
    GET  /api/gamification/my-profile/
    PATCH/PUT /api/gamification/my-profile/
    Hardened: returns has_builder_profile in every response.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if _is_admin(user):
            return Response({'is_admin': True, 'has_builder_profile': False})

        profile = _get_profile_or_none(user)
        if profile is None:
            return Response({'has_builder_profile': False})

        data = BuilderProfileSerializer(profile).data
        data['has_builder_profile'] = True
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        return self._update_profile(request)

    def put(self, request):
        return self._update_profile(request)

    def _update_profile(self, request):
        user    = request.user
        profile = _get_profile_or_none(user)

        if profile is None:
            return Response(
                {'detail': 'No Builder Profile found. Please complete onboarding first.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        from apps.students.models import StudentProfile
        sp, _ = StudentProfile.objects.get_or_create(user=user)

        d = request.data
        if 'course'         in d: sp.course        = str(d['course']).strip()
        if 'branch'         in d: sp.branch        = str(d['branch']).strip()
        if 'section'        in d: sp.section       = str(d['section']).strip()
        if 'roll_number'    in d: sp.roll_number   = str(d['roll_number']).strip()
        if 'academic_year'  in d: sp.academic_year = str(d['academic_year']).strip()
        elif 'current_year' in d: sp.academic_year = str(d['current_year']).strip()
        if 'mobile_number'  in d: sp.mobile_number = str(d['mobile_number']).strip()
        if 'full_name' in d and d['full_name']:
            sp.full_name = str(d['full_name']).strip()
        sp.save()

        data = BuilderProfileSerializer(profile).data
        data['has_builder_profile'] = True
        return Response(data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# F. Global Daily-Visit Engagement Tracker — POST /api/gamification/daily-visit/
# ─────────────────────────────────────────────────────────────────────────────

class DailyVisitView(APIView):
    """
    POST /api/gamification/daily-visit/
    Global 5-second rule tracker. Awards +5 XP per unique day,
    +20 bonus at every 5-day streak milestone.

    Guardrails (NEW):
        • Admin/superuser   → silent no-op.
        • No BuilderProfile → silent no-op (user hasn't onboarded yet).
        • is_core_team      → acknowledge, no XP/streak change.
        • Already visited today → idempotent no-op.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user  = request.user
        today = datetime.date.today()

        # ── Admin gate ──────────────────────────────────────────────────────
        if _is_admin(user):
            return Response(
                {'streak_updated': False, 'is_admin': True},
                status=status.HTTP_200_OK,
            )

        # ── Profile gate ────────────────────────────────────────────────────
        profile = _get_profile_or_none(user)
        if profile is None:
            return Response(
                {'streak_updated': False, 'has_builder_profile': False,
                 'message': 'Create your Builder Profile to start earning XP!'},
                status=status.HTTP_200_OK,
            )

        # ── Fair-play gate ──────────────────────────────────────────────────
        if profile.is_core_team:
            return Response(
                {'streak_updated': False, 'is_core_team': True,
                 'message': 'Fair Play mode — XP and streaks disabled for core team.'},
                status=status.HTTP_200_OK,
            )

        last = profile.last_checkin_date

        # ── Already visited today ────────────────────────────────────────────
        if last == today:
            return Response(
                {'streak_updated': False, 'already_visited': True,
                 'message': 'Already active today! Come back tomorrow to grow your streak. 🔥',
                 'profile': BuilderProfileSerializer(profile).data},
                status=status.HTTP_200_OK,
            )

        # ── New day — streak + XP logic ─────────────────────────────────────
        yesterday = today - datetime.timedelta(days=1)
        if last == yesterday:
            profile.current_streak += 1
        else:
            profile.current_streak  = 1

        xp_earned     = DAILY_VISIT_XP
        milestone_hit = False

        if profile.current_streak % STREAK_MILESTONE_EVERY == 0:
            xp_earned    += STREAK_MILESTONE_XP
            milestone_hit = True
            logger.info(
                '[Gamification] 🏆 Milestone: %s streak=%d +%d bonus XP',
                user.username, profile.current_streak, STREAK_MILESTONE_XP,
            )

        profile.xp_points        += xp_earned
        profile.last_checkin_date = today

        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

        profile.save()

        logger.info(
            '[Gamification] Daily visit — %s: streak=%d xp=%d earned=%d milestone=%s',
            user.username, profile.current_streak, profile.xp_points, xp_earned, milestone_hit,
        )

        if milestone_hit:
            message = (
                f'🏆 {profile.current_streak}-Day Milestone! '
                f'+{xp_earned} XP (includes +{STREAK_MILESTONE_XP} bonus reward)!'
            )
        else:
            streak_word = 'day' if profile.current_streak == 1 else 'days'
            message = (
                f'🔥 Streak updated! +{xp_earned} XP — '
                f'{profile.current_streak} {streak_word} in a row!'
            )

        return Response(
            {
                'streak_updated':   True,
                'already_visited':  False,
                'milestone_hit':    milestone_hit,
                'milestone_streak': profile.current_streak if milestone_hit else None,
                'bonus_xp':         xp_earned,
                'message':          message,
                'profile':          BuilderProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )
