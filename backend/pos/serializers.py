from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Discount, Category, Product, ProductVariant,
    Transaction, TransactionItem, BusinessSettings
)
from decimal import Decimal

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'name', 'rate']


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
        validated_data['cashier'] = self.context['request'].user

        gross_total = sum(
            Decimal(item['product_variant'].price) * item['quantity'] 
            for item in items_data
        )

        discount = validated_data.pop('discount', None)

        discount_amount = gross_total * discount.rate if discount else Decimal('0.00')

        net_total = gross_total - discount_amount

        change = validated_data.pop('paid_amount') - net_total

        transaction = Transaction.objects.create(
            gross_total=gross_total,
            discount_amount=discount_amount,
            net_total=net_total,
            change=change,
            **validated_data
        )

        for item in items_data:
            TransactionItem.objects.create(transaction=transaction, **item)

        return transaction
    
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
    cashier_performance = serializers.ListField()