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
            'image', 'skills', 'linkedin', 'instagram', 'portfolio_url',
            'is_lead', 'category', 'priority_order',
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


class MyProfileSerializer(serializers.ModelSerializer):
    """
    Read/Write serializer for the authenticated team member's own profile.
    Used by GET /api/members/my-profile/ and PATCH /api/members/my-profile/.

    - `image` is read as an absolute URL.
    - All writable fields are individually listed so that `user`, `is_lead`,
      and `priority_order` cannot be self-modified (security).
    """
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Member
        fields = [
            'id',
            # Identity
            'name', 'role', 'badge', 'tagline', 'bio',
            # Social & Portfolio
            'linkedin', 'instagram', 'portfolio_url',
            # Skills (JSON list)
            'skills',
            # Image — upload via multipart, read as URL
            'image', 'image_url',
            # Read-only info
            'is_lead', 'category', 'priority_order',
        ]
        read_only_fields = ['id', 'is_lead', 'category', 'priority_order', 'image_url']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        """Return the absolute URL of the profile image, or None."""
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
