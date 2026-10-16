from rest_framework import serializers
from .models import VolunteerApplication


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and reading a VolunteerApplication.

    Write path (POST):
        - All required fields must be supplied in the request body.
        - `user` is injected from the authenticated request in the view.
        - `status` is read-only — the admin sets it; students see only their
          current status, never the reject/accept logic.
        - Duplicate submission is caught via the OneToOne unique constraint and
          surfaced as a friendly 400 validation error.

    Read path (GET):
        - Returns the full application plus the current status string so the
          frontend can render the "Applied / Pending / Accepted / Rejected" badge.
        - admin_notes is deliberately excluded so internal remarks are never leaked.
    """

    # Surface the human-readable label for status (e.g. "Pending" not "pending")
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = VolunteerApplication
        fields = [
            'id',
            'full_name',
            'gender',
            'mobile_number',
            'accommodation',
            'course',
            'branch',
            'section',
            'academic_year',
            'roll_number',
            'skills',
            'motivation',
            'other_club_member',
            # ── Read-only fields ──────────────────────────────────────────────
            'status',
            'status_display',
            'applied_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'status_display', 'applied_at', 'updated_at']

    # ── Field-level validation ────────────────────────────────────────────────

    def validate_mobile_number(self, value):
        """Accept only 10-digit mobile numbers (digits only)."""
        digits = value.replace(' ', '').replace('-', '')
        if not digits.isdigit() or len(digits) < 10:
            raise serializers.ValidationError(
                'Enter a valid 10-digit mobile number.'
            )
        return value

    def validate_roll_number(self, value):
        """Roll number must be a positive integer."""
        if value <= 0:
            raise serializers.ValidationError('Roll number must be a positive integer.')
        return value

    # ── Object-level validation ───────────────────────────────────────────────

    def validate(self, attrs):
        """
        Prevent duplicate applications.
        On create the user is not yet on attrs (it is injected in the view's
        perform_create), so we pull it from the serializer context instead.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Only enforce on create (not update, though updates are not exposed)
            if self.instance is None:
                if VolunteerApplication.objects.filter(user=request.user).exists():
                    raise serializers.ValidationError(
                        {
                            'non_field_errors': (
                                'You have already submitted a volunteer application. '
                                'Each account may only apply once.'
                            )
                        }
                    )
        return attrs
