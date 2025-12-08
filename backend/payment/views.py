import json
import logging
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status

from backend.settings import NGROK_URL
from orders.models import Order
from .models import Payment
from .serializers import PaymentInitializeSerializers
from .paymongo import PayMongoWrapper

logger = logging.getLogger(__name__)

class InitiatePaymentView(APIView):
    """
    Called by React Native App when user taps "Pay via GCash".
    Returns a checkout URL.
    """
    def post(self, request):
        serializer = PaymentInitializeSerializers(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=http_status.HTTP_400_BAD_REQUEST)

        order = serializer.order_instance # type: ignore
        
        # 1. Validation: Prevent paying for completed/rejected orders
        if order.status in ['completed', 'rejected']:
             return Response(
                 {"error": f"Cannot pay for order with status {order.status}"}, 
                 status=http_status.HTTP_400_BAD_REQUEST
             )
        
        # 2. Validation: Check if already paid successfully
        if order.payment.filter(status='success').exists(): # type: ignore
            return Response(
                {"error": "This order has already been paid."}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # 3. Create PayMongo Source
        pm = PayMongoWrapper()
        try:
            # Use NGROK_URL so the React Native WebView can intercept it correctly
            success_url = f"{NGROK_URL}/payment/success"
            failed_url = f"{NGROK_URL}/payment/failed"

            source_data = pm.create_source(
                amount=500, # Hardcoded as requested
                redirect_success=success_url, 
                redirect_failed=failed_url
            )
            
            # CRITICAL FIX: Save the Source ID to the Order
            # This allows the Webhook to find this order later!
            order.payment_source_id = source_data['id']
            order.save()
            
            checkout_url = source_data['attributes']['redirect']['checkout_url']
            
            return Response({
                "checkout_url": checkout_url,
                "amount": 500,
                "message": "Please redirect user to checkout_url"
            }, status=http_status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"PayMongo Error: {str(e)}")
            return Response(
                {"error": "Failed to connect to payment gateway"}, 
                status=http_status.HTTP_503_SERVICE_UNAVAILABLE
            )

@method_decorator(csrf_exempt, name='dispatch')
class PayMongoWebhookView(APIView):
    """
    Receives signals from PayMongo backend.
    Handles 'source.chargeable' to capture the payment.
    """
    def post(self, request):
        try:
            payload = json.loads(request.body)
            event_type = payload['data']['attributes']['type']
            
            if event_type == 'source.chargeable':
                return self.handle_source_chargeable(payload['data'])
            
            # Acknowledge other events so PayMongo doesn't retry them
            return HttpResponse(status=200)
            
        except Exception as e:
            logger.error(f"Webhook Error: {str(e)}")
            return HttpResponse(status=500)

    def handle_source_chargeable(self, data):
        source_id = data['attributes']['data']['id']
        amount = data['attributes']['data']['attributes']['amount']
        
        # 1. Find the Order associated with this Source
        try:
            order = Order.objects.get(payment_source_id=source_id)
        except Order.DoesNotExist:
            logger.error(f"Order not found for source {source_id}")
            return HttpResponse(status=404) # Order not found

        pm = PayMongoWrapper()
        
        with transaction.atomic():
            # 2. Check if already marked as paid
            if order.payment.filter(status='success').exists(): # type: ignore
                 return HttpResponse(status=200)

            # 3. Capture Payment
            try:
                payment_resp = pm.create_payment(source_id, amount, f"Order #{order.id}") # type: ignore
                payment_id = payment_resp['id']
                
                # 4. Create Payment Record
                Payment.objects.create(
                    payer=order.customer,
                    orders=order,
                    amount=amount / 100, # Convert back to PHP
                    gateway_transaction_id=payment_id,
                    status='success' # Mark as success
                )
                
                # 5. Update Order Status (Optional)
                order.status = 'accepted'
                order.save()
                
            except Exception as e:
                logger.error(f"Capture failed: {e}")
                return HttpResponse(status=500)

        return HttpResponse(status=200)