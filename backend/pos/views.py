from django.shortcuts import render
from django.utils import timezone
import pytz

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
                          CategorySerializer, 
                          ProductVariantSerializer, 
                          ProductSerializer, 
                          TransactionCreateSerializer, 
                          TransactionSerializer, 
                          TransactionItemSerializer,
                          BusinessSettingsSerializer
                          )
from .models import (Discount, 
                     Category, 
                     ProductVariant, 
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
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    
        
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
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
    ).all()
    
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MediumPageSize
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TransactionFilter
    
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
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # 1. Get the queryset (Today + Current Cashier)
        queryset = self.get_queryset()
        
        # 2. FIX: Calculate sum in Python loop
        # Check 'is_void' to ensure we don't count voided transactions
        daily_revenue = sum(
            t.net_total for t in queryset 
            if not t.is_void
        )
        
        # 3. Inject into response
        if isinstance(response.data, dict):
            response.data['daily_total_revenue'] = daily_revenue
            
        return response
    
    def get_queryset(self):
        queryset = Transaction.objects.prefetch_related(
            'transaction_items__product',
        ).all()
        
        user = self.request.user
        
        if user.groups.filter(name="cashier").exists():
            manila_tz = pytz.timezone('Asia/Manila')
            now_in_manila = timezone.now().astimezone(manila_tz)
            
            # 2. Calculate today's query range
            queryset = queryset.filter(
                created_at__date=now_in_manila.date(), 
                cashier=user
            )
            
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

        # 6. Total Revenue Generated
        total_revenue_generated = sum(t.net_total for t in valid_transactions)

        # 7. Top 8 Selling Products
        top_products = (
            TransactionItem.objects
            .filter(transaction__is_void=False)
            .values('product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:8]
        )

        # 8. Chart Data: Selling Trend Each Day
        trend_data = (
            TransactionItem.objects
            .filter(transaction__is_void=False)
            .annotate(date=TruncDate('transaction__created_at'))
            .values('date')
            .annotate(daily_count=Sum('quantity'))
            .order_by('date')
        )
        
        formatted_trend = [
            {"date": item['date'].strftime('%Y-%m-%d'), "amount": item['daily_count']}
            for item in trend_data
        ]

        # 9. Cashier Performance
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        cashier_stats = {}
        for t in valid_transactions:
            if not t.cashier:
                continue

            c_id = t.cashier.id
            if c_id not in cashier_stats:
                cashier_stats[c_id] = {
                    "id": c_id,
                    "name": t.cashier.get_full_name() or t.cashier.username,
                    "daily_revenue": 0,
                    "weekly_revenue": 0,
                    "monthly_revenue": 0,
                    "total_revenue": 0,
                }

            amount = t.net_total
            cashier_stats[c_id]["total_revenue"] += amount
            if t.created_at >= today_start:
                cashier_stats[c_id]["daily_revenue"] += amount
            if t.created_at >= week_start:
                cashier_stats[c_id]["weekly_revenue"] += amount
            if t.created_at >= month_start:
                cashier_stats[c_id]["monthly_revenue"] += amount

        cashier_performance_list = list(cashier_stats.values())

        # 10. Prepare Data
        data = {
            "total_void_amount": void_total,
            "total_successful_transactions": successful_count,
            "total_products_sold": total_products_sold,
            "avg_daily_transactions": round(avg_daily, 2),
            "total_revenue_generated": round(total_revenue_generated, 2),  # <-- Added here
            "top_selling_products": list(top_products),
            "sales_trend": formatted_trend,
            "cashier_performance": cashier_performance_list,
        }

        serializer = DashboardMetricsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)