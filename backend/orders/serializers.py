from rest_framework import serializers
from .models import (Order, CakeOrder, CupcakeOrder, OrderImage, Cake, BlockedDate, OpeningTime)

        
class CakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeOrder
        fields = ['id','occasion', 'shape', 'cake_tier', 'base_flavor', 'filling', 'coating_color', 'border', 'border_color', 'toppings', 'addons', 'message_type', 'message']
        

class CupcakeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CupcakeOrder
        fields = ['id', 'amount', 'frosting']
        
        
class OrderImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderImage
        fields = ['id', 'image_url']
        
        
class OrderSerializer(serializers.ModelSerializer):
    cake_orders = CakeOrderSerializer()
    cupcake_orders = CupcakeOrderSerializer(required=False)
    
    order_images = OrderImageSerializer(many=True, read_only=True)
    
    uploaded_images = serializers.ListField(
        child=serializers.CharField(max_length=500),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'comments', 'image', 'order_images', 'uploaded_images', 
            'created_at', 'status', 'reject_reason', 'cake_orders', 'cupcake_orders', 
            'due_date', 'pickup_time', 'full_name', 'email', 'phone_number', 'address', 'recipe'
        ]
        read_only_fields = ['id', 'created_at', 'customer']
        
        
    def create(self, validated_data):
        cake_data = validated_data.pop('cake_orders')
        cupcake_data = validated_data.pop('cupcake_orders', None)
        recipe = validated_data.pop('recipe', None)
        # Extract the list of image URLs
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        order = Order.objects.create(**validated_data, recipe=recipe)
        
        CakeOrder.objects.create(order=order, **cake_data)
            
        if cupcake_data:
            CupcakeOrder.objects.create(order=order, **cupcake_data)
            
        for url in uploaded_images:
            OrderImage.objects.create(order=order, image_url=url)
            
        return order
    
    
class OrderBatchUpdateSerializer(serializers.Serializer):
    # GET all the IDs of the batch PATCH update 
    order_ids = serializers.ListField(
        child=serializers.CharField(),
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
    

class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    rejected_orders = serializers.IntegerField()
 

class CakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cake
        fields = [
            "id",
            "name",
            "price",
            "image",
            "created_at",
            "updated_at",
            "is_archived"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CakeBatchUnarchiveSerializer(serializers.Serializer):
    cake_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

    def validate(self, attrs):
        cake_ids = attrs["cake_ids"]
        existing_id = Cake.objects.filter(id__in=cake_ids).count()

        if existing_id != len(set(cake_ids)):
            raise serializers.ValidationError("One or more ID is invalid!")
        
        return attrs
    

    def save(self):
        ids = self.validated_data['cake_ids']
        updated_count = Cake.objects.filter(id__in=ids).update(is_archived=False)
        return updated_count
    

class BlockedDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedDate
        fields = ['id', 'date']


class OpeningTimeSerializer():
    class Meta:
        model = OpeningTime
        field = '__all__'
