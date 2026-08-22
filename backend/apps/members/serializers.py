from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    """
    Serialises all Member fields for the public /api/members/ endpoint.
    Builds full absolute URL for both local media and Cloudinary uploads.
    """
    image = serializers.SerializerMethodField()

    class Meta:
        model  = Member
        fields = [
            'id', 'name', 'role', 'badge', 'tagline', 'bio',
            'image', 'skills', 'linkedin', 'instagram',
            'is_lead', 'priority_order',
        ]

    def get_image(self, obj):
        """Return the absolute URL for the image or None."""
        if not obj.image:
            return None
        try:
            url = obj.image.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return f"https://aws-swae.onrender.com{url}"
        except Exception:
            return str(obj.image)

