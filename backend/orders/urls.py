from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrderViewSet,
    CakeOrderViewSet,
    CupcakeOrderViewSet,
    DashboardView,
    CakeViewSet
)

routers = DefaultRouter()
routers.register(r'orders', OrderViewSet)
routers.register(r'cake-order', CakeOrderViewSet)
routers.register(r'cupcake-order', CupcakeOrderViewSet)
routers.register(r'cakes', CakeViewSet)

urlpatterns = [
    path('', include(routers.urls)),
    path('analytics/', DashboardView.as_view(), name="dashboard-analytics")
]