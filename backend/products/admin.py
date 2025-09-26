from django.contrib import admin
from .models import Product, ProductStorage, Ingredient, IngredientStorage, Recipe

# Register your models here.
admin.site.register([Product, ProductStorage, Ingredient, IngredientStorage, Recipe])