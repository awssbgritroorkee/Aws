from rest_framework import serializers
from .models import GalleryPhoto


class GalleryPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = GalleryPhoto
        fields = ['id', 'title', 'image', 'uploaded_at']

    def get_image(self, obj):
        """Return absolute URL for gallery photo or None."""
        if obj.image:
            try:
                url = obj.image.url
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return f"http://127.0.0.1:8000{url}"
            except Exception:
                return str(obj.image)
        return None
