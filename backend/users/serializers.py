from rest_framework import serializers, validators
from django.contrib.auth.models import User, Group
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid

from .models import (
    OTP, 
    UserProfile,
    Address,
    )

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
        fields = ['first_name', 'last_name', 'email']
        
    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
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
        validated_data['is_active'] = False
        middle_name = validated_data.pop('middle_name', '')
        user = User.objects.create_user(**validated_data)
        profile = UserProfile.objects.create(user=user, middle_name=middle_name, activation_token=str(uuid.uuid4()))

        cashier_group, _ = Group.objects.get_or_create(name="cashier")
        user.groups.add(cashier_group)

        user.save()

        activation_link = f"{settings.FRONTEND_URL}/setAccount?token={profile.activation_token}"

        subject = 'Activate Your Cashier Account'
        
        # Using html_message for a better UI
        html_content = f"""
            <p>Hi {user.first_name},</p>
            <p>An admin has created a cashier account for you.</p>
            <a href="{activation_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Activate Account
            </a>
        """

        send_mail(
            subject,
            f"Activate your account: {activation_link}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_content,
            fail_silently=True
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
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'groups', 'is_staff', 'is_active', 'locations']
        read_only_fields = ['id', 'username', 'groups', 'is_staff']

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['id', 'user', 'otp', 'is_valid']
        read_only_fields = fields
