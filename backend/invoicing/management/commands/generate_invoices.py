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
        due_date = first_of_month + relativedelta(days=4)

        active_leases = Lease.objects.filter(is_active=True)
        created_count = 0

        for lease in active_leases:
            # Carry forward any unpaid balance from the previous invoice
            previous_invoice = Invoice.objects.filter(lease=lease).exclude(month=first_of_month).order_by('-month').first()
            balance_forward = (previous_invoice.amount_due - previous_invoice.amount_paid) if previous_invoice and previous_invoice.status != 'PAID' else 0

            invoice, created = Invoice.objects.get_or_create(
                lease=lease,
                month=first_of_month,
                defaults={
                    'rent_amount': lease.unit.monthly_rent,
                    'balance_brought_forward': balance_forward,
                    'amount_due': lease.unit.monthly_rent + balance_forward,
                    'due_date': due_date,
                }
            )
            if created:
                invoice.generate_qr_code()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f"Created invoice for {lease.tenant.get_full_name()} - {lease.unit.code}"
                ))

        self.stdout.write(self.style.SUCCESS(f"\nDone. {created_count} invoice(s) created."))