from django.db import models
from django.conf import settings


class Thread(models.Model):
    """A conversation — either a 1-on-1 DM or a named group."""
    class ThreadType(models.TextChoices):
        DIRECT = 'DIRECT', 'Direct Message'
        GROUP = 'GROUP', 'Group'

    thread_type = models.CharField(max_length=10, choices=ThreadType.choices)
    name = models.CharField(max_length=100, blank=True, help_text="Only used for group threads")
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='threads')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_threads',
        limit_choices_to={'role': 'LANDLORD'},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.thread_type == self.ThreadType.GROUP:
            return f"Group: {self.name}"
        names = ", ".join(u.get_full_name() for u in self.participants.all())
        return f"DM: {names}"


class Message(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='read_messages', blank=True
    )

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"{self.sender.get_full_name()}: {self.content[:30]}"