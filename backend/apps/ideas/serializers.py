from rest_framework import serializers
from .models import Idea


class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Idea
        fields = ['id', 'title', 'description', 'author', 'tags', 'votes', 'created_at']
        read_only_fields = ['id', 'votes', 'created_at']
