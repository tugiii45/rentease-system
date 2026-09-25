from rest_framework import viewsets, permissions
from .models import IssueTicket
from .serializers import IssueTicketSerializer


class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LANDLORD'


class IssueTicketViewSet(viewsets.ModelViewSet):
    serializer_class = IssueTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'LANDLORD':
            queryset = IssueTicket.objects.all()
            status_param = self.request.query_params.get('status')
            category_param = self.request.query_params.get('category')
            if status_param:
                queryset = queryset.filter(status=status_param.upper())
            if category_param:
                queryset = queryset.filter(category=category_param.upper())
            return queryset
        return IssueTicket.objects.filter(tenant=user)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsLandlord()]
        return [permissions.IsAuthenticated()]