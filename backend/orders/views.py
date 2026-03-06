from django.shortcuts import render

from rest_framework import permissions, viewsets, filters, status, generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

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
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = OrderFilter
    
    search_fields = ['customer__username', '=id']
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all()

        if not user.is_staff:
            queryset = queryset.filter(customer=user)
            
        return queryset.order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
        
    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = self.request.data.get("status", old_status) #type: ignore
        
        if old_status == "pending" and new_status == "accepted":
            if instance.recipe:
                instance.recipe.cook()
                
        serializer.save()
        
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
            
            if new_status == "accepted":
                if order.recipe:
                    try:
                        order.recipe.cook()
                    except ValidationError as e:
                        errors.append(f"Order {order.id}: {str(e)}") #type: ignore
                        continue
                    

            order.status = new_status
            if new_status == "rejected":
                order.reject_reason = reason
            else:
                order.reject_reason = ''
            
            order.save()
            updated_count += 1
        
        return Response({
            "message": f"Succesfully updated {updated_count} orders.", "errors": errors
        }, status=status.HTTP_200_OK
        )

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

        data = {
            "total_orders": orders.count(),
            "pending_orders": orders.filter(status="pending").count(),
            "completed_orders": orders.filter(status="completed").count(),
            "rejected_orders": orders.filter(status="rejected").count(),
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
        print(dates_to_delete)

        if not isinstance(dates_to_delete, list):
            return Response({"error": "Expected a list of dates."}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = BlockedDate.objects.filter(date__in=dates_to_delete).delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_204_NO_CONTENT)
    

class OpeningTimeViewSet(viewsets.ModelViewSet):
    queryset = OpeningTime.objects.all()
    serializer_class = OpeningTimeSerializer
    permission_classes = [permissions.AllowAny]