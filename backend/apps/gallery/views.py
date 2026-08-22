from rest_framework import generics
from .models import GalleryPhoto
from .serializers import GalleryPhotoSerializer


class GalleryListView(generics.ListAPIView):
    """
    GET /api/gallery/
    Returns all gallery photos ordered by upload date (newest first).
    Read-only — photos are managed via Django Admin.
    """
    queryset         = GalleryPhoto.objects.all()
    serializer_class = GalleryPhotoSerializer
