from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import StudentProfile, EventRegistration

mobile_validator = RegexValidator(
    regex=r'^\d{10}$',
    message='Enter a valid 10-digit number.'
)


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializes StudentProfile fields for both reading (autofill on modal open)
    and writing (upsert on event registration).
    Email is intentionally excluded — it is locked to request.user.email on the frontend.
    """
    mobile_number = serializers.CharField(validators=[mobile_validator])

    class Meta:
        model  = StudentProfile
        fields = [
            'father_name',
            'course',
            'branch',
            'section',
            'roll_number',
            'mobile_number',
        ]


class EventRegistrationSerializer(serializers.ModelSerializer):
    """
    Write-only serializer used by the EventRegisterView POST endpoint.
    Accepts nested student profile fields + derives event/student from
    the URL and the authenticated request.user.
    """
    # Nested — submitted as part of the same POST body
    father_name   = serializers.CharField(write_only=True)
    course        = serializers.CharField(write_only=True)
    branch        = serializers.CharField(write_only=True)
    section       = serializers.CharField(write_only=True)
    roll_number   = serializers.CharField(write_only=True)
    mobile_number = serializers.CharField(
        write_only=True,
        validators=[mobile_validator]
    )

    class Meta:
        model  = EventRegistration
        fields = [
            'id', 'registered_at',
            # Profile fields submitted by the user
            'father_name', 'course', 'branch',
            'section', 'roll_number', 'mobile_number',
        ]
        read_only_fields = ['id', 'registered_at']
