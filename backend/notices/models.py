from django.db import models
from django.conf import settings


class Notice(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notices',
        limit_choices_to={'role': 'LANDLORD'},
    )
    is_pinned = models.BooleanField(default=False, help_text="Pinned notices show at the top")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title