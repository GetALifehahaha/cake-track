from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    OrderViewSet,
    CakeOrderViewSet,
    CupcakeOrderViewSet
)

routers = DefaultRouter()
routers.register(r'', OrderViewSet)
routers.register(r'cake-order', CakeOrderViewSet)
routers.register(r'cupcake-order', CupcakeOrderViewSet)

urlpatterns = [
    path('', include(routers.urls))
]