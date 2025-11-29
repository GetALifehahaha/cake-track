from django.urls import path, include
from .views import (IngredientViewSet, TransactionViewSet, IngredientAllViewSet, RecipeViewSet, InventoryDashboardViewSet )
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet)
router.register(r'ingredients-all', IngredientAllViewSet, basename="ingredients-all")
router.register(r'transactions', TransactionViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'dashboard', InventoryDashboardViewSet, basename='inventory-dashboard')


urlpatterns = [
    path('', include(router.urls)),
]