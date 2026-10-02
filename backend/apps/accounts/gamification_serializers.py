from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BuilderProfile
from apps.students.models import StudentProfile


class BuilderProfileSerializer(serializers.ModelSerializer):
    """
    Serializes the BuilderProfile with embedded user identity fields
    and academic profile details (course, branch, roll_number, academic_year).
    """
    # ── Flattened user fields ──────────────────────────────────────────────────
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name',  read_only=True)
    email      = serializers.EmailField(source='user.email',     read_only=True)
    username   = serializers.CharField(source='user.username',   read_only=True)

    # ── Computed display fields ────────────────────────────────────────────────
    full_name = serializers.SerializerMethodField()

    # ── Academic fields (read/write from StudentProfile) ─────────────────────
    course        = serializers.CharField(required=False, allow_blank=True)
    branch        = serializers.CharField(required=False, allow_blank=True)
    section       = serializers.CharField(required=False, allow_blank=True)
    roll_number   = serializers.CharField(required=False, allow_blank=True)
    academic_year = serializers.CharField(required=False, allow_blank=True)
    current_year  = serializers.CharField(required=False, allow_blank=True)
    mobile_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = BuilderProfile
        fields = [
            # User identity (flattened)
            'username', 'first_name', 'last_name', 'email', 'full_name',
            # Gamification data
            'xp_points', 'current_streak', 'longest_streak', 'last_checkin_date',
            # Fair Play flag
            'is_core_team',
            # Academic profile fields
            'course', 'branch', 'section', 'roll_number', 'academic_year', 'current_year', 'mobile_number',
            # Audit
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'username', 'first_name', 'last_name', 'email', 'full_name',
            'xp_points', 'current_streak', 'longest_streak', 'last_checkin_date',
            'is_core_team', 'created_at', 'updated_at',
        ]

    def get_full_name(self, obj):
        """Returns display name — full name with fallback to username."""
        return obj.user.get_full_name() or obj.user.username

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            sp = instance.user.student_profile
            data['course']        = sp.course or ''
            data['branch']        = sp.branch or ''
            data['section']       = sp.section or ''
            data['roll_number']   = sp.roll_number or ''
            data['academic_year'] = sp.academic_year or ''
            data['current_year']  = sp.academic_year or ''
            data['mobile_number'] = sp.mobile_number or ''
        except StudentProfile.DoesNotExist:
            data['course']        = ''
            data['branch']        = ''
            data['section']       = ''
            data['roll_number']   = ''
            data['academic_year'] = ''
            data['current_year']  = ''
            data['mobile_number'] = ''
        return data
