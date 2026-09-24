from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('lease', 'month', 'amount_due', 'amount_paid', 'status', 'due_date')
    list_filter = ('status', 'month')
    readonly_fields = ('status',)