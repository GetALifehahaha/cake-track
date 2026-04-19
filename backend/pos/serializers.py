from rest_framework import serializers
from users.serializers import UserSerializer
from rest_framework.exceptions import ValidationError
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from .models import (
    Discount, Category, Product, ProductVariant,
    Transaction, TransactionItem, BusinessSettings, RegisterMoney, RegisterDeduction, RegisterTransaction,
    Discount, DiscountUsage
)
from decimal import Decimal
from inventory.models import Recipe
from inventory.serializers import RecipeSerializer
from inventory.models import Ingredient
from inventory.services import deduct_ingredient_totals


def _get_or_create_register_money(cashier):
    register_money, _ = RegisterMoney.objects.get_or_create(cashier=cashier)
    return register_money


def _apply_completed_transaction_to_register(transaction_obj):
    if transaction_obj.is_register_counted:
        return

    if transaction_obj.is_void or not transaction_obj.is_completed:
        return

    if transaction_obj.cashier is None:
        return

    register_money = RegisterMoney.objects.select_for_update().filter(cashier=transaction_obj.cashier).first()
    if not register_money:
        register_money = RegisterMoney.objects.create(cashier=transaction_obj.cashier)

    register_money.current_amount = register_money.current_amount + transaction_obj.net_total
    register_money.save(update_fields=['current_amount', 'updated_at'])

    transaction_obj.is_register_counted = True
    transaction_obj.save(update_fields=['is_register_counted'])


class DiscountSerializer(serializers.ModelSerializer):
    usage_percentage = serializers.SerializerMethodField()

    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        source="category",
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Discount
        fields = [
            "id", "name", "discount_type", "value", "scope",
            "products", "categories", "start_date", "end_date",
            "min_order_total", "usage_limit", "usage_type", "used_count", "usage_percentage", "active"
        ]
        read_only_fields = ["used_count", "usage_percentage"]

    def get_usage_percentage(self, obj):
        usage_limit = obj.usage_limit
        if not usage_limit or usage_limit <= 0:
            return None

        return round((obj.used_count / usage_limit) * 100, 2)

    def validate(self, attrs):
        discount_type = attrs.get("discount_type", getattr(self.instance, "discount_type", None))
        value = attrs.get("value", getattr(self.instance, "value", None))
        scope = attrs.get("scope", getattr(self.instance, "scope", None))
        min_order_total = attrs.get("min_order_total", getattr(self.instance, "min_order_total", Decimal("0.00")))
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))

        if self.instance:
            selected_products = attrs.get("products", self.instance.products.all())
            selected_categories = attrs.get("category", self.instance.category.all())
        else:
            selected_products = attrs.get("products")
            selected_categories = attrs.get("category")

        if value is not None and value <= 0:
            raise serializers.ValidationError({"value": "Discount value must be greater than 0."})

        if discount_type == "percentage" and value is not None and value > 100:
            raise serializers.ValidationError({"value": "Percentage discount cannot exceed 100."})

        if min_order_total is not None and min_order_total < 0:
            raise serializers.ValidationError({"min_order_total": "Minimum order total cannot be negative."})

        if scope == 'selected_products' and not selected_products:
            raise serializers.ValidationError({"products": "Select at least one product for selected product scope."})

        if scope == 'selected_category' and not selected_categories:
            raise serializers.ValidationError({"categories": "Select at least one category for selected category scope."})

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({"end_date": "End date cannot be earlier than start date."})

        return attrs


class DiscountUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountUsage
        fields = [
            "id", "discount", "transaction", "products", 
            "amount", "created_at", "discount_snapshot"
        ]
        read_only_fields = ["amount", "created_at"]

    def create(self, validated_data):
        discount = validated_data.get("discount")

        if discount:
            validated_data["discount_snapshot"] = {
                "id": discount.id,
                "name": discount.name,
                "type": discount.discount_type,
                "value": str(discount.value),
            }

        return super().create(validated_data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if not instance.discount and instance.discount_snapshot:
            data["discount"] = instance.discount_snapshot

        return data


class CategorySerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Category.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A category with this name already exists.")

        return normalized_name

    class Meta:
        model = Category
        fields = ['id', 'name', 'is_disabled']


class ProductAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']
        read_only_fields = fields


class ProductVariantSerializer(serializers.ModelSerializer):
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), required=False, allow_null=True)
    recipe_available = serializers.SerializerMethodField()

    def validate(self, attrs):
        has_recipe = attrs.get('has_recipe', self.instance.has_recipe if self.instance else False)
        recipe = attrs.get('recipe', self.instance.recipe if self.instance else None)

        if 'has_recipe' not in attrs:
            attrs['has_recipe'] = recipe is not None
        elif has_recipe and recipe is None:
            raise serializers.ValidationError({'recipe': 'Recipe is required when Has Recipe is enabled.'})

        if recipe is None:
            attrs['has_recipe'] = False

        return attrs

    def get_recipe_available(self, obj):
        if not obj.has_recipe:
            return True

        if obj.recipe is None:
            return False

        return obj.recipe.is_available()

    class Meta:
        model = ProductVariant
        fields = ['id', 'label', 'price', 'has_recipe', 'recipe', 'recipe_details', 'recipe_available']


