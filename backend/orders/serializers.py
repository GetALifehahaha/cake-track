from rest_framework import serializers
from calendar import monthrange
from datetime import date, timedelta
from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from .models import (Order, CakeOrder, CupcakeOrder, OrderImage, Cake, BlockedDate, OpeningTime, OrderPremadeRecipe)
from payment.models import Payment
from inventory.serializers import RecipeSerializer
from inventory.models import Recipe, RecipeIngredient
from decimal import Decimal


def _add_months(base_date, months):
    month_index = base_date.month - 1 + months
    year = base_date.year + (month_index // 12)
    month = (month_index % 12) + 1
    day = min(base_date.day, monthrange(year, month)[1])
    return date(year, month, day)

        
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


class OrderPremadeRecipeSerializer(serializers.ModelSerializer):
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    cake_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderPremadeRecipe
        fields = ['id', 'cake', 'cake_name', 'quantity', 'recipe', 'recipe_details']
        read_only_fields = fields

    def get_cake_name(self, obj):
        return obj.cake.name if obj.cake else ''
        
        
class OrderSerializer(serializers.ModelSerializer):
    cake_orders = CakeOrderSerializer()
    cupcake_orders = CupcakeOrderSerializer(required=False)
    reference_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=32)
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    premade_recipe_details = OrderPremadeRecipeSerializer(source='premade_recipes', many=True, read_only=True)
    customer_first_name = serializers.CharField(source='customer.first_name', read_only=True)
    customer_last_name = serializers.CharField(source='customer.last_name', read_only=True)
    
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
            'id', 'customer', 'customer_first_name', 'customer_last_name', 'comments', 'image', 'order_images', 'uploaded_images', 
            'created_at', 'status', 'reject_reason', 'cake_orders', 'cupcake_orders', 
            'updated_at', 'due_date', 'pickup_time', 'full_name', 'email', 'phone_number', 'address', 'payment_method', 'reference_number',
            'cancellation_requested', 'cancellation_requested_at', 'refund_reference_number', 'refund_account_name', 'refund_account_number',
            'customer_adjustment_used', 'customer_adjustment_used_at',
            'hidden_by_customer', 'hidden_by_customer_at',
            'recipe', 'recipe_details', 'premade_recipe_details', 'premade_items', 'total_price', 'ingredients_deducted_at', 'payments'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'customer',
            'cancellation_requested',
            'cancellation_requested_at',
            'refund_reference_number',
            'refund_account_name',
            'refund_account_number',
            'customer_adjustment_used',
            'customer_adjustment_used_at',
            'hidden_by_customer',
            'hidden_by_customer_at',
        ]

    def validate_reference_number(self, value):
        if value in (None, ''):
            return None

        digits = ''.join(ch for ch in str(value) if ch.isdigit())

        if len(digits) < 8 or len(digits) > 15:
            raise serializers.ValidationError('Reference number must be 8 to 15 digits.')

        duplicate_qs = Order.objects.filter(reference_number=digits)
        if self.instance is not None:
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)

        if duplicate_qs.exists():
            raise serializers.ValidationError('Reference number has already been used. Please provide a different one.')

        return digits

    def validate(self, attrs):
        due_date = attrs.get('due_date')
        is_create = self.instance is None
        is_due_date_being_updated = 'due_date' in attrs

        if due_date and (is_create or is_due_date_being_updated):
            max_due_date = _add_months(timezone.localdate(), 3)
            if due_date > max_due_date:
                raise serializers.ValidationError(
                    {
                        'due_date': f'Pickup date cannot be more than 3 months from today ({max_due_date.isoformat()}).'
                    }
                )

        request = self.context.get('request')
        if (
            is_create
            and request
            and request.user
            and request.user.is_authenticated
            and not request.user.is_staff
            and not settings.ALLOW_MULTIPLE_ORDER
        ):
            one_hour_ago = timezone.now() - timedelta(hours=1)
            latest_recent_order = (
                Order.objects
                .filter(customer=request.user, created_at__gte=one_hour_ago)
                .only('created_at')
                .order_by('-created_at')
                .first()
            )
            if latest_recent_order:
                available_at = latest_recent_order.created_at + timedelta(hours=1)
                remaining_seconds = max(0, int((available_at - timezone.now()).total_seconds()))
                remaining_minutes = max(1, (remaining_seconds + 59) // 60)
                raise serializers.ValidationError(
                    {
                        'non_field_errors': [
                            f'You can place only one order every hour. Please try again in about {remaining_minutes} minute(s).'
                        ]
                    }
                )

        return attrs

    def _create_premade_recipes(self, order, premade_items):
        generated_links = []

        for item in premade_items:
            cake_id = item.get('cake_id')
            quantity = item.get('quantity', 1)

            if cake_id is None:
                raise serializers.ValidationError({'premade_items': 'Each item must include cake_id.'})

            try:
                cake_id = int(cake_id)
            except (TypeError, ValueError) as error:
                raise serializers.ValidationError({'premade_items': f'Invalid cake_id: {cake_id}.'}) from error

            try:
                quantity = int(quantity)
            except (TypeError, ValueError) as error:
                raise serializers.ValidationError({'premade_items': f'Invalid quantity for cake_id {cake_id}.'}) from error

            if quantity < 1:
                raise serializers.ValidationError({'premade_items': 'Quantity must be at least 1.'})

            try:
                cake = Cake.objects.select_related('recipe').get(id=cake_id)
            except Cake.DoesNotExist as error:
                raise serializers.ValidationError({'premade_items': f'Cake ID {cake_id} does not exist.'}) from error

            # If a premade cake has no attached recipe, continue with order creation.
            if cake.recipe is None:
                continue

            try:
                recipe_ingredients_qs = cake.recipe.recipe_ingredients.select_related('ingredient').all()
            except Exception:
                continue

            if not recipe_ingredients_qs.exists():
                continue

            temporary_recipe = Recipe.objects.create(
                name=f'Temporary recipe - {order.id} - {cake.name}',
                instructions=f'Auto-generated from premade cake {cake.name} for order {order.id} (qty: {quantity}).',
                is_temporary=True,
            )

            has_ingredients = False
            for recipe_item in recipe_ingredients_qs:
                amount_needed = Decimal(str(recipe_item.amount_needed)) * Decimal(str(quantity))
                if amount_needed <= 0:
                    continue

                RecipeIngredient.objects.create(
                    recipe=temporary_recipe,
                    ingredient_id=recipe_item.ingredient_id,
                    amount_needed=amount_needed,
                )
                has_ingredients = True

            if not has_ingredients:
                temporary_recipe.delete()
                continue

            generated_links.append(
                OrderPremadeRecipe.objects.create(
                    order=order,
                    cake=cake,
                    recipe=temporary_recipe,
                    quantity=quantity,
                )
            )

        return generated_links

    def _increment_cake_order_counts(self, premade_items):
        ordered_totals = {}

        for item in premade_items:
            cake_id = item.get('cake_id')
            quantity = item.get('quantity', 1)

            if cake_id is None:
                raise serializers.ValidationError({'premade_items': 'Each item must include cake_id.'})

            try:
                cake_id = int(cake_id)
            except (TypeError, ValueError) as error:
                raise serializers.ValidationError({'premade_items': f'Invalid cake_id: {cake_id}.'}) from error

            try:
                quantity = int(quantity)
            except (TypeError, ValueError) as error:
                raise serializers.ValidationError({'premade_items': f'Invalid quantity for cake_id {cake_id}.'}) from error

            if quantity < 1:
                raise serializers.ValidationError({'premade_items': 'Quantity must be at least 1.'})

            ordered_totals[cake_id] = ordered_totals.get(cake_id, 0) + quantity

        if not ordered_totals:
            return

        existing_ids = set(Cake.objects.filter(id__in=ordered_totals.keys()).values_list('id', flat=True))
        missing_ids = sorted(set(ordered_totals.keys()) - existing_ids)
        if missing_ids:
            missing_text = ', '.join(str(cake_id) for cake_id in missing_ids)
            raise serializers.ValidationError({'premade_items': f'Cake ID(s) {missing_text} do not exist.'})

        for cake_id, quantity in ordered_totals.items():
            Cake.objects.filter(id=cake_id).update(times_ordered=F('times_ordered') + quantity)

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

        with transaction.atomic():
            order = Order.objects.create(**validated_data, recipe=recipe)

            CakeOrder.objects.create(order=order, **cake_data)

            if cupcake_data:
                CupcakeOrder.objects.create(order=order, **cupcake_data)

            for url in uploaded_images:
                OrderImage.objects.create(order=order, image_url=url)

            if recipe is None and premade_items:
                generated_recipe_links = self._create_premade_recipes(order, premade_items)
                if len(generated_recipe_links) == 1:
                    order.recipe = generated_recipe_links[0].recipe
                    order.save(update_fields=['recipe'])

            if premade_items:
                self._increment_cake_order_counts(premade_items)
            
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
    status = serializers.ChoiceField(choices=['accepted', 'rejected', 'ready', 'completed'])
    
    # reason if new status is request
    reject_reason = serializers.CharField(required=False, allow_blank=True)

    def validate_order_ids(self, value):
        normalized_ids = []
        seen = set()

        for order_id in value:
            cleaned_id = str(order_id or '').strip()
            if not cleaned_id:
                raise serializers.ValidationError("Order IDs cannot be blank.")

            if cleaned_id in seen:
                continue

            seen.add(cleaned_id)
            normalized_ids.append(cleaned_id)

        if not normalized_ids:
            raise serializers.ValidationError("Provide at least one order ID.")

        return normalized_ids
    
    def validate(self, data):
        if data['status'] == "rejected":
            if not data.get('reject_reason'):
                raise serializers.ValidationError({
                    'reject_reason': "This field is required when rejecting orders"
                })
                
        if data['status'] in ["accepted", "ready", "completed"]:
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
            "times_ordered",
            "recipe",
            "recipe_details",
            "recipe_available",
            "created_at",
            "updated_at",
            "is_archived"
        ]
        read_only_fields = ["id", "times_ordered", "created_at", "updated_at"]

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
