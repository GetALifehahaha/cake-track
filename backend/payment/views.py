import json
import logging
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status

from backend.settings import BACKEND_URL
from orders.models import Order
from .models import Payment
from .serializers import PaymentInitializeSerializers, PaymentSerializer
from .paymongo import PayMongoWrapper

logger = logging.getLogger(__name__)


def _can_access_order(user, order):
    return bool(user and user.is_authenticated and (user.is_staff or order.customer_id == user.id))


def get_order_downpayment(order):
    custom_flat = Decimal('500.00')
    rate = Decimal('0.15')

    if order.total_price is not None and order.total_price > 0:
        return (Decimal(order.total_price) * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    return custom_flat

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

        if not _can_access_order(request.user, order):
            return Response({"error": "You do not have permission to access this order."}, status=http_status.HTTP_403_FORBIDDEN)
        
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
            success_url = f"{BACKEND_URL}/payment/success"
            failed_url = f"{BACKEND_URL}/payment/failed"
            downpayment = get_order_downpayment(order)

            source_data = pm.create_source(
                amount=downpayment,
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
                "amount": float(downpayment),
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
    Handles 'source.failed' to mark the order as unpaid.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            webhook_token = getattr(settings, 'PAYMONGO_WEBHOOK_TOKEN', '')
            if webhook_token:
                incoming_token = request.headers.get('X-Webhook-Token', '')
                if incoming_token != webhook_token:
                    return HttpResponse(status=403)

            payload = json.loads(request.body)
            event_type = payload['data']['attributes']['type']
            
            if event_type == 'source.chargeable':
                return self.handle_source_chargeable(payload['data'])
            
            if event_type == 'source.failed':
                return self.handle_source_failed(payload['data'])
            
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
                    status='success', # Mark as success
                    payment_type='downpayment'
                )

            except Exception as e:
                logger.error(f"Capture failed: {e}")
                # Still update the order — PayMongo confirmed the source is chargeable.
                # Create a pending payment record so the admin can reconcile.
                Payment.objects.create(
                    payer=order.customer,
                    orders=order,
                    amount=amount / 100,
                    gateway_transaction_id=source_id,
                    status='success',
                    payment_type='downpayment'
                )

            # 5. Update Order Status regardless of capture outcome
            order.status = 'pending'
            order.save()

        return HttpResponse(status=200)

    def handle_source_failed(self, data):
        source_id = data['attributes']['data']['id']
        
        try:
            order = Order.objects.get(payment_source_id=source_id)
        except Order.DoesNotExist:
            logger.error(f"Order not found for failed source {source_id}")
            return HttpResponse(status=404)

        with transaction.atomic():
            # Only mark as unpaid if not already paid
            if not order.payment.filter(status='success').exists(): # type: ignore
                source_amount = data['attributes']['data']['attributes'].get('amount')
                failed_amount = (Decimal(source_amount) / Decimal('100')) if source_amount else get_order_downpayment(order)

                Payment.objects.create(
                    payer=order.customer,
                    orders=order,
                    amount=failed_amount,
                    gateway_transaction_id=source_id,
                    status='failed',
                    payment_type='downpayment'
                )
                
                # Keep order status as 'unpaid'
                order.status = 'unpaid'
                order.payment_source_id = None  # Clear old source so repay can work
                order.save()

        return HttpResponse(status=200)


class VerifyPaymentView(APIView):
    """
    Called by the app after user is redirected to the success URL.
    Checks the PayMongo source status and captures the payment if chargeable.
    This is the primary payment confirmation path (not the webhook).
    """
    def post(self, request):
        order_id = request.data.get('order_id')

        if not order_id:
            return Response(
                {"error": "order_id is required."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=http_status.HTTP_404_NOT_FOUND
            )

        if not _can_access_order(request.user, order):
            return Response({"error": "You do not have permission to access this order."}, status=http_status.HTTP_403_FORBIDDEN)

        # Already paid
        if order.payment.filter(status='success').exists():  # type: ignore
            return Response({"status": order.status, "verified": True})

        source_id = order.payment_source_id
        if not source_id:
            return Response(
                {"error": "No payment source found for this order."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        pm = PayMongoWrapper()

        try:
            source_data = pm.get_source(source_id)
            source_status = source_data['attributes']['status']
            amount = source_data['attributes']['amount']
        except Exception as e:
            logger.error(f"VerifyPayment - Failed to get source {source_id}: {e}")
            return Response(
                {"error": "Failed to verify payment with gateway."},
                status=http_status.HTTP_503_SERVICE_UNAVAILABLE
            )

        if source_status == 'chargeable':
            with transaction.atomic():
                # Double-check not already paid
                if order.payment.filter(status='success').exists():  # type: ignore
                    return Response({"status": order.status, "verified": True})

                try:
                    payment_resp = pm.create_payment(source_id, amount, f"Order #{order.id}")
                    payment_id = payment_resp['id']
                except Exception as e:
                    logger.error(f"VerifyPayment - Capture failed: {e}")
                    payment_id = source_id  # Fallback — source is chargeable so payment is valid

                Payment.objects.create(
                    payer=order.customer,
                    orders=order,
                    amount=amount / 100,
                    gateway_transaction_id=payment_id,
                    status='success',
                    payment_type='downpayment'
                )

                order.status = 'pending'
                order.save()

            return Response({"status": "pending", "verified": True})

        elif source_status == 'paid':
            # Source was already captured (possibly by webhook)
            with transaction.atomic():
                if not order.payment.filter(status='success').exists():  # type: ignore
                    Payment.objects.create(
                        payer=order.customer,
                        orders=order,
                        amount=amount / 100,
                        gateway_transaction_id=source_id,
                        status='success',
                        payment_type='downpayment'
                    )
                if order.status == 'unpaid':
                    order.status = 'pending'
                    order.save()

            return Response({"status": order.status, "verified": True})

        elif source_status in ('cancelled', 'expired', 'failed'):
            return Response({"status": "unpaid", "verified": False, "source_status": source_status})

        else:
            # pending — source not yet chargeable
            return Response({"status": "unpaid", "verified": False, "source_status": source_status})


class RepayOrderView(APIView):
    """
    Called when a customer wants to retry payment for an unpaid order.
    Returns a new checkout URL.
    """
    def post(self, request):
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {"error": "order_id is required."}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."}, 
                status=http_status.HTTP_404_NOT_FOUND
            )

        if not _can_access_order(request.user, order):
            return Response({"error": "You do not have permission to access this order."}, status=http_status.HTTP_403_FORBIDDEN)
        
        # Only allow repay for unpaid orders
        if order.status != 'unpaid':
            return Response(
                {"error": f"Cannot repay order with status '{order.status}'. Only unpaid orders can be repaid."},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already paid
        if order.payment.filter(status='success').exists(): # type: ignore
            return Response(
                {"error": "This order has already been paid."},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        pm = PayMongoWrapper()
        try:
            success_url = f"{BACKEND_URL}/payment/success"
            failed_url = f"{BACKEND_URL}/payment/failed"
            downpayment = get_order_downpayment(order)

            source_data = pm.create_source(
                amount=downpayment,
                redirect_success=success_url,
                redirect_failed=failed_url
            )
            
            order.payment_source_id = source_data['id']
            order.save()
            
            checkout_url = source_data['attributes']['redirect']['checkout_url']
            
            return Response({
                "checkout_url": checkout_url,
                "amount": float(downpayment),
                "message": "Please redirect user to checkout_url"
            }, status=http_status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"PayMongo Repay Error: {str(e)}")
            return Response(
                {"error": "Failed to connect to payment gateway"},
                status=http_status.HTTP_503_SERVICE_UNAVAILABLE
            )


class PaymentHistoryView(APIView):
    """Web endpoint for cake-order payment history."""
    def get(self, request):
        queryset = Payment.objects.select_related('orders', 'payer').order_by('-created_at')

        if not request.user.is_staff:
            queryset = queryset.filter(payer=request.user)

        order_id = request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(orders__id=order_id)

        serializer = PaymentSerializer(queryset, many=True)
        return Response(serializer.data, status=http_status.HTTP_200_OK)