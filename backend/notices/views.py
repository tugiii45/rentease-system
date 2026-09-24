from rest_framework import viewsets, permissions


class IsLandlordOrReadOnly(permissions.BasePermission):
    """
    Everyone authenticated can VIEW notices.
    Only the landlord can create/edit/delete them.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


from .models import Notice
from .serializers import NoticeSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [IsLandlordOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)