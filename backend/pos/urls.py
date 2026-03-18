from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from .views import (DiscountViewSet,
                    DiscountUsageViewSet,
                    CategoryViewSet,
                    ProductVariantViewSet,
                    ProductViewSet,
                    TransactionViewSet,
                    TransactionItemViewSet,
                    DashboardAnalyticsView,
                    BusinessSettingsView
                    )


router = DefaultRouter()
router.register(r'discounts', DiscountViewSet)
router.register(r'discount-usage', DiscountUsageViewSet, basename='discount-usage')
router.register(r'categories', CategoryViewSet)
router.register(r'product-variants', ProductVariantViewSet)
router.register(r'products', ProductViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'transaction-items', TransactionItemViewSet)
router.register(r'business-details', BusinessSettingsView)

urlpatterns = [
    path('', include(router.urls)), 
    path('dashboard/', DashboardAnalyticsView.as_view(), name="dashboard-analytics")
]
# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)