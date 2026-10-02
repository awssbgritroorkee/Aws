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
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _get_or_create_profile(user) -> BuilderProfile:
    """Return the user's BuilderProfile, creating one on-the-fly if absent."""
    profile, created = BuilderProfile.objects.get_or_create(user=user)
    if created:
        logger.info(f'[Gamification] Created missing BuilderProfile for user {user.username}')
    return profile


# ─────────────────────────────────────────────────────────────────────────────
# A. Daily Check-in API — POST /api/gamification/checkin/
# ─────────────────────────────────────────────────────────────────────────────

class DailyCheckinView(APIView):
    """
    Handles the daily check-in gamification event.

    Called when an authenticated user opens the dashboard.

    Logic:
        • Core team members → acknowledge but DO NOT modify XP / streaks.
        • Already checked in today → inform the user, no changes.
        • Check-in is from yesterday → increment streak, add +10 XP.
        • Check-in is older → reset streak to 1, add +10 XP.
        • First ever check-in (last_checkin_date is None) → start streak at 1, add +10 XP.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_profile(request.user)
        today   = datetime.date.today()

        # ── Fair Play gate ──────────────────────────────────────────────────────
        if profile.is_core_team:
            return Response(
                {
                    'message': 'Admin check-in successful. XP tracking disabled for Fair Play.',
                    'is_core_team': True,
                },
                status=status.HTTP_200_OK,
            )

        last = profile.last_checkin_date

        # ── Already checked in today ────────────────────────────────────────────
        if last == today:
            return Response(
                {
                    'message': 'Already checked in today! Come back tomorrow to keep your streak alive. 🔥',
                    'already_checked_in': True,
                    'profile': BuilderProfileSerializer(profile).data,
                },
                status=status.HTTP_200_OK,
            )

        # ── First-time or continuation / reset logic ────────────────────────────
        yesterday = today - datetime.timedelta(days=1)

        if last == yesterday:
            # Consecutive day — extend the streak
            profile.current_streak += 1
        else:
            # Gap detected — reset streak
            profile.current_streak = 1

        profile.xp_points        += 10
        profile.last_checkin_date = today

        # Keep longest_streak up to date
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

        profile.save()
        logger.info(
            f'[Gamification] Check-in for {request.user.username}: '
            f'streak={profile.current_streak}, xp={profile.xp_points}'
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
# B. Leaderboard API — GET /api/gamification/leaderboard/
# ─────────────────────────────────────────────────────────────────────────────

class LeaderboardView(APIView):
    """
    Returns the top 10 students by XP points.

    Fair Play: Core team members (is_core_team=True) are strictly excluded
    from the queryset so staff cannot dominate the student rankings.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        top_students = (
            BuilderProfile.objects
            .filter(is_core_team=False)         # Fair Play filter
            .order_by('-xp_points', '-current_streak')[:10]
        )
        serializer = BuilderProfileSerializer(top_students, many=True)
        return Response(
            {
                'count': top_students.count(),
                'leaderboard': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# C. Current User Profile API — GET /api/gamification/my-profile/
# ─────────────────────────────────────────────────────────────────────────────

class MyProfileView(APIView):
    """
    GET /api/gamification/my-profile/
    PUT /api/gamification/my-profile/
    PATCH /api/gamification/my-profile/

    Returns and updates the authenticated user's profile and academic details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        serializer = BuilderProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        return self._update_profile(request)

    def put(self, request):
        return self._update_profile(request)

    def _update_profile(self, request):
        from apps.students.models import StudentProfile
        profile = _get_or_create_profile(request.user)
        sp, _ = StudentProfile.objects.get_or_create(user=request.user)

        data = request.data
        if 'course' in data:
            sp.course = str(data['course']).strip()
        if 'branch' in data:
            sp.branch = str(data['branch']).strip()
        if 'section' in data:
            sp.section = str(data['section']).strip()
        if 'roll_number' in data:
            sp.roll_number = str(data['roll_number']).strip()
        if 'academic_year' in data:
            sp.academic_year = str(data['academic_year']).strip()
        elif 'current_year' in data:
            sp.academic_year = str(data['current_year']).strip()
        if 'mobile_number' in data:
            sp.mobile_number = str(data['mobile_number']).strip()
        if 'full_name' in data and data['full_name']:
            sp.full_name = str(data['full_name']).strip()

        sp.save()

        serializer = BuilderProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

