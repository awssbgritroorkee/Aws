"""
apps/teamup/serializers.py

Serializer strategy:
  TeamRequestListSerializer  — Public board read. NEVER exposes secret_pin.
                               Conditionally exposes creator mobile based on
                               active 'in_process' interest for the requesting user.
  TeamRequestCreateSerializer — Write-only. Accepts secret_pin on creation.
  TeamInterestSerializer      — Nested on My Workspace; reveals applicant mobile to creator.
"""
from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from .models import TeamRequest, TeamInterest


LOCK_HOURS = 2  # The 2-hour mutual consent window


class CreatorProfileSerializer(serializers.Serializer):
    """Minimal read-only creator info shown on the public board."""
    id          = serializers.IntegerField(source='creator.id')
    full_name   = serializers.SerializerMethodField()
    email       = serializers.EmailField(source='creator.email')
    course      = serializers.SerializerMethodField()
    branch      = serializers.SerializerMethodField()
    academic_year = serializers.SerializerMethodField()
    # mobile_number: conditionally included by TeamRequestListSerializer

    def get_full_name(self, obj):
        profile = getattr(obj.creator, 'student_profile', None)
        if profile and profile.full_name:
            return profile.full_name
        return obj.creator.get_full_name() or obj.creator.email

    def get_course(self, obj):
        profile = getattr(obj.creator, 'student_profile', None)
        return profile.course if profile else None

    def get_branch(self, obj):
        profile = getattr(obj.creator, 'student_profile', None)
        return profile.branch if profile else None

    def get_academic_year(self, obj):
        profile = getattr(obj.creator, 'student_profile', None)
        if profile and profile.academic_year:
            return profile.get_academic_year_display()
        return None


class TeamRequestListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the public Explore Board.

    Privacy Shield: creator_mobile is ONLY populated when the requesting
    user has an active (non-expired) 'in_process' TeamInterest for this post.

    my_interest_status: tells the frontend which UI state to render:
      null        → no interest expressed yet
      'in_process' → lock is active, countdown timer running
      'accepted'   → officially joined
      'timeout'    → lock expired
    """
    creator_full_name   = serializers.SerializerMethodField()
    creator_email       = serializers.SerializerMethodField()
    creator_course      = serializers.SerializerMethodField()
    creator_branch      = serializers.SerializerMethodField()
    creator_academic_year = serializers.SerializerMethodField()
    creator_mobile      = serializers.SerializerMethodField()
    my_interest_status  = serializers.SerializerMethodField()
    my_locked_until     = serializers.SerializerMethodField()
    mode_display        = serializers.CharField(source='get_mode_display', read_only=True)
    target_year_display = serializers.CharField(source='get_target_year_display', read_only=True)
    gender_display      = serializers.CharField(source='get_gender_preference_display', read_only=True)

    class Meta:
        model  = TeamRequest
        # secret_pin is deliberately EXCLUDED from this list
        fields = [
            'id', 'mode', 'mode_display', 'event_name', 'members_needed',
            'target_year', 'target_year_display', 'gender_preference', 'gender_display',
            'message', 'created_at',
            'creator_full_name', 'creator_email', 'creator_course',
            'creator_branch', 'creator_academic_year', 'creator_mobile',
            'my_interest_status', 'my_locked_until',
        ]

    def _get_profile(self, obj):
        return getattr(obj.creator, 'student_profile', None)

    def get_creator_full_name(self, obj):
        profile = self._get_profile(obj)
        if profile and profile.full_name:
            return profile.full_name
        return obj.creator.get_full_name() or obj.creator.email

    def get_creator_email(self, obj):
        return obj.creator.email

    def get_creator_course(self, obj):
        profile = self._get_profile(obj)
        return profile.course if profile else None

    def get_creator_branch(self, obj):
        profile = self._get_profile(obj)
        return profile.branch if profile else None

    def get_creator_academic_year(self, obj):
        profile = self._get_profile(obj)
        if profile and profile.academic_year:
            return profile.get_academic_year_display()
        return None

    def _get_active_interest(self, obj):
        """
        Returns the requesting user's TeamInterest for this post if it exists,
        None otherwise. The result is cached on the serializer context per
        post to avoid N+1 queries (interests are pre-fetched in the view).
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        # Use pre-fetched interests from the view queryset if available
        prefetched = getattr(obj, '_prefetched_interests', None)
        if prefetched is not None:
            for interest in prefetched:
                if interest.interested_user_id == request.user.id:
                    return interest
            return None
        # Fallback: direct DB hit (should not happen if view uses prefetch_related)
        return obj.interests.filter(interested_user=request.user).first()

    def get_creator_mobile(self, obj):
        """
        Privacy shield: only reveal the creator's mobile number to a user
        who has an active 'in_process' TeamInterest for this specific post.
        """
        interest = self._get_active_interest(obj)
        if interest and interest.status == 'in_process':
            profile = self._get_profile(obj)
            return profile.mobile_number if profile else None
        return None

    def get_my_interest_status(self, obj):
        interest = self._get_active_interest(obj)
        return interest.status if interest else None

    def get_my_locked_until(self, obj):
        """
        Returns ISO timestamp of when the 2-hour lock expires.
        Only populated when status is 'in_process'.
        """
        interest = self._get_active_interest(obj)
        if interest and interest.status == 'in_process':
            return (interest.locked_at + timedelta(hours=LOCK_HOURS)).isoformat()
        return None


class TeamRequestCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for POST /api/teamup/posts/
    Accepts secret_pin; enforces business rules (mode→members_needed).
    """
    class Meta:
        model  = TeamRequest
        fields = [
            'id', 'mode', 'event_name', 'event_ref', 'members_needed',
            'target_year', 'gender_preference', 'message', 'secret_pin',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'secret_pin': {'write_only': True},
        }

    def validate(self, attrs):
        mode = attrs.get('mode')
        members_needed = attrs.get('members_needed', 1)

        if mode == 'need_team':
            # Solo builder — always 1 slot (the team itself)
            attrs['members_needed'] = 1
        elif mode == 'need_members':
            if not (1 <= members_needed <= 6):
                raise serializers.ValidationError(
                    {'members_needed': 'Must be between 1 and 6 for "need_members" mode.'}
                )
        return attrs


class TeamInterestApplicantSerializer(serializers.ModelSerializer):
    """
    Nested serializer used in My Workspace. Reveals applicant's contact info
    to the creator only (enforced at the view level via IsAuthenticated + creator check).
    """
    applicant_name   = serializers.SerializerMethodField()
    applicant_email  = serializers.EmailField(source='interested_user.email', read_only=True)
    applicant_mobile = serializers.SerializerMethodField()
    applicant_course = serializers.SerializerMethodField()
    applicant_branch = serializers.SerializerMethodField()
    applicant_year   = serializers.SerializerMethodField()

    class Meta:
        model  = TeamInterest
        fields = [
            'id', 'status', 'locked_at',
            'applicant_name', 'applicant_email', 'applicant_mobile',
            'applicant_course', 'applicant_branch', 'applicant_year',
        ]

    def _profile(self, obj):
        return getattr(obj.interested_user, 'student_profile', None)

    def get_applicant_name(self, obj):
        profile = self._profile(obj)
        if profile and profile.full_name:
            return profile.full_name
        return obj.interested_user.get_full_name() or obj.interested_user.email

    def get_applicant_mobile(self, obj):
        profile = self._profile(obj)
        return profile.mobile_number if profile else None

    def get_applicant_course(self, obj):
        profile = self._profile(obj)
        return profile.course if profile else None

    def get_applicant_branch(self, obj):
        profile = self._profile(obj)
        return profile.branch if profile else None

    def get_applicant_year(self, obj):
        profile = self._profile(obj)
        if profile and profile.academic_year:
            return profile.get_academic_year_display()
        return None


class MyWorkspacePostSerializer(serializers.ModelSerializer):
    """
    Serializer for the creator's own posts in My Workspace.
    Includes nested applicant list (interests) — creator sees all applicants' phones.
    """
    interests       = TeamInterestApplicantSerializer(many=True, read_only=True)
    mode_display    = serializers.CharField(source='get_mode_display', read_only=True)
    approval_status = serializers.SerializerMethodField()

    class Meta:
        model  = TeamRequest
        fields = [
            'id', 'mode', 'mode_display', 'event_name', 'members_needed',
            'target_year', 'gender_preference', 'message',
            'is_approved_by_admin', 'is_active', 'created_at',
            'approval_status', 'interests',
        ]

    def get_approval_status(self, obj):
        if obj.is_approved_by_admin:
            return 'Live' if obj.is_active else 'Filled'
        return 'Pending Approval'
