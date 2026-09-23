from django.db import models
from django.conf import settings
from properties.models import Unit


class Lease(models.Model):
    """Represents a tenant's occupancy of a unit."""
    tenant = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lease',
        limit_choices_to={'role': 'TENANT'},
    )
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name='leases')
    move_in_date = models.DateField()
    move_out_date = models.DateField(null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.get_full_name()} - {self.unit.code}"


class RepairExpense(models.Model):
    """Tracks how a tenant's deposit was spent on repairs before move-in."""
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='repair_expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - KES {self.amount}"