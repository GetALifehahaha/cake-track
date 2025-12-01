from django.shortcuts import render
from django.utils import timezone

# Create your views here.
from django.db.models import Sum, Count, F, DateTimeField
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

# Import your models and serializer
from .models import Transaction, TransactionItem
from .serializers import DashboardMetricsSerializer
from rest_framework.views import APIView
from rest_framework import permissions, viewsets, generics, filters
from django_filters.rest_framework import DjangoFilterBackend #type: ignore
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from .filters import TransactionFilter

from .serializers import (DiscountSerializer, 
                          SizeSerializer, 
                          CategorySerializer, 
                          ProductSizeSerializer, 
                          ProductSerializer, 
                          TransactionCreateSerializer, 
                          TransactionSerializer, 
                          TransactionItemSerializer,
                          BusinessSettingsSerializer
                          )
from .models import (Discount, 
                     Size, 
                     Category, 
                     ProductSize, 
                     Product, 
                     Transaction, 
                     TransactionItem,
                     BusinessSettings
                     ) 

from users.permissions import IsAdmin, IsCashier

class MediumPageSize(PageNumberPagination):
    page_size = 14
    max_page_size = 100
    

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
    pagination_class = MediumPageSize
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['category__name', 'is_archived']
    
    search_fields = ['name']
    
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        if self.action == "list":
            is_archived_param = self.request.query_params.get('is_archived'); #type: ignore
            
            if (is_archived_param is not None and is_archived_param.lower() == "true"):
                return queryset.filter(is_archived=True)
                
            return queryset.filter(is_archived=False)

        return queryset
    

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.prefetch_related(
        'transaction_items__product',
        'transaction_items__product_size__size'
    ).all()
    
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MediumPageSize
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filter_class = TransactionFilter
    
    search_fields = ['cashier__username', 'payment_method']
    ordering_fields = ['id', 'created_at', 'payment_method']
    ordering = ['-created_at']

    
    def get_serializer_class(self, *args, **kwargs):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateSerializer
        return TransactionSerializer
    
    def create(self, request, *args, **kwargs):
        # 1. Use TransactionCreateSerializer to validate input
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        
        # 2. Save the object (this calls create() in your CreateSerializer)
        transaction_instance = write_serializer.save()

        # 3. CRITICAL: Switch to TransactionSerializer for the response
        # This grabs the instance we just made and serializes it with the "Read" format
        read_serializer = TransactionSerializer(transaction_instance)
        
        headers = self.get_success_headers(read_serializer.data)
        
        # 4. Return the full data (nested items, totals, etc.)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        queryset = Transaction.objects.prefetch_related(
            'transaction_items__product',
            'transaction_items__product_size__size'
        ).all()
        
        user = self.request.user
        
        if user.groups.filter(name="cashier").exists():
            queryset = queryset.filter(created_at__date=timezone.now().date())
            
        return queryset
    
        
class TransactionItemViewSet(viewsets.ModelViewSet):
    queryset = TransactionItem.objects.all()
    serializer_class = TransactionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    
class BusinessSettingsView(APIView):
    permission_classes = [IsAdmin] 
    def get(self, request):
        """Get current business settings"""
        settings = BusinessSettings.load()
        serializer = BusinessSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        """Update business settings"""
        settings = BusinessSettings.load()
        serializer = BusinessSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardAnalyticsView(APIView):
    def get(self, request):
        # 1. Base Querysets
        all_transactions = Transaction.objects.all()
        valid_transactions = all_transactions.filter(is_void=False).prefetch_related('transaction_items', 'discount')
        void_transactions = all_transactions.filter(is_void=True).prefetch_related('transaction_items', 'discount')

        # 2. Total Amount of Voided Transactions
        void_total = void_transactions.count()

        # 3. Total Successful Transactions (Count)
        successful_count = valid_transactions.count()

        # 4. Total Products Sold (Quantity)
        products_sold_data = TransactionItem.objects.filter(
            transaction__is_void=False
        ).aggregate(total_qty=Sum('quantity'))
        total_products_sold = products_sold_data['total_qty'] or 0

        # 5. Average Daily Transactions
        first_transaction = all_transactions.order_by('created_at').first()
        if first_transaction:
            days_active = (timezone.now() - first_transaction.created_at).days
            days_active = days_active if days_active > 0 else 1
            avg_daily = successful_count / days_active
        else:
            avg_daily = 0

        # 6. Top 8 Selling Products
        top_products = (
            TransactionItem.objects
            .filter(transaction__is_void=False)
            .values('product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:8]
        )

        # 7. Chart Data: Selling Trend Each Day (Based on COUNT/QUANTITY)
        trend_data = (
            TransactionItem.objects
            .filter(transaction__is_void=False)
            .annotate(date=TruncDate('transaction__created_at'))
            .values('date')
            .annotate(daily_count=Sum('quantity')) # <--- Corrected to Sum of Quantity
            .order_by('date')
        )
        
        formatted_trend = [
            {
                "date": item['date'].strftime('%Y-%m-%d'), 
                "amount": item['daily_count'] 
            } 
            for item in trend_data
        ]

        # 8. Prepare Data
        data = {
            "total_void_amount": void_total,
            "total_successful_transactions": successful_count,
            "total_products_sold": total_products_sold,
            "avg_daily_transactions": round(avg_daily, 2),
            "top_selling_products": list(top_products),
            "sales_trend": formatted_trend
        }

        serializer = DashboardMetricsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)