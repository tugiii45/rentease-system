from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = "Creates the initial landlord superuser if one doesn't already exist."

    def handle(self, *args, **options):
        username = config('LANDLORD_USERNAME', default='landlord')
        email = config('LANDLORD_EMAIL', default='landlord@example.com')
        phone = config('LANDLORD_PHONE', default='254700000000')
        password = config('LANDLORD_PASSWORD', default=None)

        if not password:
            self.stdout.write(self.style.WARNING('LANDLORD_PASSWORD not set, skipping.'))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User {username} already exists, skipping.'))
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            phone_number=phone,
            password=password,
            role='LANDLORD',
        )
        self.stdout.write(self.style.SUCCESS(f'Landlord superuser "{username}" created.'))