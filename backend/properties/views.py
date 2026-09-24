from rest_framework import viewsets, permissions
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer
from rest_framework.views import APIView
from rest_framework.response import Response



class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


class OccupancySummaryView(APIView):
    permission_classes = [IsLandlord]

    def get(self, request):
        properties_data = []

        for prop in Property.objects.all():
            units = prop.units.all()
            occupied = units.filter(is_occupied=True)
            vacant = units.filter(is_occupied=False)

            properties_data.append({
                "property_id": prop.id,
                "property_name": prop.name,
                "total_units": units.count(),
                "occupied_count": occupied.count(),
                "vacant_count": vacant.count(),
                "occupancy_rate": round((occupied.count() / units.count() * 100), 1) if units.count() else 0,
                "vacant_units": [
                    {"unit_id": u.id, "code": u.code, "monthly_rent": u.monthly_rent}
                    for u in vacant
                ],
                "occupied_units": [
                    {
                        "unit_id": u.id,
                        "code": u.code,
                        "monthly_rent": u.monthly_rent,
                        "tenant_name": u.leases.filter(is_active=True).first().tenant.get_full_name()
                        if u.leases.filter(is_active=True).exists() else None,
                    }
                    for u in occupied
                ],
            })

        total_units = Unit.objects.count()
        total_occupied = Unit.objects.filter(is_occupied=True).count()
        total_vacant = Unit.objects.filter(is_occupied=False).count()

        return Response({
            "overall": {
                "total_units": total_units,
                "occupied_count": total_occupied,
                "vacant_count": total_vacant,
                "occupancy_rate": round((total_occupied / total_units * 100), 1) if total_units else 0,
            },
            "properties": properties_data,
        })    