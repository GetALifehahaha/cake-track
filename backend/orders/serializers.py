from rest_framework import serializers
from .models import (Order, CakeOrder, CupcakeOrder, OrderImage, Cake, BlockedDate, OpeningTime)
from payment.models import Payment
from inventory.serializers import RecipeSerializer
from inventory.models import Recipe, RecipeIngredient
from decimal import Decimal

        
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
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    
    order_images = OrderImageSerializer(many=True, read_only=True)
    
    uploaded_images = serializers.ListField(
        child=serializers.CharField(max_length=500),
        write_only=True,
        required=False
    )
    premade_items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    payments = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'comments', 'image', 'order_images', 'uploaded_images', 
            'created_at', 'status', 'reject_reason', 'cake_orders', 'cupcake_orders', 
            'updated_at', 'due_date', 'pickup_time', 'full_name', 'email', 'phone_number', 'address', 'reference_number',
            'cancellation_requested', 'cancellation_requested_at', 'refund_reference_number',
            'hidden_by_customer', 'hidden_by_customer_at',
            'recipe', 'recipe_details', 'premade_items', 'total_price', 'ingredients_deducted_at', 'payments'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'customer',
            'cancellation_requested',
            'cancellation_requested_at',
            'refund_reference_number',
            'hidden_by_customer',
            'hidden_by_customer_at',
        ]

    def validate_reference_number(self, value):
        if value in (None, ''):
            return value

        normalized_value = ''.join(ch for ch in str(value) if ch.isdigit())
        if len(normalized_value) < 13 or len(normalized_value) > 15:
            raise serializers.ValidationError('Reference number must be 13 to 15 digits.')

        return normalized_value

    def _create_premade_recipe(self, order, premade_items):
        ingredient_totals = {}

        for item in premade_items:
            cake_id = item.get('cake_id')
            quantity = item.get('quantity', 1)

            if not cake_id:
                raise serializers.ValidationError({'premade_items': 'Each item must include cake_id.'})

            if quantity is None or int(quantity) < 1:
                raise serializers.ValidationError({'premade_items': 'Quantity must be at least 1.'})

            try:
                cake = Cake.objects.select_related('recipe').get(id=cake_id)
            except Cake.DoesNotExist as error:
                raise serializers.ValidationError({'premade_items': f'Cake ID {cake_id} does not exist.'}) from error


            for recipe_item in cake.recipe.recipe_ingredients.select_related('ingredient').all():
                ingredient_id = recipe_item.ingredient_id
                amount_needed = Decimal(str(recipe_item.amount_needed)) * Decimal(str(quantity))
                ingredient_totals[ingredient_id] = ingredient_totals.get(ingredient_id, Decimal('0')) + amount_needed

        if not ingredient_totals:
            return None

        recipe = Recipe.objects.create(
            name=f'Temporary recipe - {order.id}',
            instructions=f'Auto-generated from premade cakes for order {order.id}',
            is_temporary=True,
        )

        for ingredient_id, amount_needed in ingredient_totals.items():
            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient_id=ingredient_id,
                amount_needed=amount_needed,
            )

        return recipe

    def get_payments(self, obj):
        payment_qs = Payment.objects.filter(orders=obj).order_by('created_at')
        return [
            {
                'id': payment.id,
                'amount': str(payment.amount),
                'status': payment.status,
                'payment_type': payment.payment_type,
                'created_at': payment.created_at,
                'gateway_transaction_id': payment.gateway_transaction_id,
            }
            for payment in payment_qs
        ]
        
        
    def create(self, validated_data):
        # Prevent clients from setting status on creation — always use model default ('unpaid')
        validated_data.pop('status', None)
        
        cake_data = validated_data.pop('cake_orders')
        cupcake_data = validated_data.pop('cupcake_orders', None)
        recipe = validated_data.pop('recipe', None)
        premade_items = validated_data.pop('premade_items', [])
        # Extract the list of image URLs
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        order = Order.objects.create(**validated_data, recipe=recipe)
        
        CakeOrder.objects.create(order=order, **cake_data)
            
        if cupcake_data:
            CupcakeOrder.objects.create(order=order, **cupcake_data)
            
        for url in uploaded_images:
            OrderImage.objects.create(order=order, image_url=url)

        if recipe is None and premade_items:
            generated_recipe = self._create_premade_recipe(order, premade_items)
            if generated_recipe is not None:
                order.recipe = generated_recipe
                order.save(update_fields=['recipe'])
            
        return order

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', None)

        updated_order = super().update(instance, validated_data)

        if uploaded_images is not None:
            updated_order.order_images.all().delete()
            for url in uploaded_images:
                OrderImage.objects.create(order=updated_order, image_url=url)

            updated_order.image = uploaded_images[0] if len(uploaded_images) > 0 else None
            updated_order.save(update_fields=['image'])

        return updated_order
    
    
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
    total_revenue_generated = serializers.FloatField()
 

class CakeSerializer(serializers.ModelSerializer):
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), required=False, allow_null=True)
    recipe_available = serializers.SerializerMethodField()

    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Cake.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A cake with this name already exists.")

        return normalized_name

    class Meta:
        model = Cake
        fields = [
            "id",
            "name",
            "price",
            "image",
            "recipe",
            "recipe_details",
            "recipe_available",
            "created_at",
            "updated_at",
            "is_archived"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_recipe_available(self, obj):
        if obj.recipe is None:
            return True

        return obj.recipe.is_available()


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


class OpeningTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningTime
        fields = ['id', 'start_time', 'end_time', 'open_days']
