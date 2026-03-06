from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, viewsets, generics, filters
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, DjangoModelPermissions, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action

from .serializers import UserSerializer, UserProfileSerializer, CashierCreateSerializer, ChangePasswordSerializer, OTPSerializer, UserUpdateSerializer
from .models import OTP, PasswordResetToken

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

    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    def get_queryset(self):
        queryset = User.objects.filter(groups__name="cashier")
        
        return queryset
    
    @action(detail=False, methods=['patch', 'put'], url_path='update-me')
    def update_me(self, request):
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True, 
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
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
        
import random
import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random

class OTPViewSet(viewsets.ModelViewSet):
    queryset = OTP.objects.all()
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response({'type': 'error', 'label': 'No Email', 'details': 'No email has been sent'}, status=status.HTTP_400_BAD_REQUEST)

        random_otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user = None
        otp = None

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
        
        if user:
            otp_obj, created = OTP.objects.update_or_create(
                user=user,
                defaults={
                    'otp': random_otp,
                    'is_valid': True,
                    'expires_at': timezone.now() + timedelta(minutes=15)
                }
            )

            subject = 'Your Password Reset OTP'
            message = f"Your OTP for password reset is {random_otp}. It will expire in 15 minutes. If you didn't request this OTP, disregard this email."
            
            send_mail(
                subject, 
                message, 
                settings.DEFAULT_FROM_EMAIL, 
                [email],
                fail_silently=False,
            )
        
        return Response({'type': 'success', 'label': 'OTP Sent!', 'details': 'The OTP has been sent! Check your email address for more information'}, status=status.HTTP_200_OK)


class VerifyOTPViewSet(viewsets.ModelViewSet):
    queryset = OTP.objects.all()
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        received_otp = request.data.get('otp')
        email = request.data.get('email')

        try:
            otp = OTP.objects.get(otp=received_otp, user__email__iexact=email)
            user = User.objects.get(email=email)

            if not otp.is_valid:
                return Response({'type': 'error', 'label': 'Invalid OTP', 'details': 'The OTP you have sent is no longer valid. Please request another OTP'}, status=status.HTTP_400_BAD_REQUEST)


            if otp.expires_at < timezone.localtime():
                return Response({'type': 'error', 'label': 'Expired OTP', 'details': 'The OTP you have sent has expired. Please request another OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            otp.is_valid = False
            otp.save(update_fields=['is_valid'])

            token = secrets.token_urlsafe(32)

            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.localtime() + timedelta(minutes=5)
            )

            return Response({'type': 'success', 'label': 'OTP has been verified', 'details': 'Your OTP has now been verified. Please change your password within 5 minutes.', 'token': token}, status=status.HTTP_200_OK)

        except OTP.DoesNotExist:
            return Response({'type': 'error', 'label': 'Invalid OTP', 'details': 'The OTP you have sent is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        


class ChangePasswordViaToken(viewsets.ModelViewSet):
    queryset = PasswordResetToken.objects.all()
    permission_classes = [AllowAny]

    def create(self, request):
        received_token = request.data.get('token')
        password = request.data.get('password')
        email = request.data.get('email')

        if not received_token or not password or not email:
            return Response({'type': 'error', 'label': 'Missing Data', 'details': 'Token, email, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = PasswordResetToken.objects.get(token=received_token)

            if token.expires_at < timezone.localtime():
                return Response({'type': 'error', 'label': 'Expired Token', 'details': 'Your token has expired. Please redo the process carefully'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(email=email)

            if token.user != user:
                return Response({'type': 'error', 'label': 'Token Mismatch', 'details': 'This token does not belong to the specified user.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(password)
            user.save()

            token.used = True
            token.save(update_fields=['used'])

            return Response({'type': 'success', 'label': 'Password Changed', 'details': 'Your password has been changed successfully. You will be redirected to the login page shortly.'}, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({'type': 'error', 'label': 'Missing Token.', 'details': 'You have missing token. Please redo the process carefully'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'type': 'error', 'label': 'Invalid User', 'details': 'Your credentials does not exist in the system.'}, status=status.HTTP_400_BAD_REQUEST)

        
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not uidb64 or not token or not new_password:
            return Response({
            "label": "Missing Details",
            "details": "You have missing data. Please try activating your account again.",
            "type": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.set_password(new_password)
            user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                "label": "Account Activated Successfully",
                "details": "Your account has been activated successfully. Welcome to Cake Track!",
                "type": "success"
            }, status=status.HTTP_200_OK)
        
        return Response({
            "label": "Invalid Activation Link",
            "details": "Activation link is invalid or has expired.",
            "type": "error"
            }, status=status.HTTP_400_BAD_REQUEST)
