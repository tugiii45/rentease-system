from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        LANDLORD = 'LANDLORD', 'Landlord'
        TENANT = 'TENANT', 'Tenant'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.TENANT,
    )
    phone_number = models.CharField(max_length=15, unique=True)
    is_active_tenant = models.BooleanField(
        default=True,
        help_text="False when a tenant has moved out. Keeps history without deleting the account."
    )
    must_change_password = models.BooleanField(
        default=True,
        help_text="True until the tenant changes their auto-generated password on first login."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"