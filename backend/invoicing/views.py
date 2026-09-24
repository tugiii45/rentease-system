from rest_framework import viewsets, permissions
from .models import Invoice
from .serializers import InvoiceSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date

class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Landlord sees ALL invoices (with filtering).
    Tenant sees ONLY their own invoices.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'LANDLORD':
            queryset = Invoice.objects.all()
            status_param = self.request.query_params.get('status')
            month_param = self.request.query_params.get('month')
            if status_param:
                queryset = queryset.filter(status=status_param.upper())
            if month_param:
                queryset = queryset.filter(month=month_param)
            return queryset
        else:
            return Invoice.objects.filter(lease__tenant=user)


class DashboardSummaryView(APIView):
    permission_classes = [IsLandlord]

    def get(self, request):
        today = date.today()
        first_of_month = today.replace(day=1)

        this_month_invoices = Invoice.objects.filter(month=first_of_month)
        overdue_invoices = Invoice.objects.filter(status__in=['UNPAID', 'PARTIAL'], month__lt=first_of_month)

        total_expected = this_month_invoices.aggregate(total=Sum('amount_due'))['total'] or 0
        total_collected = this_month_invoices.aggregate(total=Sum('amount_paid'))['total'] or 0

        paid_count = this_month_invoices.filter(status='PAID').count()
        unpaid_count = this_month_invoices.filter(status='UNPAID').count()
        partial_count = this_month_invoices.filter(status='PARTIAL').count()

        return Response({
            "month": first_of_month.strftime('%B %Y'),
            "total_expected": total_expected,
            "total_collected": total_collected,
            "collection_rate": round((total_collected / total_expected * 100), 1) if total_expected else 0,
            "paid_count": paid_count,
            "unpaid_count": unpaid_count,
            "partial_count": partial_count,
            "unpaid_tenants": [
                {
                    "tenant_name": inv.lease.tenant.get_full_name(),
                    "unit_code": inv.lease.unit.code,
                    "amount_due": inv.amount_due,
                }
                for inv in this_month_invoices.exclude(status='PAID')
            ],
            "chronic_arrears": [
                {
                    "tenant_name": inv.lease.tenant.get_full_name(),
                    "unit_code": inv.lease.unit.code,
                    "month": inv.month.strftime('%B %Y'),
                    "amount_outstanding": inv.amount_due - inv.amount_paid,
                }
                for inv in overdue_invoices
            ],
        })        