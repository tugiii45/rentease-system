from django.db import models
from invoicing.models import Invoice


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    checkout_request_id = models.CharField(max_length=100, unique=True, help_text="Returned by Daraja when STK push is initiated")
    merchant_request_id = models.CharField(max_length=100, blank=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True, unique=True)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    result_description = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.phone_number} - KES {self.amount} - {self.status}"