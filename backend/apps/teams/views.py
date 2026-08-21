from rest_framework import generics
from .models import TeamRequest
from .serializers import TeamRequestSerializer


class TeamListCreateView(generics.ListCreateAPIView):
    queryset         = TeamRequest.objects.all()
    serializer_class = TeamRequestSerializer


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset         = TeamRequest.objects.all()
    serializer_class = TeamRequestSerializer
