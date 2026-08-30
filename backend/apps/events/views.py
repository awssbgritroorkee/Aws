from rest_framework import generics
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .models import Event
from .serializers import EventSerializer
from .filters import EventFilter


class EventListView(generics.ListAPIView):
    """
    GET /api/events/
    Returns all events ordered by date descending.
    Supports filtering:  ?status=upcoming  |  ?status=past
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    queryset         = Event.objects.all()
    serializer_class = EventSerializer
    filterset_class  = EventFilter


class EventDetailView(generics.RetrieveAPIView):
    """GET /api/events/<pk>/ — single event detail."""
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    queryset         = Event.objects.all()
    serializer_class = EventSerializer
