from rest_framework import generics
from .models import Member
from .serializers import MemberSerializer


class MemberListView(generics.ListAPIView):
    """GET /api/members/ — read-only public listing"""
    queryset         = Member.objects.all()
    serializer_class = MemberSerializer


class MemberDetailView(generics.RetrieveAPIView):
    """GET /api/members/<pk>/"""
    queryset         = Member.objects.all()
    serializer_class = MemberSerializer
