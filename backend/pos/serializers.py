from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Discount, Size, Category, Product, ProductSize,
    Transaction, TransactionItem
)

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'name', 'rate']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'short']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductSizeSerializer(serializers.ModelSerializer):
    size = SizeSerializer(read_only=True)
    
    class Meta:
        model = ProductSize
        fields = ['id', 'size', 'price']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category',
            'image_path', 'is_archived', 'sizes'
        ]


class TransactionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_size = ProductSizeSerializer(read_only=True)
    
    class Meta:
        model = TransactionItem
        fields = ['id', 'product', 'product_size', 'quantity', 'price']


class TransactionSerializer(serializers.ModelSerializer):
    cashier = UserSerializer(read_only=True)
    discount = DiscountSerializer(read_only=True)
    transaction_items = TransactionItemSerializer(many=True, read_only=True)
    
    gross_total = serializers.ReadOnlyField()
    discount_amount = serializers.ReadOnlyField()
    net_total = serializers.ReadOnlyField()
    change = serializers.ReadOnlyField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'cashier', 'discount', 'is_void', 
            'payment_method', 'created_at', 'transaction_items',
            'gross_total', 'discount_amount', 'net_total', 'paid_amount', 'change'
        ]
   

class TransactionItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = ['product', 'product_size', 'quantity', 'price']
        extra_kwargs = {
            'product_size': {'required': False, 'allow_null': True},
        }


class TransactionCreateSerializer(serializers.ModelSerializer):
    transaction_items = TransactionItemCreateSerializer(many=True)
    
    class Meta:
        model = Transaction
        fields = ['discount', 'payment_method', 'transaction_items', 'is_void', 'paid_amount']
        extra_kwargs = {
            "discount": {"required": False, "allow_null": True},
        }
        
        
    def create(self, validated_data):
        items_data = validated_data.pop('transaction_items')
        validated_data['cashier'] = self.context['request'].user
        transaction = Transaction.objects.create(**validated_data)
        
        for item in items_data:
            TransactionItem.objects.create(transaction=transaction, **item)
            
        return transaction