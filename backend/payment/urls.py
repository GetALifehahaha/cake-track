from django.urls import path
from .views import InitiatePaymentView, PayMongoWebhookView, RepayOrderView, VerifyPaymentView, PaymentHistoryView

urlpatterns = [
    # React Native calls this
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    
    # Repay an unpaid order
    path('repay/', RepayOrderView.as_view(), name='payment-repay'),
    
    # App calls this after GCash redirect to confirm payment
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),

    # Web payment history
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    
    # PayMongo calls this (Keep this URL secret/hidden if possible)
    path('webhook/', PayMongoWebhookView.as_view(), name='payment-webhook'),
]