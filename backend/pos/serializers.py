from rest_framework import serializers
from users.serializers import UserSerializer
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import (
    Discount, Category, Product, ProductVariant,
    Transaction, TransactionItem, BusinessSettings,
    Discount, DiscountUsage
)
from decimal import Decimal


class DiscountSerializer(serializers.ModelSerializer):
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
            "min_order_total", "usage_limit", "used_count", "active"
        ]
        read_only_fields = ["used_count"]


class DiscountUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountUsage
        fields = [
            "id", "discount", "transaction", "products", 
            "amount", "created_at"
        ]
        read_only_fields = ["amount", "created_at"]


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
    class Meta:
        model = ProductVariant
        fields = ['id', 'label', 'price']


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

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description',
            'categories', 'category_ids',
            'image', 'is_archived', 'variants'
        ]

    def create(self, validated_data):
        categories = validated_data.pop("categories", [])
        variants_data = validated_data.pop("variants", [])

        product = Product.objects.create(**validated_data)

        product.categories.set(categories)

        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)

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
            for variant_data in variants_data:
                ProductVariant.objects.create(product=instance, **variant_data)

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
    transaction_items = TransactionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'cashier', 'discount', 'is_void', 
            'payment_method', 'created_at', 'transaction_items',
            'gross_total', 'discount_amount', 'net_total', 'paid_amount', 'change', 'order_type',
        ]
   

class TransactionItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = ['product', 'product_variant', 'quantity']


class TransactionCreateSerializer(serializers.ModelSerializer):
    transaction_items = TransactionItemCreateSerializer(many=True)
    
    class Meta:
        model = Transaction
        fields = ['discount', 'payment_method', 'transaction_items', 'is_void', 'paid_amount', 'order_type']
        extra_kwargs = {
            "discount": {"required": False, "allow_null": True},
        }
        
    def create(self, validated_data):
        items_data = validated_data.pop('transaction_items')
        discount_input = validated_data.pop('discount', None)
        paid_amount = validated_data.get('paid_amount', Decimal('0.00'))
        
        validated_data['cashier'] = self.context['request'].user

        with transaction.atomic():
            gross_total = sum(
                Decimal(str(item['product_variant'].price)) * item['quantity'] 
                for item in items_data
            )

            discount_amount = Decimal('0.00')
            locked_discount = None

            if discount_input:
                locked_discount = Discount.objects.select_for_update().get(id=discount_input.id)

                if not locked_discount.is_valid():
                    raise ValidationError({"discount": "This discount is invalid, expired, or has reached its usage limit."})

                if gross_total < locked_discount.min_order_total:
                    raise ValidationError({"discount": f"A minimum order total of {locked_discount.min_order_total} is required."})

                # Isolate the total of items eligible for the discount
                discountable_total = Decimal('0.00')

                if locked_discount.scope == 'all_products':
                    discountable_total = gross_total

                elif locked_discount.scope == 'selected_products':
                    valid_product_ids = set(locked_discount.products.values_list('id', flat=True))
                    discountable_total = sum(
                        Decimal(str(item['product_variant'].price)) * item['quantity']
                        for item in items_data if item['product'].id in valid_product_ids
                    )

                elif locked_discount.scope == 'selected_category':
                    valid_category_ids = set(locked_discount.categories.values_list('id', flat=True))
                    discountable_total = sum(
                        Decimal(str(item['product_variant'].price)) * item['quantity']
                        for item in items_data if item['product'].category_id in valid_category_ids
                    )

                # Apply math only if there are eligible items
                if discountable_total > Decimal('0.00'):
                    if locked_discount.discount_type == 'percentage':
                        discount_amount = discountable_total * (locked_discount.value / Decimal('100.00'))
                    elif locked_discount.discount_type == 'fixed':
                        discount_amount = locked_discount.value

                    # Cap the discount so it doesn't exceed the eligible items' total
                    if discount_amount > discountable_total:
                        discount_amount = discountable_total

            net_total = gross_total - discount_amount
            change = paid_amount - net_total

            if change < Decimal('0.00'):
                raise ValidationError({"paid_amount": "The paid amount is less than the net total."})

            transaction_obj = Transaction.objects.create(
                gross_total=gross_total,
                discount_amount=discount_amount,
                net_total=net_total,
                change=change,
                discount=locked_discount,
                **validated_data
            )

            for item in items_data:
                item_price = Decimal(str(item['product_variant'].price))
                item_total = item_price * item['quantity']
                item_discount = Decimal('0.00')

                is_eligible = False
                
                if locked_discount:
                    if locked_discount.scope == 'all_products':
                        is_eligible = True
                    elif locked_discount.scope == 'selected_products' and item['product'].id in valid_product_ids:
                        is_eligible = True
                    elif locked_discount.scope == 'selected_category' and item['product'].category_id in valid_category_ids:
                        is_eligible = True

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
                    amount=discount_amount
                )
                
                # Optional: Record exactly which products triggered the discount
                if locked_discount.scope in ['selected_products', 'selected_category']:
                    eligible_products = [
                        item['product'] for item in items_data 
                        if (locked_discount.scope == 'selected_products' and item['product'].id in valid_product_ids) or 
                           (locked_discount.scope == 'selected_category' and item['product'].category_id in valid_category_ids)
                    ]
                    usage_record.products.set(eligible_products)
                
                locked_discount.used_count += 1
                locked_discount.save(update_fields=['used_count'])

        return transaction_obj
    
class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSettings
        fields = ['business_name', 'address', 'tin', 'contact_number', 'message', 'secret_pin']
        
        
class DashboardMetricsSerializer(serializers.Serializer):
    total_void_amount = serializers.IntegerField()
    total_successful_transactions = serializers.IntegerField()
    total_products_sold = serializers.IntegerField()
    avg_daily_transactions = serializers.FloatField()
    total_revenue_generated = serializers.FloatField() 
    top_selling_products = serializers.ListField(
        child=serializers.DictField()
    )
    sales_trend = serializers.ListField(
        child=serializers.DictField()
    )
    revenue_trend = serializers.ListField(
        child=serializers.DictField()
    )
    cashier_performance = serializers.ListField()