class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(
        many=True,
        read_only=True
    )

    category_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        write_only=True,
        source="categories"
    )

    variants = ProductVariantSerializer(many=True)
    recipe_available = serializers.SerializerMethodField()
    top_seller_rank = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description',
            'categories', 'category_ids',
            'image', 'is_archived', 'variants', 'has_recipe', 'recipe_available', 'top_seller_rank'
        ]

    def get_recipe_available(self, obj):
        recipe_variants = [variant for variant in obj.variants.all() if variant.has_recipe]

        if not recipe_variants:
            return True

        for variant in recipe_variants:
            if variant.recipe is None or not variant.recipe.is_available():
                return False

        return True

    def get_top_seller_rank(self, obj):
        rank = getattr(obj, 'top_seller_rank', None)

        try:
            parsed_rank = int(rank)
        except (TypeError, ValueError):
            return None

        if 1 <= parsed_rank <= 3:
            return parsed_rank

        return None

    def create(self, validated_data):
        categories = validated_data.pop("categories", [])
        variants_data = validated_data.pop("variants", [])

        product = Product.objects.create(**validated_data)

        product.categories.set(categories)

        has_recipe = False
        for variant_data in variants_data:
            has_recipe = has_recipe or bool(variant_data.get('recipe'))
            ProductVariant.objects.create(product=product, **variant_data)

        if product.has_recipe != has_recipe:
            product.has_recipe = has_recipe
            product.save(update_fields=['has_recipe'])

        return product

    def update(self, instance, validated_data):
        categories = validated_data.pop("categories", None)
        variants_data = validated_data.pop("variants", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        if variants_data is not None:
            instance.variants.all().delete()
            has_recipe = False
            for variant_data in variants_data:
                has_recipe = has_recipe or bool(variant_data.get('recipe'))
                ProductVariant.objects.create(product=instance, **variant_data)

            instance.has_recipe = has_recipe
            instance.save(update_fields=['has_recipe'])

        return instance

                
class ProductBatchUnarchiveSerializer(serializers.Serializer):

    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

    def validate(self, attrs):
        product_ids = attrs["product_ids"]
        existing_id = Product.objects.filter(id__in=product_ids).count()

        if existing_id != len(set(product_ids)):
            raise serializers.ValidationError("One or more ID is invalid!")
        
        return attrs
    
    def save(self):
        product_ids = self.validated_data["product_ids"]

        return Product.objects.filter(id__in=product_ids).update(
            is_archived=False
        )



class TransactionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = TransactionItem
        fields = ['id', 'product', 'product_variant', 'quantity']


class TransactionSerializer(serializers.ModelSerializer):
    cashier = UserSerializer(read_only=True)
    discount = DiscountSerializer(read_only=True)
    discount_snapshot = serializers.SerializerMethodField()
    transaction_items = TransactionItemSerializer(many=True, read_only=True)
    order_number = serializers.IntegerField(source='sequence_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'order_number', 'cashier', 'discount', 'discount_snapshot', 'is_void', 
            'payment_method', 'created_at', 'transaction_items',
            'gross_total', 'discount_amount', 'net_total', 'paid_amount', 'change', 'order_type',
            'is_completed', 'customer_name', 'payment_reference_number', 'completed_at', 'is_register_counted',
        ]

    def get_discount_snapshot(self, obj):
        # Get the discount snapshot from the related DiscountUsage record
        usage = obj.discount_usages.first() 
        return usage.discount_snapshot if usage else None
   

class TransactionItemCreateSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        product = attrs.get('product')
        product_variant = attrs.get('product_variant')

        if product and product_variant and product_variant.product_id != product.id:
            raise serializers.ValidationError(
                {'product_variant': 'Selected variant does not belong to selected product.'}
            )

        return attrs

    class Meta:
        model = TransactionItem
        fields = ['product', 'product_variant', 'quantity']


class TransactionCreateSerializer(serializers.ModelSerializer):
    transaction_items = TransactionItemCreateSerializer(many=True)
    
    class Meta:
        model = Transaction
        fields = [
            'discount',
            'payment_method',
            'transaction_items',
            'is_void',
            'paid_amount',
            'order_type',
            'is_completed',
            'customer_name',
            'payment_reference_number',
        ]
        extra_kwargs = {
            "discount": {"required": False, "allow_null": True},
            "is_completed": {"required": False},
            "customer_name": {"required": False, "allow_null": True, "allow_blank": True},
            "payment_reference_number": {"required": False, "allow_null": True, "allow_blank": True},
        }
        
    def create(self, validated_data):
        items_data = validated_data.pop('transaction_items')
        discount_input = validated_data.pop('discount', None)
        
        discount_input = discount_input if discount_input != -1 else None

        paid_amount = validated_data.get('paid_amount', Decimal('0.00'))
        payment_method = validated_data.get('payment_method', 'cash')
        payment_reference_number = str(validated_data.get('payment_reference_number') or '').strip()
        is_void = validated_data.pop('is_void', False)
        is_completed = validated_data.pop('is_completed', False)

        if str(payment_method).lower() == 'gcash' and not getattr(settings, 'POS_GCASH_ENABLED', False):
            raise ValidationError({"payment_method": "GCash POS payments are temporarily disabled."})

        if payment_method == 'gcash':
            if not payment_reference_number:
                raise ValidationError({"payment_reference_number": "Reference number is required for GCash payments."})
            validated_data['payment_reference_number'] = payment_reference_number
        else:
            validated_data['payment_reference_number'] = None

        if is_void:
            is_completed = True
        
        validated_data['cashier'] = self.context['request'].user

        ingredient_totals = {}

        # Collect recipe names for ingredient deduction tracking
        recipe_names = set()
        
        for item in items_data:
            product_variant = item['product_variant']
            quantity = Decimal(str(item['quantity']))

            if not product_variant or not product_variant.recipe_id:
                continue

            recipe_names.add(product_variant.recipe.name)
            
            for recipe_item in product_variant.recipe.recipe_ingredients.select_related('ingredient').all():
                ingredient_id = recipe_item.ingredient_id
                amount_needed = Decimal(str(recipe_item.amount_needed)) * quantity
                ingredient_totals[ingredient_id] = ingredient_totals.get(ingredient_id, Decimal('0')) + amount_needed

        with transaction.atomic():
            locked_ingredients = {}

            if not is_void and ingredient_totals:
                ingredient_ids = sorted(int(ingredient_id) for ingredient_id in ingredient_totals.keys())
                locked_ingredients = {
                    ingredient.id: ingredient
                    for ingredient in Ingredient.objects.select_for_update().filter(id__in=ingredient_ids).order_by('id')
                }

                stock_errors = []

                for ingredient_id in ingredient_ids:
                    ingredient = locked_ingredients.get(ingredient_id)
                    amount_needed = Decimal(str(ingredient_totals.get(ingredient_id, Decimal('0'))))

                    if ingredient is None:
                        stock_errors.append(f"Ingredient #{ingredient_id} no longer exists.")
                        continue

                    if ingredient.total_stock < amount_needed:
                        stock_errors.append(
                            f"Not enough {ingredient.name}. Need {amount_needed}, Have {ingredient.total_stock}"
                        )

                if stock_errors:
                    raise ValidationError({
                        'detail': 'Insufficient ingredient stock for one or more items.',
                        'error_code': 'insufficient_ingredient_stock',
                        'transaction_items': stock_errors,
                    })

            gross_total = sum(
                Decimal(str(item['product_variant'].price)) * item['quantity'] 
                for item in items_data
            )

            discount_amount = Decimal('0.00')
            locked_discount = None
            discountable_total = Decimal('0.00')
            eligible_discount_items = []
            usage_increment = 0

            if discount_input:
                locked_discount = Discount.objects.select_for_update().get(id=discount_input.id)

                if not locked_discount.is_valid():
                    raise ValidationError({"discount": "This discount is invalid, expired, or has reached its usage limit."})

                if gross_total < locked_discount.min_order_total:
                    raise ValidationError({"discount": f"A minimum order total of {locked_discount.min_order_total} is required."})

                # Isolate the total of items eligible for the discount
                if locked_discount.scope == 'all_products':
                    eligible_discount_items = list(items_data)

                elif locked_discount.scope == 'selected_products':
                    valid_product_ids = set(locked_discount.products.values_list('id', flat=True))
                    eligible_discount_items = [
                        item for item in items_data if item['product'].id in valid_product_ids
                    ]

                elif locked_discount.scope == 'selected_category':
                    valid_category_ids = set(locked_discount.categories.values_list('id', flat=True))

                    def _matches_selected_category(product_obj):
                        product_category_ids = set(product_obj.categories.values_list('id', flat=True))
                        return bool(product_category_ids & valid_category_ids)

                    eligible_discount_items = [
                        item for item in items_data if _matches_selected_category(item['product'])
                    ]

                discountable_total = sum(
                    Decimal(str(item['product_variant'].price)) * item['quantity']
                    for item in eligible_discount_items
                )

                # Apply math only if there are eligible items
                if discountable_total > Decimal('0.00'):
                    usage_increment = (
                        sum(int(item['quantity']) for item in eligible_discount_items)
                        if locked_discount.usage_type == 'per_product'
                        else 1
                    )

                    if locked_discount.usage_limit is not None:
                        remaining_usage = max(locked_discount.usage_limit - locked_discount.used_count, 0)
                        if usage_increment > remaining_usage:
                            if locked_discount.usage_type == 'per_product':
                                raise ValidationError(
                                    {"discount": f"Only {remaining_usage} product usage(s) remaining for this discount."}
                                )

                            raise ValidationError({"discount": "Discount usage limit has been reached."})

                    if locked_discount.discount_type == 'percentage':
                        discount_amount = discountable_total * (locked_discount.value / Decimal('100.00'))
                    elif locked_discount.discount_type == 'fixed':
                        discount_amount = locked_discount.value

                    # Cap the discount so it doesn't exceed the eligible items' total
                    if discount_amount > discountable_total:
                        discount_amount = discountable_total

            net_total = gross_total - discount_amount
            change = paid_amount - net_total

            if change < Decimal('0.00') and not is_void and is_completed:
                raise ValidationError({"paid_amount": "The paid amount is less than the net total."})

            completed_at = timezone.now() if is_completed else None

            transaction_obj = Transaction.objects.create(
                gross_total=gross_total,
                discount_amount=discount_amount,
                net_total=net_total,
                change=change,
                discount=locked_discount,
                is_void=is_void,
                is_completed=is_completed,
                completed_at=completed_at,
                **validated_data
            )

            if not transaction_obj.is_void and (
                not transaction_obj.sequence_date or not transaction_obj.sequence_number
            ):
                transaction_obj._assign_sequence()
                transaction_obj.save(update_fields=['sequence_date', 'sequence_number'])

            eligible_variant_ids = {
                item['product_variant'].id for item in eligible_discount_items
            }

            for item in items_data:
                item_price = Decimal(str(item['product_variant'].price))
                item_total = item_price * item['quantity']
                item_discount = Decimal('0.00')

                is_eligible = bool(locked_discount and item['product_variant'].id in eligible_variant_ids)

                if is_eligible and discountable_total > Decimal('0.00'):
                    proportion = item_total / discountable_total
                    item_discount = round(proportion * discount_amount, 2)

                TransactionItem.objects.create(
                    transaction=transaction_obj,
                    price_at_time=item_price,
                    discount_amount=item_discount,
                    **item
                )

            if locked_discount and discount_amount > Decimal('0.00'):
                usage_record = DiscountUsage.objects.create(
                    discount=locked_discount,
                    transaction=transaction_obj,
                    amount=discount_amount,
                    discount_snapshot={
                        "id": locked_discount.id,
                        "name": locked_discount.name,
                        "type": locked_discount.discount_type,
                        "value": str(locked_discount.value),
                        "scope": locked_discount.scope,
                        "usage_type": locked_discount.usage_type,
                        "usage_increment": usage_increment,
                        "min_order_total": str(locked_discount.min_order_total),
                    }
                )
                
                # Optional: Record exactly which products triggered the discount
                if locked_discount.scope in ['selected_products', 'selected_category']:
                    usage_record.products.set({item['product'].id for item in eligible_discount_items})
                
                locked_discount.used_count += usage_increment
                locked_discount.save(update_fields=['used_count'])

            if not is_void and ingredient_totals:
                reason_parts = [f"Transaction #{transaction_obj.id}"]
                if recipe_names:
                    reason_parts.insert(0, f"Recipes: {', '.join(sorted(recipe_names))}")
                reason = " | ".join(reason_parts)

                try:
                    deduct_ingredient_totals(
                        ingredient_totals=ingredient_totals,
                        purchase_date=timezone.now().date(),
                        reason=reason,
                        exclude_expired=True,
                        locked_ingredients=locked_ingredients,
                    )
                except ValidationError as error:
                    error_detail = getattr(error, 'detail', None)
                    stock_errors = []

                    if isinstance(error_detail, dict):
                        transaction_item_errors = error_detail.get('transaction_items')
                        if isinstance(transaction_item_errors, list):
                            stock_errors = [str(item) for item in transaction_item_errors if str(item)]

                        detail_value = error_detail.get('detail')
                        if not stock_errors and detail_value:
                            stock_errors = [str(detail_value)]
                    elif isinstance(error_detail, list):
                        stock_errors = [str(item) for item in error_detail if str(item)]
                    elif error_detail:
                        stock_errors = [str(error_detail)]

                    if not stock_errors:
                        stock_errors = ['One or more ingredients are no longer available.']

                    raise ValidationError({
                        'detail': 'Insufficient ingredient stock for one or more items.',
                        'error_code': 'insufficient_ingredient_stock',
                        'transaction_items': stock_errors,
                    })

            if transaction_obj.is_completed and not transaction_obj.is_void:
                _apply_completed_transaction_to_register(transaction_obj)

        return transaction_obj


class GCashInitiateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal('0.01'))


