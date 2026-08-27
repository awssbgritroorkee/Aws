from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import GalleryAlbum
from .serializers import GalleryAlbumSerializer


class GalleryAlbumListView(generics.ListAPIView):
    """
    GET /api/gallery/
    Returns all gallery albums with nested images, ordered by event date.
    Supports ?category=Workshop filtering via query param.
    Read-only — albums are managed via Django Admin.
    """
    serializer_class    = GalleryAlbumSerializer
    filter_backends     = [DjangoFilterBackend]
    filterset_fields    = ['category']

    def get_queryset(self):
        # prefetch_related avoids N+1 queries for nested images
        return GalleryAlbum.objects.prefetch_related('images').order_by('-event_date', '-created_at')
