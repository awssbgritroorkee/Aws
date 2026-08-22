from rest_framework import serializers
from .models import GalleryPhoto


class GalleryPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = GalleryPhoto
        fields = ['id', 'title', 'image', 'uploaded_at']

    def get_image(self, obj):
        """Return the Cloudinary secure URL for the photo."""
        if obj.image:
            return obj.image.url
        return None
