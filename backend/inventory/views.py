from django.shortcuts import render
from rest_framework import permissions, viewsets, generics, filters

from .serializers import (TransactionSerializer, TransactionCreateSerializer, IngredientSerializer, IngredientBatchSerializer)

from .models import (Transaction, Ingredient)

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