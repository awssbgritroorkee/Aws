from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Member
        fields = ['id', 'name', 'role', 'tagline', 'bio', 'photo',
                  'skills', 'linkedin', 'github', 'is_lead', 'order']
        read_only_fields = ['id']
