from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'amount', 'status', 'mpesa_receipt_number', 'created_at')
    list_filter = ('status',)
    readonly_fields = ('checkout_request_id', 'merchant_request_id', 'mpesa_receipt_number')