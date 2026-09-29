from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import InvoiceViewSet, DashboardSummaryView, InvoiceQRLookupView, UpdateInvoiceChargesView

router = DefaultRouter()
router.register('invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('invoices/lookup/', InvoiceQRLookupView.as_view(), name='invoice-qr-lookup'),
    path('invoices/<int:pk>/charges/', UpdateInvoiceChargesView.as_view(), name='invoice-update-charges'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
] + router.urls