class GCashVerifySerializer(serializers.Serializer):
    source_id = serializers.CharField(max_length=255)


class TransactionCompleteSerializer(serializers.Serializer):
    def validate(self, attrs):
        transaction = self.instance

        if transaction.is_void:
            raise serializers.ValidationError({"detail": "Void transactions cannot be completed."})

        if transaction.is_completed:
            raise serializers.ValidationError({"detail": "Transaction is already completed."})

        return attrs

    def update(self, instance, validated_data):
        with transaction.atomic():
            locked_instance = Transaction.objects.select_for_update().get(pk=instance.pk)

            if locked_instance.is_void:
                raise serializers.ValidationError({"detail": "Void transactions cannot be completed."})

            if locked_instance.is_completed:
                raise serializers.ValidationError({"detail": "Transaction is already completed."})

            locked_instance.is_completed = True
            locked_instance.completed_at = timezone.now()
            update_fields = ['is_completed', 'completed_at']

            if not locked_instance.is_void and (
                not locked_instance.sequence_date or not locked_instance.sequence_number
            ):
                locked_instance._assign_sequence()
                update_fields.extend(['sequence_date', 'sequence_number'])

            locked_instance.save(update_fields=update_fields)

            _apply_completed_transaction_to_register(locked_instance)

        return locked_instance


