from rest_framework import serializers, validators
from django.contrib.auth.models import User, Group
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from email_templates import send_activation_template_email
from rest_framework import status
from rest_framework.response import Response
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

MIN_CREDENTIAL_LENGTH = 8


def validate_username_password_rules(
    username,
    password,
    *,
    enforce_min_length=True,
    enforce_similarity=True,
):
    cleaned_username = str(username or '').strip()
    cleaned_password = str(password or '').strip()
    errors = {}

    has_username = username is not None
    has_password = password is not None

    if enforce_min_length and has_username and len(cleaned_username) < MIN_CREDENTIAL_LENGTH:
        errors['username'] = [f'Username must be at least {MIN_CREDENTIAL_LENGTH} characters.']

    if enforce_min_length and has_password and len(cleaned_password) < MIN_CREDENTIAL_LENGTH:
        errors['password'] = [f'Password must be at least {MIN_CREDENTIAL_LENGTH} characters.']

    if (
        enforce_similarity
        and has_username
        and has_password
        and cleaned_username
        and cleaned_password
        and cleaned_username.lower() == cleaned_password.lower()
    ):
        errors.setdefault('password', []).append('Password should not be similar to the username.')

    if errors:
        raise serializers.ValidationError(errors)


def normalize_phone_number(value):
    return str(value or '').replace(' ', '').replace('-', '').strip()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Login should authenticate existing credentials as-is, including legacy short usernames/passwords.
        validate_username_password_rules(
            attrs.get('username'),
            attrs.get('password'),
            enforce_min_length=False,
            enforce_similarity=False,
        )

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
        if self.instance is None:
            validate_username_password_rules(attrs.get('username'), attrs.get('password'))
            return attrs

        if 'username' in attrs:
            validate_username_password_rules(
                attrs.get('username'),
                None,
                enforce_min_length=True,
                enforce_similarity=False,
            )

        if 'password' in attrs:
            validate_username_password_rules(
                None,
                attrs.get('password'),
                enforce_min_length=True,
                enforce_similarity=False,
            )

        if 'username' in attrs and 'password' in attrs:
            validate_username_password_rules(
                attrs.get('username'),
                attrs.get('password'),
                enforce_min_length=False,
                enforce_similarity=True,
            )

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
            return obj.profile.middle_name or ''
        except (AttributeError, UserProfile.DoesNotExist):
            return ''


class CustomerRegistrationSerializer(serializers.ModelSerializer):
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
    middle_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = User
        fields = ['first_name', 'middle_name', 'last_name', 'email', 'username', 'password', 'phone_number']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        validate_username_password_rules(attrs.get('username'), attrs.get('password'))
        return attrs

    def validate_phone_number(self, value):
        normalized = normalize_phone_number(value)
        return normalized

    def create(self, validated_data):
        middle_name = validated_data.pop('middle_name', '')
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(**validated_data)

        customer_group, _ = Group.objects.get_or_create(name="customer")
        user.groups.add(customer_group)

        UserProfile.objects.create(
            user=user,
            middle_name=str(middle_name or '').strip(),
            phone_number=phone_number or None,
        )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    middle_name = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=150, write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20, write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'middle_name', 'last_name', 'email', 'username', 'phone_number']
        
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

    def validate_phone_number(self, value):
        normalized = normalize_phone_number(value)
        return normalized

    def update(self, instance, validated_data):
        middle_name = validated_data.pop('middle_name', serializers.empty)
        phone_number = validated_data.pop('phone_number', serializers.empty)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if middle_name is not serializers.empty or phone_number is not serializers.empty:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            updated_fields = []

            if middle_name is not serializers.empty:
                profile.middle_name = (middle_name or '').strip()
                updated_fields.append('middle_name')

            if phone_number is not serializers.empty:
                profile.phone_number = normalize_phone_number(phone_number) or None
                updated_fields.append('phone_number')

            if updated_fields:
                profile.save(update_fields=updated_fields)

        return instance
    

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
        validated_data['is_active'] = False
        middle_name = validated_data.pop('middle_name', '')
        email = validated_data.pop('email', '')
        user = User.objects.create_user(**validated_data)
        profile = UserProfile.objects.create(user=user, middle_name=middle_name, activation_token=str(uuid.uuid4()))

        cashier_group, _ = Group.objects.get_or_create(name="cashier")
        user.groups.add(cashier_group)

        user.save()

        activation_link = f"{settings.FRONTEND_URL}/setAccount?token={profile.activation_token}"

        try:
            send_activation_template_email(
                recipient_email=user.email,
                cashier_name=user.username,
                activation_url=activation_link,
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
    
        return user
    

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'street', 'barangay', 'province', 'zip_code', 'description']
        read_only_fields = ['user']


class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    locations = AddressSerializer(many=True, read_only=True)
    middle_name = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'middle_name', 'last_name', 'email', 'username', 'phone_number', 'groups', 'is_staff', 'is_active', 'locations']
        read_only_fields = ['id', 'username', 'groups', 'is_staff']

    def get_middle_name(self, obj):
        try:
            return obj.profile.middle_name or ''
        except UserProfile.DoesNotExist:
            return ''

    def get_phone_number(self, obj):
        try:
            return obj.profile.phone_number or ''
        except UserProfile.DoesNotExist:
            return ''

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['id', 'user', 'otp', 'is_valid']
        read_only_fields = fields
