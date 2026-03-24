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
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend #type: ignore
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from .filters import TransactionFilter

from .serializers import (DiscountSerializer, 
                          DiscountUsageSerializer,
                          CategorySerializer, 
                          ProductVariantSerializer, 
                          ProductSerializer, 
                          TransactionCreateSerializer, 
                          TransactionCompleteSerializer,
                          RegisterMoneySerializer,
                          RegisterMoneySetStartingSerializer,
                          RegisterDeductionSerializer,
                          RegisterDeductionCreateSerializer,
                          RegisterTransactionSerializer,
                          TransactionSerializer, 
                          TransactionItemSerializer,
                          BusinessSettingsSerializer,
                          ProductBatchUnarchiveSerializer,
                          ProductAllSerializer
                          )
from .models import (Discount, 
                     DiscountUsage,
                     Category, 
                     ProductVariant, 
                     Product, 
                     RegisterMoney,
                     RegisterDeduction,
                     RegisterTransaction,
                     Transaction, 
                     TransactionItem,
                     BusinessSettings
                     ) 

from users.permissions import IsAdmin, IsCashier

class MediumPageSize(PageNumberPagination):
    page_size = 20
    max_page_size = 100
    

class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    search_fields = ['name']


class DiscountUsageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiscountUsage.objects.select_related('discount', 'transaction')
    serializer_class = DiscountUsageSerializer
    pagination_class = None

    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        queryset = Category.objects.all()
        include_disabled = self.request.query_params.get('include_disabled') #type: ignore

        if self.action != 'list':
            return queryset

        if include_disabled and str(include_disabled).lower() == 'true':
            return queryset

        return queryset.filter(is_disabled=False)

    def perform_update(self, serializer):
        old_category = self.get_object()
        old_disabled = old_category.is_disabled

        category = serializer.save()

        if old_disabled != category.is_disabled:
            category.products.update(is_archived=category.is_disabled)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        category.is_disabled = True
        category.save(update_fields=['is_disabled'])
        category.products.update(is_archived=True)

        return Response(status=status.HTTP_200_OK)
    
        
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    
        
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.prefetch_related('variants__recipe', 'categories').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = MediumPageSize
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['categories__name', 'is_archived']
    
    search_fields = ['name']
    
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = Product.objects.prefetch_related('variants__recipe', 'categories').all()
        
        if self.action == "list":
            is_archived_param = self.request.query_params.get('is_archived'); #type: ignore
            
            if (is_archived_param is not None and is_archived_param.lower() == "true"):
                return queryset.filter(is_archived=True)
                
            return queryset.filter(is_archived=False)

        return queryset
    
    @action(detail=False, methods=["post"])
    def unarchive(self, request):
        serializer = ProductBatchUnarchiveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        return Response (
            {"updated": updated},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def get_all(self, request):
        queryset = Product.objects.all()
        self.pagination_class = None
        serializer = ProductAllSerializer(queryset, many=True)
        return Response(serializer.data)
    

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.prefetch_related(
        'transaction_items__product',
    ).all()
    
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MediumPageSize
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = TransactionFilter
    
    search_fields = ['cashier__username', 'payment_method', 'id']
    ordering_fields = ['id', 'created_at', 'payment_method']
    ordering = ['-created_at']

    def _get_register_money(self, user):
        if not user.is_authenticated:
            return None

        register_money, _ = RegisterMoney.objects.get_or_create(cashier=user)
        return register_money

    def _build_register_summary(self, user):
        register_money = self._get_register_money(user)
        if not register_money:
            return None
        return RegisterMoneySerializer(register_money).data

    
    def get_serializer_class(self, *args, **kwargs):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateSerializer
        return TransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        output_serializer = TransactionSerializer(transaction, context=self.get_serializer_context())
        headers = self.get_success_headers(output_serializer.data)
        payload = output_serializer.data
        payload['register_money_summary'] = self._build_register_summary(request.user)
        return Response(payload, status=status.HTTP_201_CREATED, headers=headers)

    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        queryset = self.get_queryset()

        manila_tz = pytz.timezone('Asia/Manila')
        today = timezone.now().astimezone(manila_tz)

        daily_revenue = (
            queryset
            .filter(is_void=False, is_completed=True, created_at__date=today.date())
            .aggregate(total=Sum("net_total"))['total']
            or 0
        )
        
        if isinstance(response.data, dict):
            response.data['daily_total_revenue'] = daily_revenue
            response.data['register_money_summary'] = self._build_register_summary(request.user)
            
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

    @action(detail=True, methods=['post'], url_path='complete', url_name='complete')
    def complete(self, request, *args, **kwargs):
        transaction = self.get_object()
        serializer = TransactionCompleteSerializer(
            instance=transaction,
            data=request.data or {},
            context=self.get_serializer_context(),
        )
        serializer.is_valid(raise_exception=True)
        completed_transaction = serializer.save()

        output_serializer = TransactionSerializer(
            completed_transaction,
            context=self.get_serializer_context(),
        )
        payload = output_serializer.data
        payload['register_money_summary'] = self._build_register_summary(request.user)
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='register-money')
    def register_money(self, request):
        register_money = self._get_register_money(request.user)
        return Response(RegisterMoneySerializer(register_money).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='set-starting-money')
    def set_starting_money(self, request):
        serializer = RegisterMoneySetStartingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        register_money = self._get_register_money(request.user)
        amount = serializer.validated_data['amount']
        previous_amount = register_money.current_amount
        register_money.starting_money = amount
        register_money.current_amount = amount
        register_money.started_at = timezone.now()
        register_money.save(update_fields=['starting_money', 'current_amount', 'started_at', 'updated_at'])

        delta = amount - previous_amount
        if delta != 0:
            RegisterTransaction.objects.create(
                register_money=register_money,
                cashier=request.user,
                entry_type='addition' if delta > 0 else 'deduction',
                amount=abs(delta),
                note='Starting money adjusted',
                created_by=request.user,
            )

        return Response(RegisterMoneySerializer(register_money).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get', 'post'], url_path='deductions')
    def deductions(self, request):
        if request.method.lower() == 'get':
            queryset = RegisterDeduction.objects.select_related('cashier', 'created_by', 'register_money')

            if request.user.is_staff:
                cashier_id = request.query_params.get('cashier_id')
                if cashier_id:
                    queryset = queryset.filter(cashier_id=cashier_id)
            else:
                queryset = queryset.filter(cashier=request.user)

            serializer = RegisterDeductionSerializer(queryset[:200], many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = RegisterDeductionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cashier = request.user
        register_money, _ = RegisterMoney.objects.get_or_create(cashier=cashier)
        amount = serializer.validated_data['amount']

        if register_money.current_amount < amount:
            return Response(
                {"detail": "Deduction amount exceeds cashier register money."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        register_money.current_amount = register_money.current_amount - amount
        register_money.save(update_fields=['current_amount', 'updated_at'])

        deduction = RegisterDeduction.objects.create(
            register_money=register_money,
            cashier=cashier,
            amount=amount,
            note=serializer.validated_data.get('note', ''),
            created_by=request.user,
        )

        RegisterTransaction.objects.create(
            register_money=register_money,
            cashier=cashier,
            entry_type='deduction',
            amount=amount,
            note=serializer.validated_data.get('note', ''),
            created_by=request.user,
        )

        return Response(RegisterDeductionSerializer(deduction).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='register-transactions')
    def register_transactions(self, request):
        queryset = RegisterTransaction.objects.select_related('cashier', 'created_by', 'register_money')

        if not request.user.is_staff:
            queryset = queryset.filter(cashier=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RegisterTransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = RegisterTransactionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='verify-void-pin')
    def verify_void_pin(self, request):
        submitted_pin = str(request.data.get('pin', '')).strip()
        if not submitted_pin:
            return Response({"detail": "PIN is required."}, status=status.HTTP_400_BAD_REQUEST)

        settings_obj, _ = BusinessSettings.objects.get_or_create(pk=1)
        is_valid = submitted_pin == str(settings_obj.secret_pin)

        if not is_valid:
            return Response({"detail": "Invalid PIN."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"valid": True}, status=status.HTTP_200_OK)
    
        
class TransactionItemViewSet(viewsets.ModelViewSet):
    queryset = TransactionItem.objects.all()
    serializer_class = TransactionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    
class BusinessSettingsView(viewsets.ModelViewSet):
    queryset = BusinessSettings.objects.all()
    serializer_class = BusinessSettingsSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_object(self):
        obj, _ = BusinessSettings.objects.get_or_create(pk=1)
        return obj

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        payload = serializer.data.copy()
        if not request.user.is_staff:
            payload.pop('secret_pin', None)
        return Response(payload)

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        payload = serializer.data.copy()
        if not request.user.is_staff:
            payload.pop('secret_pin', None)
        return Response(payload)

    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({
                'label': "Permission Not Granted",
                'details': "You do not have the permission to edit business details",
                'type': "error"
            }, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        return Response({
            'label': "Creation Not Allowed",
            "detail": "There can only be one business detail existing",
            'type': "error"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

from django.db.models import Sum, Q
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek, Coalesce
from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware
from decimal import Decimal
from collections import defaultdict
from datetime import datetime
from payment.models import Payment
from inventory.models import Transaction as InventoryTransaction


class DashboardAnalyticsView(APIView):
    def get(self, request):
        frequency = request.query_params.get('frequency', 'daily')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        all_transactions = Transaction.objects.all()
        
        start_date = None
        end_date = None

        # 1️⃣ Independent Date Parsing and Filtering
        if start_date_str:
            parsed_start = parse_date(start_date_str)
            if not parsed_start:
                return Response({"detail": "Invalid start_date format. Use YYYY-MM-DD."}, status=400)
            start_date = make_aware(datetime.combine(parsed_start, datetime.min.time()))
            all_transactions = all_transactions.filter(created_at__gte=start_date)

        if end_date_str:
            parsed_end = parse_date(end_date_str)
            if not parsed_end:
                return Response({"detail": "Invalid end_date format. Use YYYY-MM-DD."}, status=400)
            end_date = make_aware(datetime.combine(parsed_end, datetime.max.time()))
            all_transactions = all_transactions.filter(created_at__lte=end_date)

        if start_date and end_date and start_date > end_date:
            return Response({"detail": "start_date cannot be after end_date."}, status=400)

        # 2️⃣ Base Queryset for Global Metrics
        valid_transactions = all_transactions.filter(is_void=False, is_completed=True)
        void_transactions = all_transactions.filter(is_void=True)

        void_total = void_transactions.count()
        successful_count = valid_transactions.count()

        # 3️⃣ Dynamic Days Calculation for Average
        math_end = end_date if end_date else timezone.now()
        
        if start_date:
            math_start = start_date
        else:
            first_txn = valid_transactions.order_by('created_at').first()
            math_start = first_txn.created_at if first_txn else math_end

        days = (math_end.date() - math_start.date()).days + 1
        avg_daily = successful_count / days if days > 0 else 0

        # 4️⃣ Top-Level Metrics
        total_products_sold = (
            TransactionItem.objects
            .filter(transaction__in=valid_transactions)
            .aggregate(total_qty=Sum('quantity'))['total_qty'] or 0
        )

        total_revenue_generated = (
            valid_transactions.aggregate(total=Sum('net_total'))['total'] or 0
        )

        order_payments = Payment.objects.filter(status='success')
        if start_date:
            order_payments = order_payments.filter(created_at__gte=start_date)
        if end_date:
            order_payments = order_payments.filter(created_at__lte=end_date)

        order_paid_revenue = order_payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        inventory_out_costs = InventoryTransaction.objects.filter(
            transaction_type='out',
        ).filter(
            Q(reason__startswith='Stock out done for transaction #') |
            Q(reason__startswith='Stock out done for order #')
        )

        if start_date:
            inventory_out_costs = inventory_out_costs.filter(purchase_date__gte=start_date.date())
        if end_date:
            inventory_out_costs = inventory_out_costs.filter(purchase_date__lte=end_date.date())

        total_capital = inventory_out_costs.aggregate(total=Sum('cost_amount'))['total'] or Decimal('0.00')
        total_combined_revenue = Decimal(str(total_revenue_generated)) + Decimal(str(order_paid_revenue))
        total_profit = total_combined_revenue - Decimal(str(total_capital))

        top_products = (
            TransactionItem.objects
            .filter(transaction__in=valid_transactions)
            .values('product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold', 'product__name')
        )[:10]

        least_products = (
            TransactionItem.objects
            .filter(transaction__in=valid_transactions)
            .values('product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('total_sold', 'product__name')[:10]
        )

        # 5️⃣ Sales Trend
        if frequency == "monthly":
            trunc = TruncMonth('transaction__created_at')
        elif frequency == "weekly":
            trunc = TruncWeek('transaction__created_at')
        else: 
            trunc = TruncDay('transaction__created_at')

        trend_data = (
            TransactionItem.objects.filter(transaction__in=valid_transactions)
            .annotate(period=trunc)
            .values('period')
            .annotate(amount=Sum('quantity'))
            .order_by('period')
        )

        trend_top_products_qs = (
            TransactionItem.objects
            .filter(transaction__in=valid_transactions)
            .annotate(period=trunc)
            .values('period', 'product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('period', '-total_sold', 'product__name')
        )

        period_top_products_map = defaultdict(list)
        for row in trend_top_products_qs:
            period = row.get('period')
            if period is None:
                continue
            if len(period_top_products_map[period]) >= 3:
                continue
            period_top_products_map[period].append({
                'product__name': row.get('product__name') or 'Unknown Product',
                'total_sold': row.get('total_sold') or 0,
            })

        formatted_trend = [
            {
                "period": item["period"],
                "amount": item["amount"],
                "top_products": period_top_products_map.get(item["period"], []),
            }
            for item in trend_data
        ]

        # 5b️⃣ Revenue Trend (same grouping as sales trend, but sums net_total)
        if frequency == "monthly":
            rev_trunc = TruncMonth('created_at')
        elif frequency == "weekly":
            rev_trunc = TruncWeek('created_at')
        else:
            rev_trunc = TruncDay('created_at')

        revenue_trend_data = (
            valid_transactions
            .annotate(period=rev_trunc)
            .values('period')
            .annotate(amount=Coalesce(Sum('net_total'), Decimal('0.00')))
            .order_by('period')
        )

        formatted_revenue_trend = [
            {"period": item["period"], "amount": float(item["amount"])}
            for item in revenue_trend_data
        ]

        # 6️⃣ Cashier Performance
        now = timezone.localtime()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)

        cashier_qs = (
            valid_transactions.filter(cashier__isnull=False)
            .values('cashier__id', 'cashier__first_name', 'cashier__last_name', 'cashier__username')
            .annotate(total_revenue=Sum('net_total'))
            .order_by('-total_revenue')
        )

        total_qs = (
            valid_transactions
            .values("cashier__id", "cashier__username", "cashier__first_name", "cashier__last_name")
            .annotate(
                total_revenue=Coalesce(Sum("net_total"), Decimal("0.00"))
            )
        )

        daily_qs = (
            valid_transactions
            .filter(created_at__gte=today_start)
            .values("cashier__id")
            .annotate(
                daily_revenue=Coalesce(Sum("net_total"), Decimal("0.00"))
            )
        )

        weekly_qs = (
            valid_transactions
            .filter(created_at__gte=week_start)
            .values("cashier__id")
            .annotate(
                weekly_revenue=Coalesce(Sum("net_total"), Decimal("0.00"))
            )
        )

        monthly_qs = (
            valid_transactions
            .filter(created_at__gte=month_start)
            .values("cashier__id")
            .annotate(
                monthly_revenue=Coalesce(Sum("net_total"), Decimal("0.00"))
            )
        )

        daily_map = {row["cashier__id"]: row["daily_revenue"] for row in daily_qs}
        weekly_map = {row["cashier__id"]: row["weekly_revenue"] for row in weekly_qs}
        monthly_map = {row["cashier__id"]: row["monthly_revenue"] for row in monthly_qs}

        cashier_performance = []

        for row in total_qs:
            cashier_id = row["cashier__id"]

            cashier_performance.append({
                "id": cashier_id,
                "name": f"{row['cashier__first_name']} {row['cashier__last_name']}".strip() 
                        or row["cashier__username"],
                "daily_revenue": float(daily_map.get(cashier_id, 0)),
                "weekly_revenue": float(weekly_map.get(cashier_id, 0)),
                "monthly_revenue": float(monthly_map.get(cashier_id, 0)),
                "total_revenue": float(row["total_revenue"]),
            })

        data = {
            "total_void_amount": void_total,
            "total_successful_transactions": successful_count,
            "total_products_sold": total_products_sold,
            "total_revenue_generated": round(total_revenue_generated, 2),
            "order_paid_revenue": round(order_paid_revenue, 2),
            "total_combined_revenue": round(total_combined_revenue, 2),
            "total_capital": round(total_capital, 2),
            "total_profit": round(total_profit, 2),
            "top_selling_products": list(top_products),
            "least_selling_products": list(least_products),
            "sales_trend": formatted_trend,
            "revenue_trend": formatted_revenue_trend,
            "cashier_performance": cashier_performance,
            "avg_daily_transactions": round(avg_daily, 2),
        }

        serializer = DashboardMetricsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)