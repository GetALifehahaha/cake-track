from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics
from .serializer import RecipeSerializer, ProductSerializer, ProductStorageSerializer, IngredientSerializer, RecipeIngredientSerializer, IngredientStorageSerializer 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from .models import Recipe, Product, ProductStorage, Ingredient, RecipeIngredient, IngredientStorage

# Create your views here.
class ProductListCreate(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

