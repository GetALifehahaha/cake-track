from rest_framework.decorators import action
from django.shortcuts import render
from rest_framework import permissions, viewsets, generics, filters, status
from rest_framework.response import Response
from django.db import models, transaction
from django.db.models import F
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

from .serializers import (TransactionSerializer, 
                          TransactionCreateSerializer, 
                          IngredientSerializer, 
                          RecipeSerializer, 
                          BulkRecipeCookSerializer, 
                          DashboardSummarySerializer, 
                          UnitSerializer,
                          TransactionHistorySerializer,
                          )

from .models import (Transaction, Ingredient, Recipe, Unit)

from users.permissions import IsCashier, IsCustomerOrAdmin, IsAdmin

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at', '-id')
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    
    def get_serializer_class(self):
        if (self.action == "create"):
            return TransactionCreateSerializer
        if self.action == "list" or self.action == "retrieve":
            return TransactionHistorySerializer
        return TransactionSerializer
    

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    filter_backends = [filters.SearchFilter]

    search_fields = ['name']

    def get_queryset(self):

        filter = self.request.query_params.get('filter')

        today = timezone.now().date()

        if filter == 'available':
            return Ingredient.objects.filter(total_stock__gt=0).distinct()

        elif filter == 'out_of_stock':
            return Ingredient.objects.exclude(total_stock__gt=0)

        elif filter == 'near_expiration':
            seven_days = today + timedelta(days=7)

            return Ingredient.objects.filter(
                transactions__transaction_type='in',
                transactions__remaining_amount__gt=0,
                transactions__expiration_date__gt=today,
                transactions__expiration_date__lte=seven_days
            ).distinct()

        elif filter == 'expired':
            return Ingredient.objects.filter(
                transactions__transaction_type='in',
                transactions__remaining_amount__gt=0,
                transactions__expiration_date__lte=today
            ).distinct()

        return Ingredient.objects.all()

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
    
    
class IngredientAllViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None
    
    
class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

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
        near_threshold = today + timedelta(days=7)

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
            expiration_date__gte=today,
            expiration_date__lte=near_threshold,
            remaining_amount__gt=0
        )

        # Ingredient-level for out of stock
        out_of_stock_ingredients = Ingredient.objects.filter(total_stock__lte=0)

        summary_data = {
            "in_stock_count": in_stock_batches.count(),
            "out_of_stock_count": out_of_stock_ingredients.count(),
            "near_expiration_count": near_expiration_batches.count(),
            "expired_count": expired_batches.count(),
        }

        return Response({
            "summary": summary_data
        })

