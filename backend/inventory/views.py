from rest_framework.decorators import action
from django.shortcuts import render
from rest_framework import permissions, viewsets, generics, filters, status
from rest_framework.response import Response
from django.db import models, transaction
from django.db.models import F
from django.utils import timezone

from .serializers import (TransactionSerializer, TransactionCreateSerializer, IngredientSerializer, RecipeSerializer, BulkRecipeCookSerializer, DashboardSummarySerializer, UnitSerializer)

from .models import (Transaction, Ingredient, Recipe, Unit)

from users.permissions import IsCashier, IsCustomerOrAdmin, IsAdmin

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer = UnitSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-purchase_date')
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    
    def get_serializer_class(self):
        if (self.action == "create"):
            return TransactionCreateSerializer
        return TransactionSerializer
    

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    
    
class IngredientAllViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]
    pagination_class = None
    
    
class RecipeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Recipes to be viewed, created, or cooked.
    """
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.DjangoModelPermissions, IsAdmin]

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


LOW_STOCK_THRESHOLD = 10 

class InventoryDashboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def list(self, request, *args, **kwargs):

        in_stock_qs = self.get_queryset().filter(total_stock__gt=0)
        
        out_of_stock_qs = self.get_queryset().filter(total_stock__lte=0)
        
        running_low_qs = self.get_queryset().filter(total_stock__lt=LOW_STOCK_THRESHOLD)# Distinct ensures each ingredient is only counted once

        expired_qs = orders_to_update = Ingredient.objects.filter(
            transactions__expiration_date__lt=timezone.now().date(),
            transactions__remaining_amount__gt=0
        ).distinct() # Distinct ensures each ingredient is only counted once
        
        summary_data = {
            'in_stock_count': in_stock_qs.count(),
            'out_of_stock_count': out_of_stock_qs.count(),
            'running_low_count': running_low_qs.count(), 
            'expired_count': expired_qs.count(),
        }

        summary_serializer = DashboardSummarySerializer(summary_data)
        
        running_low_details = self.get_serializer(running_low_qs, many=True).data

        return Response({
            'summary': summary_serializer.data,
            'running_low_items': running_low_details,
        })