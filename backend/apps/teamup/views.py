"""
apps/teamup/views.py

All 5 Team Up API endpoints:

  GET  /api/teamup/posts/                  — Public board (approved + active posts)
  POST /api/teamup/posts/                  — Create a new post (auth required)
  POST /api/teamup/posts/<id>/interest/    — Express interest / lock a slot (auth required)
  POST /api/teamup/posts/<id>/verify-pin/  — Verify PIN to officially join (auth required)
  POST /api/teamup/posts/<id>/reduce-slots/ — Creator manually decrements slots (auth required)
  GET  /api/teamup/my-workspace/           — Creator dashboard (auth required)

Timer Strategy (Option A — Dynamic on Read):
  sweep_expired_interests(post) is called before serialization.
  It bulk-updates any in_process interests older than 2 hours to 'timeout'.
  This requires zero background workers — safe for Render's free tier.

Auto-Cleanup (lazy, on read):
  Posts where event_ref=None and created_at + 7 days < now() are
  deleted and excluded from the queryset in the list view.
"""
import hmac
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import TeamRequest, TeamInterest
from .serializers import (
    TeamRequestListSerializer,
    TeamRequestCreateSerializer,
    MyWorkspacePostSerializer,
)
from .permissions import IsCreator

LOCK_HOURS = 2
OTHER_EXPIRY_DAYS = 7


# ── Helpers ───────────────────────────────────────────────────────────────────

def sweep_expired_interests(post):
    """
    Bulk-updates all stale 'in_process' interests for a given post to 'timeout'.
    Called before serializing any post to ensure the timer state is current.
    Returns the number of records updated.
    """
    cutoff = timezone.now() - timedelta(hours=LOCK_HOURS)
    return TeamInterest.objects.filter(
        request_post=post,
        status='in_process',
        locked_at__lt=cutoff,
    ).update(status='timeout')


def sweep_all_expired():
    """
    Bulk-updates ALL stale in_process interests (used before list serialization).
    Runs a single DB query instead of one per post — efficient for large boards.
    """
    cutoff = timezone.now() - timedelta(hours=LOCK_HOURS)
    return TeamInterest.objects.filter(
        status='in_process',
        locked_at__lt=cutoff,
    ).update(status='timeout')


def purge_expired_other_posts():
    """
    Lazily deletes 'Other' event posts that are older than 7 days.
    Called at the start of the list view — no cron required.
    """
    cutoff = timezone.now() - timedelta(days=OTHER_EXPIRY_DAYS)
    TeamRequest.objects.filter(
        event_ref__isnull=True,
        created_at__lt=cutoff,
    ).delete()


# ── Views ─────────────────────────────────────────────────────────────────────

