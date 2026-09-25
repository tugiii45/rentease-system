from rest_framework import serializers
from .models import Thread, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'sender_name', 'content', 'sent_at']
        read_only_fields = ['sender', 'sent_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

class ThreadSerializer(serializers.ModelSerializer):
    participant_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id', 'thread_type', 'name', 'participants', 'participant_names',
            'created_by', 'created_at', 'last_message',
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_participant_names(self, obj):
      return [u.get_full_name() or u.username for u in obj.participants.all()]

    def get_last_message(self, obj):
      last = obj.messages.last()
      if last:
        return {
            "content": last.content,
            "sender_name": last.sender.get_full_name() or last.sender.username,
            "sent_at": last.sent_at,
        }
      return None