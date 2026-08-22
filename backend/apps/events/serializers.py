from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    poster = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'date', 'description',
            'poster', 'status', 'registration_link', 'created_at',
        ]

    def get_poster(self, obj):
        """Return the Cloudinary secure URL for the event poster, or None."""
        if obj.poster:
            return obj.poster.url
        return None
