from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (DiscountViewSet,
                    SizeViewSet,
                    CategoryViewSet,
                    ProductSizeViewSet,
                    ProductViewSet,
                    TransactionViewSet,
                    TransactionItemViewSet)


router = DefaultRouter()
router.register(r'discounts', DiscountViewSet)
router.register(r'sizes', SizeViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'product-sizes', ProductSizeViewSet)
router.register(r'products', ProductViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'transaction-items', TransactionItemViewSet)

urlpatterns = [path('', include(router.urls))]