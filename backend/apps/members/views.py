from rest_framework import generics
from .models import Member
from .serializers import MemberSerializer


class MemberListView(generics.ListAPIView):
    """
    GET /api/members/
    Returns all team members ordered by priority_order then name.
    Read-only — team management is done exclusively through Django Admin.
    """
    queryset         = Member.objects.all()
    serializer_class = MemberSerializer
