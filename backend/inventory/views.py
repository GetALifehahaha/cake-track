from rest_framework.decorators import action
from django.shortcuts import render
from rest_framework import permissions, viewsets, generics, filters, status
from rest_framework.response import Response

from .serializers import (TransactionSerializer, TransactionCreateSerializer, IngredientSerializer, IngredientBatchSerializer, RecipeSerializer, BulkRecipeCookSerializer)

from .models import (Transaction, Ingredient, Recipe)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-purchase_date')
    permission_classes = [permissions.DjangoModelPermissions]
    
    def get_serializer_class(self):
        if (self.action == "create"):
            return TransactionCreateSerializer
        return TransactionSerializer
    

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions]
    
    
class IngredientAllViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by('name')
    serializer_class = IngredientSerializer
    permission_classes = [permissions.DjangoModelPermissions]
    pagination_class = None
    
    
class RecipeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Recipes to be viewed, created, or cooked.
    """
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.DjangoModelPermissions]

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