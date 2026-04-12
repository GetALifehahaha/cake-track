from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrderViewSet,
    OrderOverviewViewSet,
    CakeOrderViewSet,
    CupcakeOrderViewSet,
    DashboardView,
    CakeViewSet,
    BlockedDateView,
    OpeningTimeView,
)

routers = DefaultRouter()
routers.register(r'orders', OrderViewSet)
routers.register(r'overview', OrderOverviewViewSet, basename='orders-overview')
routers.register(r'cake-order', CakeOrderViewSet)
routers.register(r'cupcake-order', CupcakeOrderViewSet)
routers.register(r'cakes', CakeViewSet)

urlpatterns = [
    path('', include(routers.urls)),
    path('dashboard/', DashboardView.as_view(), name="dashboard-analytics"),
    path('blocked-dates/', BlockedDateView.as_view(), name="blocked-dates"),
    path('opening-time/', OpeningTimeView.as_view(), name="opening-time"),
]