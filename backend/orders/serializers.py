from rest_framework import serializers
from .models import (Order, CakeOrder, CupcakeOrder)

        
class CakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeOrder
        fields = ['id','occasion', 'shape', 'cake_tier', 'base_flavor', 'filling', 'coating_color', 'border', 'border_color', 'toppings', 'addons', 'message_type', 'message']
        

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
    
    
class OrderBatchUpdateSerializer(serializers.Serializer):
    
    # GET all the IDs of the batch PATCH update 
    order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    
    # prepare the new statuses
    status = serializers.ChoiceField(choices=['accepted', 'rejected'])
    
    # reason if new status is request
    reject_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['status'] == "rejected":
            if not data.get('reject_reason'):
                raise serializers.ValidationError({
                    'reject_reason': "This field is required when rejecting orders"
                })
                
        if data['status'] == "accepted":
            data['reject_reason'] = ""
            
        return data
    
