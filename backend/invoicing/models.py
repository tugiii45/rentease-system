import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from leases.models import Lease
from decimal import Decimal


class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PARTIAL = 'PARTIAL', 'Partial'
        PAID = 'PAID', 'Paid'

    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='invoices')
    month = models.DateField(help_text="First day of the billing month, e.g. 2026-09-01")

    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    water_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    garbage_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_description = models.CharField(max_length=100, blank=True)
    balance_brought_forward = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNPAID)
    qr_code = models.ImageField(upload_to='invoice_qr_codes/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('lease', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.lease.tenant.get_full_name()} - {self.month.strftime('%B %Y')}"

    def calculate_total(self):
        """Sums all line items into amount_due. Call this whenever line items change."""
        self.amount_due = (
          Decimal(str(self.rent_amount)) + Decimal(str(self.water_amount)) +
          Decimal(str(self.garbage_amount)) + Decimal(str(self.other_amount)) +
          Decimal(str(self.balance_brought_forward))
    )

    def update_status(self):
        if self.amount_paid >= self.amount_due:
            self.status = self.Status.PAID
        elif self.amount_paid > 0:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.UNPAID
        self.save()

    def generate_qr_code(self):
        qr_data = f"RENTEASE_INVOICE:{self.id}"
        qr_image = qrcode.make(qr_data)
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        filename = f"invoice_{self.id}_qr.png"
        self.qr_code.save(filename, File(buffer), save=False)
        self.save()