from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='lease.tenant.get_full_name', read_only=True)
    unit_code = serializers.CharField(source='lease.unit.code', read_only=True)
    property_name = serializers.CharField(source='lease.unit.property.name', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'lease', 'tenant_name', 'unit_code', 'property_name',
            'month', 'amount_due', 'amount_paid', 'due_date', 'status',
            'qr_code_url', 'created_at',
        ]
        read_only_fields = ['amount_paid', 'status', 'created_at']

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None