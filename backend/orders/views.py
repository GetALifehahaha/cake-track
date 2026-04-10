from django.shortcuts import render
from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.utils import timezone

from rest_framework import permissions, viewsets, filters, status, generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .serializers import (
    CakeOrderSerializer,
    CupcakeOrderSerializer,
    OrderSerializer,
    OrderBatchUpdateSerializer,
    DashboardSerializer,
    CakeSerializer,
    CakeBatchUnarchiveSerializer,
    BlockedDateSerializer,
    OpeningTimeSerializer
)

from .models import (
    CakeOrder,
    CupcakeOrder,
    Order,
    Cake,
    BlockedDate,
    OpeningTime
)

from users.permissions import IsCashier, IsCustomerOrAdmin
from .filters import OrderFilter

class OrderPageSize(PageNumberPagination):
    page_size = 8
    max_page_size = 100

def _get_remaining_payment_amount(order):
    from payment.models import Payment

    total_price = Decimal(order.total_price or 0)
    if total_price <= 0:
        return Decimal('0.00')

    paid_downpayment = Payment.objects.filter(
        orders=order,
        payment_type='downpayment',
        status='success',
    ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

    remaining_amount = total_price - Decimal(paid_downpayment)
    if remaining_amount < 0:
        return Decimal('0.00')

    return remaining_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _normalize_reference_number(value):
    digits = ''.join(ch for ch in str(value or '') if ch.isdigit())
    if len(digits) < 13 or len(digits) > 15:
        raise ValidationError({"reference_number": "Reference number must be 13 to 15 digits."})
    return digits

class CakeOrderViewSet(viewsets.ModelViewSet):
    queryset = CakeOrder.objects.all()
    serializer_class = CakeOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return CakeOrder.objects.all().order_by('-created_at')
        
        return CakeOrder.objects.filter(order__customer=user)
    
    
class CupcakeOrderViewSet(viewsets.ModelViewSet):
    queryset = CupcakeOrder.objects.all()
    serializer_class = CupcakeOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return CupcakeOrder.objects.all().order_by('-created_at')
        
        return CupcakeOrder.objects.filter(order__customer=user)
        
        
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrAdmin]
    pagination_class = OrderPageSize
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = OrderFilter
    
    search_fields = ['customer__first_name', 'customer__last_name', '=id']
    ordering_fields = ['created_at', 'updated_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all()

        status_filter = (self.request.query_params.get('status') or '').lower()

        if not user.is_staff:
            queryset = queryset.filter(customer=user, hidden_by_customer=False)
            if status_filter in ['completed', 'rejected', 'refunded', 'cancelled']:
                return queryset.order_by('-updated_at', '-created_at')
            return queryset.order_by('-created_at')

        # Admin logic
        if not status_filter:
            # Overview page: only show active statuses, omitting finished and unpaid
            queryset = queryset.exclude(status__in=['unpaid', 'completed', 'rejected', 'refunded', 'cancelled'])
            return queryset.order_by('created_at')

        if status_filter in ['completed', 'rejected', 'refunded', 'cancelled']:
            return queryset.order_by('-updated_at', '-created_at')
            
        return queryset.order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=False, methods=['get'], url_path='hidden')
    def hidden(self, request):
        if request.user.is_staff:
            return Response({"error": "Hidden orders are only available for customers."}, status=status.HTTP_403_FORBIDDEN)

        queryset = Order.objects.filter(customer=request.user, hidden_by_customer=True).order_by('-hidden_by_customer_at', '-updated_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = self.request.data.get("status", old_status) #type: ignore

        if new_status == "ready" and instance.ingredients_deducted_at is None:
            raise ValidationError({"status": "Ingredients must be deducted before marking this order as ready for pickup."})

        # If completing a custom order, allow setting total_price from the request
        if new_status == "completed" and self.request.data.get("total_price") is not None:
            instance.total_price = Decimal(str(self.request.data["total_price"]))
            instance.save(update_fields=["total_price"])
                
        updated_order = serializer.save()

        if old_status != "completed" and new_status == "completed":
            from payment.models import Payment

            existing_full = Payment.objects.filter(orders=updated_order, payment_type='full_payment', status='success').exists()
            if not existing_full:
                full_payment_amount = _get_remaining_payment_amount(updated_order)

                # Use amount_received from request if provided
                amount_received = self.request.data.get("amount_received")

                Payment.objects.create(
                    payer=updated_order.customer,
                    orders=updated_order,
                    amount=full_payment_amount,
                    status='success',
                    payment_type='full_payment',
                )
        
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()

        # Only the customer who owns the order (or staff) can cancel
        if not request.user.is_staff and order.customer != request.user:
            return Response({"error": "You do not have permission to cancel this order."}, status=status.HTTP_403_FORBIDDEN)

        if order.status != 'unpaid':
            return Response({"error": "Only unpaid orders can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'cancelled'
        order.cancellation_requested = False
        order.cancellation_requested_at = None
        order.refund_reference_number = None
        order.save(update_fields=['status', 'cancellation_requested', 'cancellation_requested_at', 'refund_reference_number'])
        return Response({"message": "Order cancelled successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='request-cancellation')
    def request_cancellation(self, request, pk=None):
        order = self.get_object()

        if not request.user.is_staff and order.customer != request.user:
            return Response({"error": "You do not have permission to request cancellation for this order."}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in ['pending', 'accepted']:
            return Response({"error": "Cancellation request is only available for pending or accepted orders."}, status=status.HTTP_400_BAD_REQUEST)

        has_successful_payment = order.payment.filter(status='success').exists()  # type: ignore
        if not order.reference_number and not has_successful_payment:
            return Response({"error": "No confirmed payment found for this order."}, status=status.HTTP_400_BAD_REQUEST)

        if order.cancellation_requested:
            return Response({"message": "Cancellation request is already submitted."}, status=status.HTTP_200_OK)

        order.cancellation_requested = True
        order.cancellation_requested_at = timezone.now()
        order.save(update_fields=['cancellation_requested', 'cancellation_requested_at'])
        return Response({"message": "Cancellation request submitted successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='refund')
    def refund(self, request, pk=None):
        order = self.get_object()

        if not request.user.is_staff:
            return Response({"error": "Only admins can process refunds."}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in ['pending', 'accepted', 'ready']:
            return Response({"error": "Only pending, accepted, or ready orders can be refunded."}, status=status.HTTP_400_BAD_REQUEST)

        if not order.cancellation_requested:
            return Response({"error": "This order has no cancellation request."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refund_reference_number = _normalize_reference_number(request.data.get('refund_reference_number'))
        except ValidationError:
            return Response({"error": "Refund reference number must be 13 to 15 digits."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'refunded'
        order.cancellation_requested = False
        order.cancellation_requested_at = None
        order.refund_reference_number = refund_reference_number
        order.save(update_fields=['status', 'cancellation_requested', 'cancellation_requested_at', 'refund_reference_number'])

        return Response(
            {
                "message": "Order refunded successfully.",
                "refund_reference_number": refund_reference_number,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='hide')
    def hide(self, request, pk=None):
        order = self.get_object()

        if order.customer != request.user:
            return Response({"error": "You do not have permission to hide this order."}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in ['completed', 'refunded', 'rejected', 'cancelled']:
            return Response({"error": "Only completed, refunded, rejected, or cancelled orders can be hidden."}, status=status.HTTP_400_BAD_REQUEST)

        if order.hidden_by_customer:
            return Response({"message": "Order is already hidden."}, status=status.HTTP_200_OK)

        order.hidden_by_customer = True
        order.hidden_by_customer_at = timezone.now()
        order.save(update_fields=['hidden_by_customer', 'hidden_by_customer_at'])

        return Response({"message": "Order hidden successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='customer-update-details')
    def customer_update_details(self, request, pk=None):
        order = self.get_object()

        if request.user.is_staff or order.customer != request.user:
            return Response({"error": "Only the customer can update this order."}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in ['unpaid', 'pending', 'accepted']:
            return Response({"error": "Order details can only be updated while order is unpaid, pending, or accepted."}, status=status.HTTP_400_BAD_REQUEST)

        occasion = ((order.cake_orders.occasion if order.cake_orders else '') or '').strip().lower()
        if occasion == 'pre-made':
            return Response({"error": "Pre-made orders cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)

        allowed_fields = {'comments', 'uploaded_images'}
        incoming_keys = set(request.data.keys())
        if not incoming_keys.issubset(allowed_fields):
            return Response({"error": "Only comments and uploaded_images can be updated."}, status=status.HTTP_400_BAD_REQUEST)

        payload = {}
        if 'comments' in request.data:
            payload['comments'] = request.data.get('comments', '')
        if 'uploaded_images' in request.data:
            payload['uploaded_images'] = request.data.get('uploaded_images', [])

        if not payload:
            return Response({"error": "No editable fields provided."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(order, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='batch-update')
    def batch_update(self, request):
        updated_count = 0
        errors = []
        
        serializer = OrderBatchUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ids = serializer.validated_data['order_ids'] #type: ignore
        new_status = serializer.validated_data['status'] #type: ignore
        reason = serializer.validated_data.get('reject_reason', '') #type: ignore
        
        orders_to_update = self.get_queryset().filter(id__in=ids)
        
        for order in orders_to_update:
            
            if order.status != "pending":
                errors.append(f"Order {order.id} is not pending.") #type: ignore
                continue

            if new_status == "ready" and order.ingredients_deducted_at is None:
                errors.append(f"Order {order.id} cannot be marked ready until ingredients are deducted.")
                continue

            order.status = new_status
            if new_status == "rejected":
                order.reject_reason = reason
            else:
                order.reject_reason = ''
            
            order.save()

            if new_status == "completed":
                from payment.models import Payment

                existing_full = Payment.objects.filter(orders=order, payment_type='full_payment', status='success').exists()
                if not existing_full:
                    full_payment_amount = _get_remaining_payment_amount(order)

                    Payment.objects.create(
                        payer=order.customer,
                        orders=order,
                        amount=full_payment_amount,
                        status='success',
                        payment_type='full_payment',
                    )

            updated_count += 1
        
        return Response({
            "message": f"Succesfully updated {updated_count} orders.", "errors": errors
        }, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='deduct-ingredients')
    def deduct_ingredients(self, request, pk=None):
        order = self.get_object()

        if order.status in ['pending', 'rejected', 'cancelled', 'unpaid']:
            return Response(
                {"detail": "Ingredients can only be deducted for accepted/ready/completed orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not order.recipe:
            return Response(
                {"detail": "No recipe attached to this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.ingredients_deducted_at is not None:
            return Response(
                {"detail": "Ingredients already deducted for this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order.recipe.cook(reason=f"Stock out done for order #{order.id}.")
        except ValidationError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)

        order.ingredients_deducted_at = timezone.now()
        order.save(update_fields=['ingredients_deducted_at'])

        return Response({"message": "Ingredients deducted successfully."}, status=status.HTTP_200_OK)

from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class DashboardView(APIView):
    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        orders = Order.objects.all()

        if start_date_str:
            parsed_start = parse_date(start_date_str)
            if not parsed_start:
                return Response({"detail": "Invalid start_date format. Use YYYY-MM-DD."}, status=400)
            
            start_date = make_aware(datetime.combine(parsed_start, datetime.min.time()))
            orders = orders.filter(created_at__gte=start_date)

        if end_date_str:
            parsed_end = parse_date(end_date_str)
            if not parsed_end:
                return Response({"detail": "Invalid end_date format. Use YYYY-MM-DD."}, status=400)
            
            end_date = make_aware(datetime.combine(parsed_end, datetime.max.time()))
            orders = orders.filter(created_at__lte=end_date)

        if start_date_str and end_date_str and parsed_start > parsed_end:
            return Response({"detail": "start_date cannot be after end_date."}, status=400)

        completed_orders = orders.filter(status="completed")
        total_revenue_generated = completed_orders.aggregate(
            total=models.Sum('total_price')
        )['total'] or Decimal('0.00')

        data = {
            "total_orders": orders.count(),
            "pending_orders": orders.filter(status="pending").count(),
            "completed_orders": completed_orders.count(),
            "rejected_orders": orders.filter(status="rejected").count(),
            "total_revenue_generated": round(float(total_revenue_generated), 2),
        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CakeViewSet(viewsets.ModelViewSet):
    queryset = Cake.objects.all()
    serializer_class = CakeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['is_archived']
    
    search_fields = ['name']
    
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user
        queryset = Cake.objects.all()

        if self.action == "list":
            is_archived_param = self.request.query_params.get('is_archived') # type: ignore
            
            if is_archived_param is not None and is_archived_param.lower() == "true":
                return queryset.filter(is_archived=True)
                
            return queryset.filter(is_archived=False)
        
        return queryset

    @action(detail=False, methods=["post"])
    def unarchive(self, request):

        serializer = CakeBatchUnarchiveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_count = serializer.save()

        return Response(
            {"updated": updated_count},
            status=status.HTTP_200_OK
        )


class BlockedDateView(APIView):
    def get(self, request):
        blocked_dates = BlockedDate.objects.all()
        serializer = BlockedDateSerializer(blocked_dates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BlockedDateSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        dates_to_delete = request.data

        if not isinstance(dates_to_delete, list):
            return Response({"error": "Expected a list of IDs."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate all values are integers
        try:
            ids = [int(i) for i in dates_to_delete]
        except (TypeError, ValueError):
            return Response({"error": "All values must be integer IDs."}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = BlockedDate.objects.filter(id__in=ids).delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)


class OpeningTimeView(APIView):
    permission_classes = [permissions.AllowAny]

    _defaults = {
        'start_time': '08:00',
        'end_time': '17:00',
        'open_days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    }

    def _get_instance(self):
        instance, _ = OpeningTime.objects.get_or_create(pk=1, defaults=self._defaults)
        return instance

    def get(self, request):
        serializer = OpeningTimeSerializer(self._get_instance())
        return Response(serializer.data)

    def patch(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "You do not have permission to edit opening time."}, status=status.HTTP_403_FORBIDDEN)

        instance = self._get_instance()
        serializer = OpeningTimeSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)