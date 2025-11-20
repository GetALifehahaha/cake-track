from rest_framework import serializers
from django.contrib.auth.models import User, Group

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            cashier, _ = Group.objects.get_or_create(name="cashier")
            user.groups.add(cashier)
            
            return user
        

class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'groups']
        read_only_fields = ['__all__']