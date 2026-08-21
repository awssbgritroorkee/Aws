from rest_framework import generics
from .models import Idea
from .serializers import IdeaSerializer


class IdeaListCreateView(generics.ListCreateAPIView):
    """GET /api/ideas/ — list all | POST /api/ideas/ — create new"""
    queryset         = Idea.objects.all()
    serializer_class = IdeaSerializer


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/ideas/<pk>/"""
    queryset         = Idea.objects.all()
    serializer_class = IdeaSerializer
