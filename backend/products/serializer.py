from rest_framework import serializers
from .models import Product, ProductStorage, Recipe, Ingredient, IngredientStorage, RecipeIngredient

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'prep_time', 'cook_time']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'price', 'had_recipe', 'has_storage', 'recipe']
        extra_kwargs = {'recipe': {'read_only': True}}


class ProductStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStorage
        fields = ['id', 'product', 'quantity',  'shelf_life']
        extra_kwargs = {'product': {'read_only': True}}


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit']
        

class IngredientStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientStorage
        fields = ['id', 'ingredient', 'quantity',  'shelf_life']