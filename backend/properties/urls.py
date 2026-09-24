from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import PropertyViewSet, UnitViewSet, OccupancySummaryView

router = DefaultRouter()
router.register('properties', PropertyViewSet)
router.register('units', UnitViewSet)

urlpatterns = router.urls + [
    path('occupancy-summary/', OccupancySummaryView.as_view(), name='occupancy-summary'),
]