from celery import shared_task
from django.core.management import call_command


@shared_task
def generate_monthly_invoices():
    call_command('generate_invoices')