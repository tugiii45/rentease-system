from django.contrib import admin
from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'posted_by', 'is_pinned', 'created_at')
    list_filter = ('is_pinned',)