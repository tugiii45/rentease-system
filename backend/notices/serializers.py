from rest_framework import serializers
from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)

    class Meta:
        model = Notice
        fields = ['id', 'title', 'body', 'posted_by', 'posted_by_name', 'is_pinned', 'created_at', 'updated_at']
        read_only_fields = ['posted_by', 'created_at', 'updated_at']