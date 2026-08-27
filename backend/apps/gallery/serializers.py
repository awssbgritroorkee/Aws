from rest_framework import serializers
from .models import GalleryAlbum, GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    """Serialises a single image inside an album."""
    image = serializers.SerializerMethodField()

    class Meta:
        model  = GalleryImage
        fields = ['id', 'image', 'caption']

    def get_image(self, obj):
        """Return absolute URL — handles both local paths and Cloudinary URLs."""
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


class GalleryAlbumSerializer(serializers.ModelSerializer):
    """
    Serialises a GalleryAlbum with its nested images.
    Returned by GET /api/gallery/ — frontend consumes albums with images[].
    """
    images       = GalleryImageSerializer(many=True, read_only=True)
    image_count  = serializers.SerializerMethodField()
    cover_image  = serializers.SerializerMethodField()

    class Meta:
        model  = GalleryAlbum
        fields = [
            'id', 'title', 'category', 'description',
            'event_date', 'created_at',
            'cover_image', 'image_count', 'images',
        ]

    def get_image_count(self, obj):
        return obj.images.count()

    def get_cover_image(self, obj):
        """Returns the URL of the first image as album cover/thumbnail."""
        first = obj.images.first()
        if not first or not first.image:
            return None
        try:
            url = first.image.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return f"https://aws-swae.onrender.com{url}"
        except Exception:
            return str(first.image)
