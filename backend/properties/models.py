from django.db import models


class Property(models.Model):
    """One of the landlord's apartment buildings."""
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Unit(models.Model):
    """A single rentable unit, e.g. 'G5', '3A', '4G'."""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
    code = models.CharField(max_length=10, help_text="Unit label, e.g. G5, 3A, 4G")
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    is_occupied = models.BooleanField(default=False)

    class Meta:
        unique_together = ('property', 'code')
        ordering = ['property', 'code']

    def __str__(self):
        return f"{self.property.name} - {self.code}"