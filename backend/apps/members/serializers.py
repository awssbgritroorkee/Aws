from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    """
    Serialises all Member fields for the public /api/members/ endpoint.
    The `image` CloudinaryField auto-resolves to a full HTTPS URL.
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
        """Return the Cloudinary secure URL, or None if no image uploaded."""
        if obj.image:
            return obj.image.url
        return None
