from rest_framework.decorators import action
from django.shortcuts import render
from rest_framework import permissions, viewsets, generics, filters, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db import models, transaction
from django.db.models.deletion import ProtectedError
from django.db.models import Prefetch
from django.db.models.functions import Lower
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from rest_framework.exceptions import ValidationError as DRFValidationError

from .serializers import (TransactionSerializer, 
                          TransactionCreateSerializer, 
                          IngredientSerializer, 
                          RecipeSerializer, 
                          BulkRecipeCookSerializer, 
                          DashboardSummarySerializer, 
                          ContainerSerializer,
                          UnitSerializer,
                          TransactionHistorySerializer,
                          )

from .models import (Transaction, Ingredient, Recipe, Unit, Container, IngredientUnitConversion)

from users.permissions import IsCashier, IsCustomerOrAdmin, IsAdmin


class ContainerViewSet(viewsets.ModelViewSet):
    queryset = Container.objects.select_related('unit').all().order_by(Lower('name'), 'name')
    serializer_class = ContainerSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None

    def perform_destroy(self, instance):
        linked_unit = instance.unit
        is_used_in_mappings = IngredientUnitConversion.objects.filter(
            models.Q(from_unit=linked_unit) | models.Q(to_unit=linked_unit)
        ).exists()
        is_used_as_base = Ingredient.objects.filter(unit=linked_unit).exists()

        if is_used_in_mappings or is_used_as_base:
            raise DRFValidationError({
                'detail': 'Container is currently used by ingredient mappings and cannot be deleted.'
            })

        try:
            with transaction.atomic():
                instance.delete()
                linked_unit.delete()
        except ProtectedError as error:
            raise DRFValidationError({
                'detail': 'Container is protected by related records and cannot be deleted.'
            }) from error

class UnitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Unit.objects.all().order_by(Lower('name'), 'name')
    serializer_class = UnitSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None

class TransactionHistoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at', '-id')
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = TransactionHistoryPagination
    
    def get_serializer_class(self):
        if (self.action == "create"):
            return TransactionCreateSerializer
        if self.action == "list" or self.action == "retrieve":
            return TransactionHistorySerializer
        return TransactionSerializer


def _normalize_near_expiration_days(value):
    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        return 7

    return parsed_value if parsed_value > 0 else 7


def _is_near_expiration(expiration_date, today, near_expiration_days):
    if not expiration_date or expiration_date <= today:
        return False

    near_threshold = today + timedelta(days=_normalize_near_expiration_days(near_expiration_days))
    return expiration_date <= near_threshold


def _get_filtered_ingredients_queryset(filter_value):
    today = timezone.now().date()

    if filter_value == 'available':
        return Ingredient.objects.filter(total_stock__gt=0).distinct().order_by(Lower('name'), 'name')

    if filter_value == 'out_of_stock':
        return Ingredient.objects.exclude(total_stock__gt=0).order_by(Lower('name'), 'name')

    if filter_value == 'near_expiration':
        candidates = Ingredient.objects.filter(
            transactions__transaction_type='in',
            transactions__remaining_amount__gt=0,
            transactions__expiration_date__gt=today,
        ).prefetch_related(
            Prefetch(
                'transactions',
                queryset=Transaction.objects.filter(
                    transaction_type='in',
                    remaining_amount__gt=0,
                    expiration_date__gt=today,
                ).only('id', 'ingredient_id', 'expiration_date').order_by('expiration_date', 'purchase_date', 'id'),
            )
        ).distinct()

        ingredient_ids = [
            ingredient.id
            for ingredient in candidates
            if any(
                _is_near_expiration(batch.expiration_date, today, ingredient.near_expiration_days)
                for batch in ingredient.transactions.all()
            )
        ]

        if not ingredient_ids:
            return Ingredient.objects.none().order_by(Lower('name'), 'name')

        return Ingredient.objects.filter(id__in=ingredient_ids).order_by(Lower('name'), 'name')

    if filter_value == 'expired':
        return Ingredient.objects.filter(
            transactions__transaction_type='in',
            transactions__remaining_amount__gt=0,
            transactions__expiration_date__lte=today
        ).distinct().order_by(Lower('name'), 'name')

    return Ingredient.objects.all().order_by(Lower('name'), 'name')


class IngredientInventoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by(Lower('name'), 'name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    pagination_class = None

    search_fields = ['name']

    def get_queryset(self):
        filter_value = self.request.query_params.get('filter')
        return _get_filtered_ingredients_queryset(filter_value)

    @action(detail=False, methods=["post"], url_path="stock-out-expired")
    def stock_out_expired(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.localdate()

        expired_batches = Transaction.objects.filter(
            transaction_type='in',
            expiration_date__lte=today,
            remaining_amount__gt=0
        ).select_related("ingredient")

        if not expired_batches.exists():
            return Response(
                {"message": "No expired batches found."},
                status=status.HTTP_200_OK
            )

        affected_ingredients = {}
        affected_costs = {}
        total_stocked_out = Decimal("0")

        with transaction.atomic():
            for batch in expired_batches:
                ingredient = batch.ingredient
                remaining = batch.remaining_amount

                if ingredient.id not in affected_ingredients:
                    affected_ingredients[ingredient.id] = Decimal("0")
                    affected_costs[ingredient.id] = Decimal("0")

                affected_ingredients[ingredient.id] += remaining
                affected_costs[ingredient.id] += remaining * Decimal(str(batch.unit_purchase_price or "0.00"))
                total_stocked_out += remaining

                batch.remaining_amount = Decimal("0")
                batch.save()

            for ingredient_id, deducted_amount in affected_ingredients.items():
                ingredient = Ingredient.objects.get(id=ingredient_id)
                ingredient.total_stock -= deducted_amount
                if ingredient.total_stock < 0:
                    ingredient.total_stock = Decimal("0")
                ingredient.save()

                Transaction.objects.create(
                    ingredient=ingredient,
                    amount=deducted_amount,
                    remaining_amount=Decimal("0"), 
                    transaction_type='out',
                    purchase_date=today,
                    cost_amount=affected_costs.get(ingredient_id, Decimal("0.00")),
                    reason='Stocked out expired ingredients',
                )

        return Response(
            {
                "message": "Expired batches stocked out successfully.",
                "total_quantity_removed": str(total_stocked_out),
                "affected_ingredients": len(affected_ingredients)
            },
            status=status.HTTP_200_OK
        )


class IngredientPaginatedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all().order_by(Lower('name'), 'name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    pagination_class = IngredientInventoryPagination

    def get_queryset(self):
        filter_value = self.request.query_params.get('filter')
        return _get_filtered_ingredients_queryset(filter_value)
    
    
class IngredientAllViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by(Lower('name'), 'name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None
    
    def list(self, request, *args, **kwargs):
        """
        Override list to gracefully handle missing DB column errors (e.g., legacy DB without Unit.symbol).
        If a DB OperationalError referencing a missing column occurs, return a simplified payload
        that avoids selecting the problematic Unit fields.
        """
        from django.db import OperationalError
        from .models import Unit

        try:
            return super().list(request, *args, **kwargs)
        except OperationalError as error:
            msg = str(error).lower()
            if 'no such column' in msg or 'inventory_unit.symbol' in msg:
                # Build simplified response avoiding selection of Unit.symbol
                queryset = Ingredient.objects.all().order_by(Lower('name'), 'name')
                data = []
                for ing in queryset:
                    unit_val = Unit.objects.filter(id=ing.unit_id).values('id', 'name').first()
                    data.append({
                        'id': ing.id,
                        'name': ing.name,
                        'unit': unit_val,
                        'total_stock': str(ing.total_stock),
                        'low_amount': str(ing.low_amount),
                        'near_expiration_days': ing.near_expiration_days,
                        'batches': [],
                        'containers': [],
                        'conversions': [],
                    })

                return Response(data)

            raise
    
    
class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def get_queryset(self):
        queryset = Recipe.objects.all().order_by('name')

        if self.action == 'list':
            return queryset.filter(is_temporary=False)

        return queryset

    # POST /api/recipes/cook/
    @action(detail=False, methods=['post'])
    def cook(self, request):
        """
        Accepts a list of recipes and quantities, validates stock, 
        and performs FIFO deduction.
        """
        serializer = BulkRecipeCookSerializer(data=request.data)
        
        if serializer.is_valid():
            # This triggers the 'create' method in BulkRecipeCookSerializer
            # which handles the atomic transaction and batch deduction
            result = serializer.save() 
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryDashboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


    def list(self, request, *args, **kwargs):
        today = timezone.localdate()

        # Batch-level queries
        in_stock_batches = Transaction.objects.filter(
            transaction_type='in',
            remaining_amount__gt=0
        )

        expired_batches = Transaction.objects.filter(
            transaction_type='in',
            expiration_date__lte=today,
            remaining_amount__gt=0
        )

        near_expiration_batches = Transaction.objects.filter(
            transaction_type='in',
            expiration_date__gt=today,
            remaining_amount__gt=0
        ).select_related('ingredient').only('id', 'expiration_date', 'ingredient__near_expiration_days')

        near_expiration_count = sum(
            1
            for batch in near_expiration_batches
            if _is_near_expiration(
                batch.expiration_date,
                today,
                getattr(batch.ingredient, 'near_expiration_days', 7),
            )
        )

        # Ingredient-level for out of stock
        out_of_stock_ingredients = Ingredient.objects.filter(total_stock__lte=0)

        summary_data = {
            "in_stock_count": in_stock_batches.count(),
            "out_of_stock_count": out_of_stock_ingredients.count(),
            "near_expiration_count": near_expiration_count,
            "expired_count": expired_batches.count(),
        }

        return Response({
            "summary": summary_data
        })

