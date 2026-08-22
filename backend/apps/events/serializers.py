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
        """Return absolute URL for event poster or None."""
        if obj.poster:
            try:
                url = obj.poster.url
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return f"http://127.0.0.1:8000{url}"
            except Exception:
                return str(obj.poster)
        return None
