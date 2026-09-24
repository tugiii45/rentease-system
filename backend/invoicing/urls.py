from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import InvoiceViewSet, DashboardSummaryView

router = DefaultRouter()
router.register('invoices', InvoiceViewSet, basename='invoice')

urlpatterns = router.urls + [
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]