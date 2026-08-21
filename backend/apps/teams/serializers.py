from rest_framework import serializers
from .models import TeamRequest


class TeamRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TeamRequest
        fields = ['id', 'project', 'description', 'skills_needed', 'contact', 'created_at']
        read_only_fields = ['id', 'created_at']
