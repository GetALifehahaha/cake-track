from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Discount, Category, Product, ProductVariant,
    Transaction, TransactionItem, BusinessSettings
)
from decimal import Decimal
import json

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'name', 'rate']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'label', 'price']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset = Category.objects.all(),
        source='category',
        write_only=True
    )
    # remove read only
    variants = ProductVariantSerializer(many=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_id',
            'image', 'is_archived', 'variants'
        ]
        
    def create(self, validated_data):
        # get data from api call. expects ex: sizes: [{size: 'XL', price: '150'},...]
        variants_data = validated_data.pop('variants', [])
        # create new product if data is validated, destructure keyword arguments
        product = Product.objects.create(**validated_data)
        
        for variant in variants_data:
            ProductVariant.objects.create(product=product, **variant)
            
        return product
        
    # add update function for bulk creation
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        instance = super().update(instance, validated_data)
        
        # If PATCH didn’t include `variants`: leave them unchanged
        if variants_data is None:
            return instance
        
        # get all existing variants in current object
        existing_variants = {variant.id: variant for variant in instance.variants.all()}
        # prepare array for the currently sent items
        sent_ids = []
        
        for variant_item in variants_data:
            # get ids in the sent variant_item
            variant_id = variant_item.get('id')
            
            # if there's a variant_id in sent request and that variant_id exist in 
            # current variants
            if variant_id and variant_id in existing_variants:
                # get the object
                variant_obj = existing_variants[variant_id]
                
                # quick hand adjust the variant object
                for attr, value in variant_item.items():
                    setattr(variant_obj, attr, value)
                variant_obj.save()
                
                # add the variant id in the array
                sent_ids.append(variant_id)
            else:
                # if there's no variant_id in existing variants, create new one
                ProductVariant.objects.create(product=instance, **variant_item)

        # for loop through all existing variants, getting the variant id and object (attr)
        for variant_id, variant_obj in existing_variants.items():
            # if the current variant is not in the sent ids, assume that it has been deleted
            if variant_id not in sent_ids:
                variant_obj.delete()
                
        return instance
                

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
        fields = ['discount', 'payment_method', 'transaction_items', 'is_void', 'paid_amount']
        extra_kwargs = {
            "discount": {"required": False, "allow_null": True},
        }
        
    def create(self, validated_data):
        print(validated_data)

        items_data = validated_data.pop('transaction_items')
        validated_data['cashier'] = self.context['request'].user

        gross_total = sum(
            Decimal(item['product_variant'].price) * item['quantity'] # ! item.product_variant.price
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
        fields = ['business_name', 'address', 'tin', 'contact_number', 'message', 'logo']
        
        
class DashboardMetricsSerializer(serializers.Serializer):
    total_void_amount = serializers.IntegerField()
    total_successful_transactions = serializers.IntegerField()
    total_products_sold = serializers.IntegerField()
    avg_daily_transactions = serializers.FloatField()
    total_revenue_generated = serializers.FloatField()  # <-- New field
    top_selling_products = serializers.ListField(
        child=serializers.DictField()
    )
    sales_trend = serializers.ListField(
        child=serializers.DictField()
    )
    cashier_performance = serializers.ListField()