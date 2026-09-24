from rest_framework import serializers


class InitiatePaymentSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()
    phone_number = serializers.CharField(help_text="Format: 07XXXXXXXX or 2547XXXXXXXX")

    def validate_phone_number(self, value):
        value = value.strip().replace(' ', '')
        if value.startswith('0') and len(value) == 10:
            value = '254' + value[1:]
        elif value.startswith('+254'):
            value = value[1:]
        elif value.startswith('254') and len(value) == 12:
            pass
        else:
            raise serializers.ValidationError("Enter a valid Safaricom number, e.g. 0712345678")
        return value


class MpesaCallbackSerializer(serializers.Serializer):
    """
    We don't strictly validate Daraja's callback shape with field-by-field rules,
    since it's Safaricom's fixed format — we just extract what we need in the view.
    """
    pass    