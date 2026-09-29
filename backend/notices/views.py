from rest_framework import viewsets, permissions
from .models import Notice
from .serializers import NoticeSerializer
from django.contrib.auth import get_user_model
from accounts.push import send_push_notification

class IsLandlordOrReadOnly(permissions.BasePermission):
    """
    Everyone authenticated can VIEW notices.
    Only the landlord can create/edit/delete them.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


User = get_user_model()


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [IsLandlordOrReadOnly]

    def perform_create(self, serializer):
        notice = serializer.save(posted_by=self.request.user)

        tenants = User.objects.filter(role='TENANT', is_active_tenant=True).exclude(push_token__isnull=True).exclude(push_token='')
        for tenant in tenants:
            send_push_notification(
                tenant.push_token,
                title="New notice",
                body=notice.title,
                data={"type": "notice", "notice_id": notice.id},
            )