class TeamRequestListCreateView(APIView):
    """
    GET  /api/teamup/posts/  — Public Explore Board.
    POST /api/teamup/posts/  — Create a new post (auth required).
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        # ── 1. Lazy cleanup ───────────────────────────────────────────────────
        purge_expired_other_posts()

        # ── 2. Sweep all stale interests in a single query ────────────────────
        sweep_all_expired()

        # ── 3. Build queryset — only approved, active posts ───────────────────
        qs = TeamRequest.objects.filter(
            is_approved_by_admin=True,
            is_active=True,
        ).select_related(
            'creator',
            'creator__student_profile',
        ).prefetch_related('interests')

        # Exclude posts where request.user has officially joined (status='accepted')
        if request.user and request.user.is_authenticated:
            accepted_post_ids = TeamInterest.objects.filter(
                interested_user=request.user,
                status='accepted'
            ).values_list('request_post_id', flat=True)
            qs = qs.exclude(id__in=accepted_post_ids)

        # ── 4. Optional filters ───────────────────────────────────────────────
        mode = request.query_params.get('mode')
        if mode in ('need_members', 'need_team'):
            qs = qs.filter(mode=mode)

        target_year = request.query_params.get('target_year')
        if target_year:
            qs = qs.filter(target_year=target_year)

        gender = request.query_params.get('gender_preference')
        if gender:
            qs = qs.filter(gender_preference=gender)

        # ── 5. Attach pre-fetched interests for serializer privacy shield ─────
        # This avoids N+1: the serializer reads obj._prefetched_interests
        for post in qs:
            post._prefetched_interests = list(post.interests.all())

        serializer = TeamRequestListSerializer(
            qs, many=True, context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = TeamRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Sync/update creator's mobile_number in StudentProfile if provided
        mobile_number = str(request.data.get('mobile_number', '')).strip()
        if mobile_number:
            from apps.students.models import StudentProfile
            StudentProfile.objects.update_or_create(
                user=request.user,
                defaults={'mobile_number': mobile_number}
            )

        # Save post as live immediately (is_approved_by_admin=True)
        post = serializer.save(
            creator=request.user,
            is_approved_by_admin=True,
        )
        return Response(
            {
                'id': post.id,
                'detail': 'Success! Your post is now live on the Explore Board.',
            },
            status=status.HTTP_201_CREATED
        )


class TeamRequestDetailView(APIView):
    """
    DELETE /api/teamup/posts/<post_id>/ — Delete a post (creator only)
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def delete(self, request, post_id):
        try:
            post = TeamRequest.objects.get(pk=post_id)
        except TeamRequest.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        if post.creator != request.user:
            return Response(
                {'detail': 'Only the creator of this post can delete it.'},
                status=status.HTTP_403_FORBIDDEN
            )

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamInterestView(APIView):
    """
    POST /api/teamup/posts/<post_id>/interest/

    Locks a slot for 2 hours by creating a TeamInterest with status='in_process'.
    Rules:
      - Creator cannot express interest in their own post.
      - Duplicate interest is rejected.
      - Cannot express interest if post is full (members_needed == 0) or inactive.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = TeamRequest.objects.get(
                pk=post_id,
                is_approved_by_admin=True,
                is_active=True,
            )
        except TeamRequest.DoesNotExist:
            return Response(
                {'detail': 'Post not found or no longer active.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if post.creator == request.user:
            return Response(
                {'detail': 'You cannot express interest in your own post.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if post.members_needed <= 0:
            return Response(
                {'detail': 'All slots have been filled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sweep expired interests for this post
        sweep_expired_interests(post)

        # Check for existing interest record
        existing = TeamInterest.objects.filter(
            request_post=post,
            interested_user=request.user,
        ).first()

        if existing:
            if existing.status == 'timeout':
                # Allow re-interest after timeout by deleting old record
                existing.delete()
            elif existing.status in ('in_process', 'accepted'):
                locked_until = (existing.locked_at + timedelta(hours=LOCK_HOURS)).isoformat()
                return Response(
                    {
                        'detail': f'You already have a {"pending" if existing.status == "in_process" else "accepted"} interest for this post.',
                        'status': existing.status,
                        'locked_until': locked_until,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Enforce max 4 pending applicants per open slot
        max_allowed_interests = post.members_needed * 4
        current_in_process_count = TeamInterest.objects.filter(
            request_post=post,
            status='in_process'
        ).count()

        if current_in_process_count >= max_allowed_interests:
            return Response(
                {'detail': 'This post has reached the maximum number of pending applicants.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        interest = TeamInterest.objects.create(
            request_post=post,
            interested_user=request.user,
            status='in_process',
        )
        locked_until = (interest.locked_at + timedelta(hours=LOCK_HOURS)).isoformat()

        # Fetch creator mobile to return immediately (user now in window)
        creator_profile = getattr(post.creator, 'student_profile', None)
        creator_mobile  = creator_profile.mobile_number if creator_profile else None

        return Response(
            {
                'detail': 'Slot locked for 2 hours. Enter the PIN before the timer runs out!',
                'status': 'in_process',
                'locked_until': locked_until,
                'creator_mobile': creator_mobile,
            },
            status=status.HTTP_201_CREATED
        )


class PinVerifyView(APIView):
    """
    POST /api/teamup/posts/<post_id>/verify-pin/

    Accepts { "pin": "1234" }.
    Validates:
      1. User has an active 'in_process' interest.
      2. The 2-hour window has not expired.
      3. The submitted PIN matches post.secret_pin.

    On success:
      - interest.status → 'accepted'
      - post.members_needed -= 1
      - If members_needed hits 0 → post.is_active = False (hidden from board)
    All writes are atomic (transaction.atomic).
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request, post_id):
        submitted_pin = str(request.data.get('pin', '')).strip()

        with transaction.atomic():
            try:
                post = TeamRequest.objects.select_for_update().get(pk=post_id)
            except TeamRequest.DoesNotExist:
                return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

            try:
                interest = TeamInterest.objects.get(
                    request_post=post,
                    interested_user=request.user,
                )
            except TeamInterest.DoesNotExist:
                return Response(
                    {'detail': 'You have not expressed interest in this post.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Sweep expiry first
            sweep_expired_interests(post)
            interest.refresh_from_db()

            if interest.status == 'timeout':
                return Response(
                    {'detail': 'Your 2-hour window has expired. Please express interest again.'},
                    status=status.HTTP_408_REQUEST_TIMEOUT
                )

            if interest.status == 'accepted':
                return Response(
                    {'detail': 'You have already joined this team!'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            actual_pin = str(post.secret_pin).strip()

            if submitted_pin != actual_pin:
                return Response(
                    {'detail': 'Incorrect Invite Code. Try again.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Atomic write: accept + decrement slot
            interest.status = 'accepted'
            interest.save(update_fields=['status'])

            post.members_needed = max(0, post.members_needed - 1)
            if post.members_needed == 0:
                post.is_active = False
            post.save(update_fields=['members_needed', 'is_active'])

        return Response(
            {
                'detail': 'Congratulations! You have officially joined the team! 🎉',
                'members_needed': post.members_needed,
            },
            status=status.HTTP_200_OK
        )


class ReduceSlotsView(APIView):
    """
    POST /api/teamup/posts/<post_id>/reduce-slots/

    Creator-only: manually decrements members_needed by 1 (for a friend
    added offline without using the PIN system).

    Permission: request.user must be the post creator.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = TeamRequest.objects.get(pk=post_id)
        except TeamRequest.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the creator can call this
        if post.creator != request.user:
            return Response(
                {'detail': 'Only the creator of this post can reduce slots.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if post.members_needed <= 0:
            return Response(
                {'detail': 'Members needed is already 0. No slots left to reduce.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            post.members_needed = max(0, post.members_needed - 1)
            if post.members_needed == 0:
                post.is_active = False
            post.save(update_fields=['members_needed', 'is_active'])

        return Response(
            {
                'detail': 'Slot reduced successfully.',
                'members_needed': post.members_needed,
                'is_active': post.is_active,
            },
            status=status.HTTP_200_OK
        )


class MyWorkspaceView(APIView):
    """
    GET /api/teamup/my-workspace/

    Returns the authenticated user's own TeamRequest posts (all statuses,
    including unapproved). Each post includes a nested list of all applicants
    (TeamInterest records with 'in_process' or 'accepted' status) with their
    contact information revealed — visible only to the creator.
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        # Sweep expired interests across all user's posts first
        user_post_ids = TeamRequest.objects.filter(
            creator=request.user
        ).values_list('id', flat=True)

        cutoff = timezone.now() - timedelta(hours=LOCK_HOURS)
        TeamInterest.objects.filter(
            request_post_id__in=user_post_ids,
            status='in_process',
            locked_at__lt=cutoff,
        ).update(status='timeout')

        posts = TeamRequest.objects.filter(
            creator=request.user,
        ).prefetch_related(
            'interests',
            'interests__interested_user',
            'interests__interested_user__student_profile',
        ).order_by('-created_at')

        serializer = MyWorkspacePostSerializer(posts, many=True)
        return Response(serializer.data)
