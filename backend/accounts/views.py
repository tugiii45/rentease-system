from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CreateTenantSerializer


class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


class CreateTenantView(APIView):
    permission_classes = [IsLandlord]

    def post(self, request):
        serializer = CreateTenantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lease = serializer.save()
        return Response(
            {"message": f"Tenant account created for unit {lease.unit.code}."},
            status=201
        )