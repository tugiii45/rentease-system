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

from rest_framework.parsers import MultiPartParser, FormParser


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return Response(self._serialize(request.user, request))

    def patch(self, request):
        user = request.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'phone_number' in request.data:
            user.phone_number = request.data['phone_number']
        if 'profile_picture' in request.data:
            user.profile_picture = request.data['profile_picture']
        user.save()
        return Response(self._serialize(user, request))

    def _serialize(self, user, request):
        return {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
            "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
        }


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"error": "Current password is incorrect."}, status=400)

        if not new_password or len(new_password) < 6:
            return Response({"error": "New password must be at least 6 characters."}, status=400)

        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        return Response({"message": "Password changed successfully."})