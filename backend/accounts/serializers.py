import secrets
import string
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from leases.models import Lease
from properties.models import Unit

User = get_user_model()


def generate_temp_password(length=10):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


class CreateTenantSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    unit_id = serializers.IntegerField()
    move_in_date = serializers.DateField()
    deposit_amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_unit_id(self, value):
        try:
            unit = Unit.objects.get(id=value)
        except Unit.DoesNotExist:
            raise serializers.ValidationError("Unit does not exist.")
        if unit.is_occupied:
            raise serializers.ValidationError("This unit is already occupied.")
        return value

    def create(self, validated_data):
        unit = Unit.objects.get(id=validated_data['unit_id'])
        temp_password = generate_temp_password()

        username = validated_data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        tenant = User.objects.create_user(
            username=username,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=temp_password,
            role=User.Role.TENANT,
            must_change_password=True,
        )

        lease = Lease.objects.create(
            tenant=tenant,
            unit=unit,
            move_in_date=validated_data['move_in_date'],
            deposit_amount=validated_data['deposit_amount'],
        )

        unit.is_occupied = True
        unit.save()

        send_mail(
            subject="Welcome to Rentease — Your Login Details",
            message=(
                f"Hi {tenant.first_name},\n\n"
                f"Your landlord has created your tenant account.\n\n"
                f"Username: {username}\n"
                f"Temporary Password: {temp_password}\n\n"
                f"Please log in and change your password immediately.\n\n"
                f"Unit: {unit.code}\n"
                f"Monthly Rent: KES {unit.monthly_rent}\n"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tenant.email],
        )

        return lease