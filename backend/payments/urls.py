from django.urls import path
from .views import InitiatePaymentView, MpesaCallbackView

urlpatterns = [
    path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]