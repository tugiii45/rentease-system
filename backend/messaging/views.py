from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer


class ThreadViewSet(viewsets.ModelViewSet):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(participants=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'LANDLORD':
            raise PermissionDenied("Only the landlord can start new conversations.")
        thread = serializer.save(created_by=self.request.user)
        thread.participants.add(self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post']  # no editing/deleting messages, like WhatsApp

    def get_queryset(self):
        thread_id = self.request.query_params.get('thread')
        queryset = Message.objects.filter(thread__participants=self.request.user)
        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)
        return queryset

    def perform_create(self, serializer):
        thread = serializer.validated_data['thread']
        if self.request.user not in thread.participants.all():
            raise PermissionDenied("You are not a participant in this thread.")
        serializer.save(sender=self.request.user)