from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Write-only serializer for contact form submissions.
    All fields are writable on POST. created_at is auto-set by the model.
    """
    class Meta:
        model  = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'year', 'domains', 'created_at']
        read_only_fields = ['id', 'created_at']
