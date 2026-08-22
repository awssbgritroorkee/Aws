from rest_framework import generics
from .models import Event
from .serializers import EventSerializer
from .filters import EventFilter


class EventListView(generics.ListAPIView):
    """
    GET /api/events/
    Returns all events ordered by date descending.
    Supports filtering:  ?status=upcoming  |  ?status=past
    """
    queryset         = Event.objects.all()
    serializer_class = EventSerializer
    filterset_class  = EventFilter


class EventDetailView(generics.RetrieveAPIView):
    """GET /api/events/<pk>/ — single event detail."""
    queryset         = Event.objects.all()
    serializer_class = EventSerializer
