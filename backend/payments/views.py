from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from invoicing.models import Invoice
from .serializers import InitiatePaymentSerializer
from .models import Payment
from .mpesa import initiate_stk_push
from rest_framework.permissions import AllowAny
from django.utils import timezone



class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=InitiatePaymentSerializer, responses={200: None})
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice = get_object_or_404(Invoice, id=serializer.validated_data['invoice_id'])

        if request.user.role == 'TENANT' and invoice.lease.tenant != request.user:
            return Response({"error": "You cannot pay another tenant's invoice."}, status=403)

        phone_number = serializer.validated_data['phone_number']
        amount_remaining = invoice.amount_due - invoice.amount_paid

        if amount_remaining <= 0:
            return Response({"error": "This invoice is already fully paid."}, status=400)

        daraja_response = initiate_stk_push(
            phone_number=phone_number,
            amount=amount_remaining,
            account_reference=f"Rent-{invoice.lease.unit.code}",
            transaction_desc=f"Rent payment for {invoice.month.strftime('%B %Y')}",
        )

        Payment.objects.create(
            invoice=invoice,
            phone_number=phone_number,
            amount=amount_remaining,
            checkout_request_id=daraja_response['CheckoutRequestID'],
            merchant_request_id=daraja_response.get('MerchantRequestID', ''),
            status=Payment.Status.PENDING,
        )

        return Response({
            "message": "Payment prompt sent. Please check your phone and enter your M-Pesa PIN.",
            "checkout_request_id": daraja_response['CheckoutRequestID'],
        }, status=200)



class MpesaCallbackView(APIView):
    """
    Safaricom calls this URL automatically after the tenant approves or rejects
    the STK push. This endpoint must be public (no auth) since Safaricom's
    servers are calling it directly, not a logged-in user.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        callback_data = request.data.get('Body', {}).get('stkCallback', {})

        checkout_request_id = callback_data.get('CheckoutRequestID')
        result_code = callback_data.get('ResultCode')
        result_desc = callback_data.get('ResultDesc', '')

        try:
            payment = Payment.objects.get(checkout_request_id=checkout_request_id)
        except Payment.DoesNotExist:
            # Unknown transaction — acknowledge anyway so Safaricom doesn't retry forever,
            # but don't touch any real data.
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        if result_code == 0:
            # Payment succeeded — extract the metadata Safaricom sends
            metadata_items = callback_data.get('CallbackMetadata', {}).get('Item', [])
            metadata = {item['Name']: item.get('Value') for item in metadata_items}

            payment.status = Payment.Status.SUCCESS
            payment.mpesa_receipt_number = metadata.get('MpesaReceiptNumber', '')
            payment.result_description = result_desc
            payment.confirmed_at = timezone.now()
            payment.save()

            # Update the invoice
            invoice = payment.invoice
            invoice.amount_paid += payment.amount
            invoice.update_status()

        else:
            # Payment failed or was cancelled by the tenant
            payment.status = Payment.Status.FAILED
            payment.result_description = result_desc
            payment.save()

        # Safaricom requires this exact acknowledgment format, or it will retry the callback
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})    