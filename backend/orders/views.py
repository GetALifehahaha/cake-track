from django.shortcuts import render

# Create your views here.
from rest_framework import permissions, viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.filters import OrderingFilter

from .serializers import (
    CakeOrderSerializer,
    CupcakeOrderSerializer,
    OrderSerializer,
)

from .models import (
    CakeOrder,
    CupcakeOrder,
    Order,
)

from users.permissions import IsCashier, IsCustomerOrAdmin

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
    
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields =  ['status']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all()

        if not user.is_staff:
            queryset = queryset.filter(customer=user)
            
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
            
