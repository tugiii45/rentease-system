from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from .serializers import CreateTenantSerializer


class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


class CreateTenantView(APIView):
    permission_classes = [IsLandlord]

    @extend_schema(request=CreateTenantSerializer, responses={201: None})
    def post(self, request):
        serializer = CreateTenantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lease = serializer.save()
        return Response(
            {"message": f"Tenant account created for unit {lease.unit.code}."},
            status=201
        )