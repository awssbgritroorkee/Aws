from django.urls import path
from .views import GalleryAlbumListView

urlpatterns = [
    path('', GalleryAlbumListView.as_view(), name='gallery-list'),
]