class TransactionBatchCompleteSerializer(serializers.Serializer):
    transaction_ids = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )

    def validate_transaction_ids(self, value):
        unique_ids = []
        seen = set()

        for transaction_id in value:
            cleaned_id = str(transaction_id or '').strip()
            if not cleaned_id:
                raise serializers.ValidationError('Transaction IDs cannot be blank.')

            if cleaned_id in seen:
                continue

            seen.add(cleaned_id)
            unique_ids.append(cleaned_id)

        if not unique_ids:
            raise serializers.ValidationError('Provide at least one transaction ID.')

        return unique_ids


class RegisterMoneySerializer(serializers.ModelSerializer):
    cashier = UserSerializer(read_only=True)
    total_deductions = serializers.SerializerMethodField()

    class Meta:
        model = RegisterMoney
        fields = [
            'id',
            'cashier',
            'starting_money',
            'current_amount',
            'started_at',
            'updated_at',
            'total_deductions',
        ]
        read_only_fields = fields

    def get_total_deductions(self, obj):
        total = obj.deductions.aggregate(total=Sum('amount'))['total']
        return total or Decimal('0.00')


class RegisterMoneySetStartingSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=11, decimal_places=2, min_value=Decimal('0.00'))


class RegisterDeductionSerializer(serializers.ModelSerializer):
    cashier = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = RegisterDeduction
        fields = ['id', 'cashier', 'amount', 'note', 'created_by', 'created_at']
        read_only_fields = fields


class RegisterDeductionCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=11, decimal_places=2, min_value=Decimal('0.01'))
    note = serializers.CharField(required=True, allow_blank=False, max_length=255, trim_whitespace=True)


class RegisterTransactionSerializer(serializers.ModelSerializer):
    cashier = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = RegisterTransaction
        fields = ['id', 'entry_type', 'amount', 'note', 'cashier', 'created_by', 'created_at']
        read_only_fields = fields
    
class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSettings
        fields = [
            'business_name',
            'address',
            'tin',
            'contact_number',
            'message',
            'gcash_owner_name',
            'gcash_owner_number',
            'secret_pin',
        ]
        
        
class DashboardMetricsSerializer(serializers.Serializer):
    total_void_amount = serializers.IntegerField()
    total_successful_transactions = serializers.IntegerField()
    total_products_sold = serializers.IntegerField()
    avg_daily_transactions = serializers.FloatField()
    total_revenue_generated = serializers.FloatField() 
    total_discount_amount = serializers.FloatField()
    total_vat_amount = serializers.FloatField()
    order_paid_revenue = serializers.FloatField()
    total_combined_revenue = serializers.FloatField()
    total_capital = serializers.FloatField()
    total_profit = serializers.FloatField()
    top_selling_products = serializers.ListField(
        child=serializers.DictField()
    )
    least_selling_products = serializers.ListField(
        child=serializers.DictField()
    )
    sales_trend = serializers.ListField(
        child=serializers.DictField()
    )
    revenue_trend = serializers.ListField(
        child=serializers.DictField()
    )
    cashier_performance = serializers.ListField()