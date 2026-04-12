from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
import uuid
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets, generics, filters
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, DjangoModelPermissions, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action

from .serializers import UserSerializer, UserProfileSerializer, CashierCreateSerializer, ChangePasswordSerializer, OTPSerializer, UserUpdateSerializer, AddressSerializer, CustomTokenObtainPairSerializer, CustomerRegistrationSerializer
from .models import OTP, PasswordResetToken, Address, UserProfile

from .permissions import IsAdmin, IsCashier
from .services import (
    DEACTIVATED_ACCOUNT_RETENTION_DAYS,
    get_days_until_deletion,
    get_deletion_due_date,
    purge_expired_deactivated_accounts,
)

from google.oauth2 import id_token
from google.auth.transport import requests


def build_deactivated_account_response(user, profile):
    deletion_due = get_deletion_due_date(profile)
    return {
        'code': 'account_deactivated',
        'detail': 'This account is no longer active. Do you want to activate it again?',
        'username': user.username,
        'deactivated_at': timezone.localtime(profile.deactivated_at).isoformat() if profile.deactivated_at else None,
        'deletion_due_at': timezone.localtime(deletion_due).isoformat() if deletion_due else None,
        'retention_days': DEACTIVATED_ACCOUNT_RETENTION_DAYS,
        'days_until_deletion': get_days_until_deletion(profile),
    }


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):

        if self.request.user.is_staff:
            return CashierCreateSerializer
        return CustomerRegistrationSerializer
    
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [DjangoModelPermissions, IsAdmin]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['first_name', 'last_name', 'username', 'email']
    ordering = ['first_name', 'last_name']
    
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

    def patch(self, request, *args, **kwargs):
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            # Return the full profile so the client can update its state
            return Response(UserProfileSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)
    
    
    
    
class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        purge_expired_deactivated_accounts()

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

            if not user.is_active:
                profile, _ = UserProfile.objects.get_or_create(user=user)

                if profile.deactivated_at:
                    return Response(
                        build_deactivated_account_response(user, profile),
                        status=status.HTTP_403_FORBIDDEN,
                    )

                return Response(
                    {'detail': 'This account is not active. Please contact support.'},
                    status=status.HTTP_403_FORBIDDEN,
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
from django.utils import timezone
from datetime import timedelta
from .email_templates import send_otp_template_email

class OTPViewSet(viewsets.ModelViewSet):
    queryset = OTP.objects.all()
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response({'type': 'error', 'label': 'No Email', 'details': 'No email has been sent'}, status=status.HTTP_400_BAD_REQUEST)

        random_otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user = None
        otp = None

        user = User.objects.filter(email=email).first()
        
        if user:
            otp_obj, created = OTP.objects.update_or_create(
                user=user,
                defaults={
                    'otp': random_otp,
                    'is_valid': True,
                    'expires_at': timezone.now() + timedelta(minutes=15)
                }
            )

            try:
                send_otp_template_email(
                    recipient_email=email,
                    cashier_name=user.first_name or user.username,
                    otp_value=random_otp,
                )
            except Exception:
                return Response(
                    {
                        'type': 'error',
                        'label': 'Failed to send OTP',
                        'details': 'Unable to send OTP email via Resend. Please try again later.'
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        
        return Response(
            {
                'type': 'success',
                'label': 'Request received',
                'details': 'If this email is registered, an OTP has been sent. Please check your inbox and spam folder.',
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPViewSet(viewsets.ModelViewSet):
    queryset = OTP.objects.all()
    serializer_class = OTPSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request):
        received_otp = request.data.get('otp')
        email = request.data.get('email')

        try:
            otp = OTP.objects.get(otp=received_otp, user__email__iexact=email)
            user = otp.user

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
    authentication_classes = []

    def create(self, request):
        received_token = request.data.get('token')
        password = request.data.get('password')
        email = request.data.get('email')

        if not received_token or not password or not email:
            return Response({'type': 'error', 'label': 'Missing Data', 'details': 'Token, email, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = PasswordResetToken.objects.get(token=received_token)

            if token.used:
                return Response({'type': 'error', 'label': 'Token Already Used', 'details': 'This token has already been used. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            if token.expires_at < timezone.localtime():
                return Response({'type': 'error', 'label': 'Expired Token', 'details': 'Your token has expired. Please redo the process carefully'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email).first()

            if not user:
                return Response({'type': 'error', 'label': 'User Not Found', 'details': 'No user found with that email.'}, status=status.HTTP_400_BAD_REQUEST)

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


class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response({
            "label": "Missing Details",
            "details": "You have missing data. Please try activating your account again.",
            "type": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = UserProfile.objects.get(activation_token=token)
            user = profile.user

        except (TypeError, ValueError, OverflowError, User.DoesNotExist, UserProfile.DoesNotExist):
            user = None

        if user is not None and profile is not None:
            user.is_active = True
            user.set_password(new_password)
            user.save()

            profile.activation_token = None
            profile.save(update_fields=['activation_token'])

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


class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        confirmation = str(request.data.get('confirmation', '')).strip()
        expected_confirmation = f"disable {request.user.username}"

        if confirmation != expected_confirmation:
            return Response(
                {
                    'detail': f'Confirmation must match exactly: {expected_confirmation}'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.deactivated_at = timezone.now()
        profile.save(update_fields=['deactivated_at'])

        request.user.is_active = False
        request.user.save(update_fields=['is_active'])

        deletion_due = get_deletion_due_date(profile)
        return Response(
            {
                'detail': 'Your account has been deactivated.',
                'deactivated_at': timezone.localtime(profile.deactivated_at).isoformat() if profile.deactivated_at else None,
                'deletion_due_at': timezone.localtime(deletion_due).isoformat() if deletion_due else None,
                'retention_days': DEACTIVATED_ACCOUNT_RETENTION_DAYS,
            },
            status=status.HTTP_200_OK,
        )


class ReactivateAccountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        purge_expired_deactivated_accounts()

        username = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))
        confirmation = str(request.data.get('confirmation', '')).strip()

        if not username or not password or not confirmation:
            return Response(
                {
                    'detail': 'Username, password, and confirmation are required.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.deactivated_at:
            return Response(
                {'detail': 'This account is not marked as deactivated.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        expected_confirmation = f"activate {user.username}"
        if confirmation != expected_confirmation:
            return Response(
                {
                    'detail': f'Confirmation must match exactly: {expected_confirmation}'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        deletion_due = get_deletion_due_date(profile)
        if deletion_due and timezone.now() >= deletion_due:
            user.delete()
            return Response(
                {
                    'code': 'account_deleted',
                    'detail': 'This account passed the deactivation retention window and was deleted.',
                },
                status=status.HTTP_410_GONE,
            )

        user.is_active = True
        user.save(update_fields=['is_active'])

        profile.deactivated_at = None
        profile.save(update_fields=['deactivated_at'])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'detail': 'Account reactivated successfully.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
