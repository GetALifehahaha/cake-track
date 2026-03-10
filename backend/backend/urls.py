"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.routers import DefaultRouter

from users.views import CreateUserView, UserProfileView, UserViewSet, GoogleAuthView, OTPViewSet, VerifyOTPViewSet, ChangePasswordViaToken, ActivateAccountView, AddressViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename="cashiers")
router.register('addresses', AddressViewSet, basename="addresses")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('pos/', include('pos.urls')),
    path('inventory/', include('inventory.urls')),
    path('orders/', include('orders.urls')),
    path('me/', UserProfileView.as_view(), name="me"),
    path('users/google-auth/', GoogleAuthView.as_view(), name="google-auth"),
    path('users/user/register/', CreateUserView.as_view(), name="register"),
    path('users/user/activate/', ActivateAccountView.as_view(), name="activate"),
    path('users/token/', TokenObtainPairView.as_view(), name="get_token"),
    path('users/token/refresh/', TokenRefreshView.as_view(), name="refresh_token"),
    path('api-auth/', include('rest_framework.urls', namespace="rest_framework")),
    path('request-otp/', OTPViewSet.as_view({'post': 'create'}), name="request-otp"),
    path('verify-otp/', VerifyOTPViewSet.as_view({'post': 'create'}, name="verify-otp")),
    path('change-password-token/', ChangePasswordViaToken.as_view({'post': 'create'}, name="change-password-token")),
    path('payment/', include('payment.urls')),
    path('', include(router.urls))
]
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)