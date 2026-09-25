from django.contrib import admin
from .models import IssueTicket


@admin.register(IssueTicket)
class IssueTicketAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'category', 'status', 'created_at')
    list_filter = ('category', 'status')