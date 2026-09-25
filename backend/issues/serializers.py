from rest_framework import serializers
from .models import IssueTicket


class IssueTicketSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.get_full_name', read_only=True)
    unit_code = serializers.SerializerMethodField()

    class Meta:
        model = IssueTicket
        fields = [
            'id', 'tenant', 'tenant_name', 'unit_code', 'category', 'description',
            'photo', 'status', 'landlord_notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['tenant', 'status', 'landlord_notes', 'created_at', 'updated_at']

    def get_unit_code(self, obj):
        lease = getattr(obj.tenant, 'lease', None)
        return lease.unit.code if lease else None