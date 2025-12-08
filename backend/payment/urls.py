from django.urls import path
from .views import InitiatePaymentView, PayMongoWebhookView

urlpatterns = [
    # React Native calls this
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    
    # PayMongo calls this (Keep this URL secret/hidden if possible)
    path('webhook/', PayMongoWebhookView.as_view(), name='payment-webhook'),
]