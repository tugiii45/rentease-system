from datetime import date
from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand
from leases.models import Lease
from invoicing.models import Invoice


class Command(BaseCommand):
    help = "Generates this month's rent invoice for every active lease that doesn't already have one."

    def handle(self, *args, **options):
        today = date.today()
        first_of_month = today.replace(day=1)
        due_date = first_of_month + relativedelta(days=4)  # rent due by the 5th, adjust as needed

        active_leases = Lease.objects.filter(is_active=True)
        created_count = 0

        for lease in active_leases:
            invoice, created = Invoice.objects.get_or_create(
                lease=lease,
                month=first_of_month,
                defaults={
                    'amount_due': lease.unit.monthly_rent,
                    'due_date': due_date,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f"Created invoice for {lease.tenant.get_full_name()} - {lease.unit.code}"
                ))

        self.stdout.write(self.style.SUCCESS(f"\nDone. {created_count} invoice(s) created."))