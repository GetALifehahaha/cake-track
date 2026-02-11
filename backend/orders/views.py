from django.shortcuts import render

# Create your views here.
from rest_framework import permissions, viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import (
    CakeOrderSerializer,
    CupcakeOrderSerializer,
    OrderSerializer,
    OrderBatchUpdateSerializer,
    DashboardSerializer
)

from .models import (
    CakeOrder,
    CupcakeOrder,
    Order,
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
    
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = OrderFilter
    
    search_fields = ['id', 'customer__username']
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

class DashboardView(APIView):
    def get(self, request):
        # Base queryset
        orders = Order.objects.all()

        data = {
            "total_orders": orders.count(),
            "pending_orders": orders.filter(status="pending").count(),
            "completed_orders": orders.filter(status="completed").count(),
            "rejected_orders": orders.filter(status="rejected").count(),
        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cake
from .serializers import CakeSerializer


class CakeViewSet(viewsets.ModelViewSet):
    queryset = Cake.objects.all()
    serializer_class = CakeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrAdmin]

    # filter_backends = [
    #     DjangoFilterBackend,
    #     filters.SearchFilter,
    #     filters.OrderingFilter,
    # ]

    # search_fields = ["name"]
    # ordering_fields = ["name", "price", "created_at"]
    # ordering = ["name"]

