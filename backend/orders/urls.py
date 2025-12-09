from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrderViewSet,
    CakeOrderViewSet,
    CupcakeOrderViewSet,
    DashboardView
)

routers = DefaultRouter()
routers.register(r'', OrderViewSet)
routers.register(r'cake-order', CakeOrderViewSet)
routers.register(r'cupcake-order', CupcakeOrderViewSet)

urlpatterns = [
    path('', include(routers.urls)),
    path('analytics/', DashboardView.as_view(), name="dashboard-analytics")
]