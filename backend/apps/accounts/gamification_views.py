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


# ─────────────────────────────────────────────────────────────────────────────
# D. Global Daily-Visit Engagement Tracker — POST /api/gamification/daily-visit/
# ─────────────────────────────────────────────────────────────────────────────

class DailyVisitView(APIView):
    """
    POST /api/gamification/daily-visit/
    ──────────────────────────────────────────────────────────────────────────
    Called by the React frontend after an authenticated user has been active
    on ANY page for 5 continuous seconds (the "5-second rule").

    Logic
    ─────
    1. Fair-play gate: core-team members → acknowledge, no XP/streak change.
    2. Already visited today → return streak_updated=False (idempotent).
    3. New visit:
         a. Streak continuity check (was last_checkin_date yesterday?).
            YES  → increment current_streak.
            NO   → reset current_streak to 1 (gap in streak or first visit).
         b. Award DAILY_VISIT_XP (+5 XP).
         c. If new_streak % STREAK_MILESTONE_EVERY == 0 → award +20 bonus XP.
         d. Update last_checkin_date = today, save.

    Response keys
    ─────────────
    streak_updated   — True only when a brand-new day streak was counted.
    milestone_hit    — True when a 5-day multiple bonus was triggered.
    bonus_xp         — Total XP awarded this call (5 base + 20 if milestone).
    message          — Human-readable string for the frontend toast.
    profile          — Full BuilderProfileSerializer snapshot.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_profile(request.user)
        today   = datetime.date.today()

        # ── Fair-play gate ──────────────────────────────────────────────────
        if profile.is_core_team:
            return Response(
                {
                    'streak_updated': False,
                    'is_core_team':   True,
                    'message': 'Fair Play mode — XP and streaks disabled for core team.',
                },
                status=status.HTTP_200_OK,
            )

        last = profile.last_checkin_date

        # ── Already visited today (idempotent) ──────────────────────────────
        if last == today:
            return Response(
                {
                    'streak_updated': False,
                    'already_visited': True,
                    'message': 'Already active today! Come back tomorrow to grow your streak. 🔥',
                    'profile': BuilderProfileSerializer(profile).data,
                },
                status=status.HTTP_200_OK,
            )

        # ── New day — streak + XP logic ─────────────────────────────────────
        yesterday = today - datetime.timedelta(days=1)

        if last == yesterday:
            profile.current_streak += 1        # consecutive day
        else:
            profile.current_streak  = 1        # gap or first ever visit

        xp_earned     = DAILY_VISIT_XP        # base +5
        milestone_hit = False

        # 5-day milestone bonus
        if profile.current_streak % STREAK_MILESTONE_EVERY == 0:
            xp_earned    += STREAK_MILESTONE_XP
            milestone_hit = True
            logger.info(
                '[Gamification] 🏆 Milestone: %s reached streak=%d → +%d bonus XP',
                request.user.username, profile.current_streak, STREAK_MILESTONE_XP,
            )

        profile.xp_points        += xp_earned
        profile.last_checkin_date = today

        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

        profile.save()

        logger.info(
            '[Gamification] Daily visit — %s: streak=%d xp=%d earned=%d milestone=%s',
            request.user.username, profile.current_streak,
            profile.xp_points, xp_earned, milestone_hit,
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
