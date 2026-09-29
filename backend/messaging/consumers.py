import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Thread, Message
from accounts.push import send_push_notification


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.room_group_name = f'chat_{self.thread_id}'
        self.user = self.scope['user']

        # Security: reject connection if user isn't authenticated or not a participant
        if not self.user.is_authenticated:
            await self.close()
            return

        is_participant = await self.is_user_participant()
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('message', '').strip()

        if not content:
            return

        message = await self.save_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': content,
                'sender_id': self.user.id,
                'sender_name': self.user.get_full_name() or self.user.username,
                'message_id': message.id,
                'sent_at': message.sent_at.isoformat(),
            }
        )

        await self.notify_other_participants(content)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'message_id': event['message_id'],
            'sent_at': event['sent_at'],
        }))

    @database_sync_to_async
    def is_user_participant(self):
        try:
            thread = Thread.objects.get(id=self.thread_id)
            return thread.participants.filter(id=self.user.id).exists()
        except Thread.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        thread = Thread.objects.get(id=self.thread_id)
        return Message.objects.create(thread=thread, sender=self.user, content=content)

    @database_sync_to_async
    def notify_other_participants(self, content):
        thread = Thread.objects.get(id=self.thread_id)
        sender_name = self.user.get_full_name() or self.user.username
        for participant in thread.participants.exclude(id=self.user.id):
            if participant.push_token:
                send_push_notification(
                    participant.push_token,
                    title=sender_name,
                    body=content,
                    data={"type": "message", "thread_id": thread.id},
                )