from rest_framework import serializers
from django.contrib.auth.models import User, Group

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

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        cashier, _ = Group.objects.get_or_create(name="cashier")
        user.groups.add(cashier)

        return user
        

class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'groups', 'is_staff', 'is_active']
        read_only_fields = ['id', 'username', 'groups', 'is_staff']