from django.shortcuts import render

# Create your views here.
from rest_framework import permissions, viewsets, generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView


from .serializers import (DiscountSerializer, 
                          SizeSerializer, 
                          CategorySerializer, 
                          ProductSizeSerializer, 
                          ProductSerializer, 
                          TransactionCreateSerializer, 
                          TransactionSerializer, 
                          TransactionItemSerializer)
from .models import (Discount, 
                     Size, 
                     Category, 
                     ProductSize, 
                     Product, 
                     Transaction, 
                     TransactionItem) 
from django.db.models import Count, Q, Case, When, Value, IntegerField


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    

class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    
        
class ProductSizeViewSet(viewsets.ModelViewSet):
    queryset = ProductSize.objects.all()
    serializer_class = ProductSizeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    
        
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['category', 'is_archived']
    
    search_fields = ['name']
    
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
        
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.prefetch_related(
        'transaction_items__product',
        'transaction_items__product_size__size'
    ).all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['cashier', 'is_void']
    search_fields = ['cashier__username', 'payment_method']
    ordering_fields = ['id', 'created_at', 'payment_method']
    ordering = ['-created_at']

    
    def get_serializer(self, *args, **kwargs):
        for self.action in ['create', 'update']:
            return TransactionCreateSerializer
        return TransactionSerializer
    
        
class TransactionItemViewSet(viewsets.ModelViewSet):
    queryset = TransactionItem.objects.all()
    serializer_class = TransactionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    
    
    
    

    
    
