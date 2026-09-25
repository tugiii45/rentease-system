from django.db import models
from django.conf import settings


class IssueTicket(models.Model):
    class Category(models.TextChoices):
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        THEFT = 'THEFT', 'Theft'
        CCTV_REQUEST = 'CCTV_REQUEST', 'CCTV Footage Request'
        INQUIRY = 'INQUIRY', 'General Inquiry'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'

    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='issue_tickets',
        limit_choices_to={'role': 'TENANT'},
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField()
    photo = models.ImageField(upload_to='issue_photos/', null=True, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    landlord_notes = models.TextField(blank=True, help_text="Internal response/update visible to the tenant")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_category_display()} - {self.tenant.get_full_name()} - {self.status}"