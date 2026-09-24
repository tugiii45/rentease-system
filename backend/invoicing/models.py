from django.db import models
from leases.models import Lease


class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PARTIAL = 'PARTIAL', 'Partial'
        PAID = 'PAID', 'Paid'

    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='invoices')
    month = models.DateField(help_text="First day of the billing month, e.g. 2026-09-01")
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNPAID)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('lease', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.lease.tenant.get_full_name()} - {self.month.strftime('%B %Y')}"

    def update_status(self):
        """Recalculate status based on amount_paid vs amount_due. Call after any payment."""
        if self.amount_paid >= self.amount_due:
            self.status = self.Status.PAID
        elif self.amount_paid > 0:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.UNPAID
        self.save()