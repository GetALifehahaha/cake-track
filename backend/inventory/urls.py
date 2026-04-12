from django.urls import path, include
from .views import (IngredientViewSet, IngredientPaginatedViewSet, TransactionViewSet, IngredientAllViewSet, RecipeViewSet, InventoryDashboardViewSet, UnitViewSet, ContainerViewSet )
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet)
router.register(r'ingredients-paginated', IngredientPaginatedViewSet, basename="ingredients-paginated")
router.register(r'ingredients-all', IngredientAllViewSet, basename="ingredients-all")
router.register(r'transactions', TransactionViewSet)
router.register(r'recipes', RecipeViewSet)
router.register(r'dashboard', InventoryDashboardViewSet, basename='inventory-dashboard')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'containers', ContainerViewSet, basename='container')


urlpatterns = [
    path('', include(router.urls)),
]