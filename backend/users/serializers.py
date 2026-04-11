from rest_framework import serializers, validators
from django.contrib.auth.models import User, Group
from django.conf import settings
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
import uuid

from .models import (
    OTP, 
    UserProfile,
    Address,
    )
from .services import (
    DEACTIVATED_ACCOUNT_RETENTION_DAYS,
    get_days_until_deletion,
    get_deletion_due_date,
    purge_expired_deactivated_accounts,
)
from .email_templates import send_activation_template_email

MIN_CREDENTIAL_LENGTH = 8


def validate_username_password_rules(username, password):
    cleaned_username = str(username or '').strip()
    cleaned_password = str(password or '').strip()
    errors = {}

    if len(cleaned_username) < MIN_CREDENTIAL_LENGTH:
        errors['username'] = [f'Username must be at least {MIN_CREDENTIAL_LENGTH} characters.']

    if len(cleaned_password) < MIN_CREDENTIAL_LENGTH:
        errors['password'] = [f'Password must be at least {MIN_CREDENTIAL_LENGTH} characters.']

    if cleaned_username and cleaned_password and cleaned_username.lower() == cleaned_password.lower():
        errors.setdefault('password', []).append('Password should not be similar to the username.')

    if errors:
        raise serializers.ValidationError(errors)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        validate_username_password_rules(attrs.get('username'), attrs.get('password'))

        purge_expired_deactivated_accounts()

        username = attrs.get('username')
        password = attrs.get('password')
        user = User.objects.filter(username=username).first()

        if user and password and user.check_password(password) and not user.is_active:
            profile, _ = UserProfile.objects.get_or_create(user=user)

            if profile.deactivated_at:
                deletion_due = get_deletion_due_date(profile)
                raise serializers.ValidationError({
                    'code': 'account_deactivated',
                    'detail': 'This account is no longer active. Reactivate it to continue.',
                    'username': user.username,
                    'deactivated_at': timezone.localtime(profile.deactivated_at).isoformat(),
                    'deletion_due_at': timezone.localtime(deletion_due).isoformat() if deletion_due else None,
                    'retention_days': DEACTIVATED_ACCOUNT_RETENTION_DAYS,
                    'days_until_deletion': get_days_until_deletion(profile),
                })

            raise serializers.ValidationError({
                'detail': 'This account is not active. Please contact support.'
            })

        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    middle_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'middle_name', 'last_name', 'email', 'username', 'password', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        validate_username_password_rules(attrs.get('username'), attrs.get('password'))
        return attrs
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        request = self.context.get('request')
        
        if request and request.user and request.user.is_staff:
            group_name = "cashier"
        else:
            group_name = "customer"
            
        cashier, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(cashier)
        
        return user
    
    def get_middle_name(self, obj):
        try:
            return obj.profile.middle_name
        except AttributeError:
            return ''


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username']
        
    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    

class ChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

        
class CashierCreateSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        validators=[validators.UniqueValidator(
            queryset=User.objects.all(),
            message="This username is already taken."
        )]
    )
    email = serializers.EmailField(
        validators=[validators.UniqueValidator(
            queryset=User.objects.all(),
            message="A user with this email already exists."
        )]
    )
    middle_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['first_name', 'middle_name', 'last_name', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        validate_username_password_rules(attrs.get('username'), attrs.get('password'))
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            validated_data['is_active'] = False
            middle_name = validated_data.pop('middle_name', '')
            user = User.objects.create_user(**validated_data)
            profile = UserProfile.objects.create(user=user, middle_name=middle_name, activation_token=str(uuid.uuid4()))

            cashier_group, _ = Group.objects.get_or_create(name="cashier")
            user.groups.add(cashier_group)

            user.save()

            activation_link = f"{settings.FRONTEND_URL}/setAccount?token={profile.activation_token}"

            try:
                send_activation_template_email(
                    recipient_email=user.email,
                    cashier_name=user.first_name or user.username,
                    activation_url=activation_link,
                )
            except Exception:
                raise serializers.ValidationError({
                    'email': 'Failed to send activation email via Resend. Check template IDs and sender settings.'
                })

            return user
    

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'street', 'barangay', 'province', 'zip_code', 'description']
        read_only_fields = ['user']


class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    locations = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'groups', 'is_staff', 'is_active', 'locations']
        read_only_fields = ['id', 'username', 'groups', 'is_staff']

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['id', 'user', 'otp', 'is_valid']
        read_only_fields = fields
