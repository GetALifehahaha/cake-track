from rest_framework import serializers
from .models import (Order, CakeOrder, CupcakeOrder)

        
class CakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeOrder
        fields = ['id','occassion', 'shape', 'cake_tier', 'base_flavor', 'finish', 'filling', 'coating_color', 'border', 'border_color', 'toppings', 'addons', 'message_type', 'message']
        

class CupcakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CupcakeOrder
        fields = ['id', 'amount', 'frosting']
        
        
class OrderSerializer(serializers.ModelSerializer):
    cake_orders = CakeOrderSerializer()
    cupcake_orders = CupcakeOrderSerializer(required=False)
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'comments', 'image', 'created_at', 'status', 'reject_reason', 'cake_orders', 'cupcake_orders', 'due_date',
                  'full_name', 'email', 'phone_number', 'address']
        read_only_fields = ['id', 'created_at', 'customer']
        
        
    def create(self, validated_data):
        cake_data = validated_data.pop('cake_orders')
        cupcake_data = validated_data.pop('cupcake_orders', None)
        
        order = Order.objects.create(**validated_data)
        
        CakeOrder.objects.create(order=order, **cake_data)
            
        if cupcake_data:
            CupcakeOrder.objects.create(order=order, **cupcake_data)
            
        return order