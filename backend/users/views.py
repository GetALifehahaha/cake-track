from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, DjangoModelPermissions, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action

from .serializers import UserSerializer, UserProfileSerializer, CashierCreateSerializer, ChangePasswordSerializer

from .permissions import IsAdmin, IsCashier

from google.oauth2 import id_token
from google.auth.transport import requests

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return CashierCreateSerializer
        return UserSerializer
    
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [DjangoModelPermissions, IsAdmin]
    
    def get_queryset(self):
        queryset = User.objects.filter(groups__name="cashier")
        
        return queryset
    
    @action(methods=['post'], permission_classes=[IsAuthenticated], detail=False, url_path='change-password')
    def change_password(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data['password'])
        user.save()

        return Response({"detail": "Password has been changed successfully"}, status=status.HTTP_200_OK)

    
class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    
class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        source = request.data.get('source', 'web')
        
        if not token:
            return Response({"error": "Login Token Missing"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=20
            )
            
            if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
                print(f"✗ Audience Mismatch!")
                return Response({"error": "Invalid Token Audience"}, status=status.HTTP_400_BAD_REQUEST)
            
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            if not email:
                print(f"✗ No email in token")
                return Response({"error": "Email not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(
                    email=email
                )
            except User.DoesNotExist:
                if source == 'app':
                    # Source is APP: Create the account (Customer)
                    username = f"{first_name.lower()}{last_name.lower()}_{uuid.uuid4().hex[:4]}"
                    user = User.objects.create(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        # is_staff=False by default, assuming User model defaults
                    )
                    user.set_unusable_password() # They use Google to login
                    user.save()
                
                else:
                    # Source is WEB (or unspecified): Deny access
                    return Response(
                        {'detail': 'Account does not exist. Please contact the owner to create your account.'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
            
        except ValueError as e:
            return Response({"error": f"Invalid Google Token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Authentication failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)