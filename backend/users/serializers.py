from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import OTP
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
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
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['is_active'] = False
        user = User.objects.create_user(**validated_data)

        cashier, _ = Group.objects.get_or_create(name="cashier")
        user.groups.add(cashier)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # 4. Build the activation link and send the email
        # Adjust frontend_url to match your React application's URL
        frontend_url = settings.FRONTEND_URL
        activation_link = f"{frontend_url}setAccount?uid={uid}&token={token}"

        subject = 'Activate Your Cashier Account'
        message = f'Hi {user.first_name},\n\nAn admin has created a cashier account for you. Please click the link below to activate your account:\n{activation_link}'
        
        response = send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        print(response)

        return user
        

class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'groups', 'is_staff', 'is_active']
        read_only_fields = ['id', 'username', 'groups', 'is_staff']

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['id', 'user', 'otp', 'is_valid']
        read_only_fields = fields
