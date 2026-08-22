import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    """Allows filtering events by status: ?status=upcoming  or  ?status=past"""
    class Meta:
        model  = Event
        fields = ['status']
