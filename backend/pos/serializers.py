from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Discount, Category, Product, ProductSize,
    Transaction, TransactionItem, BusinessSettings
)

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'name', 'rate']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'size', 'price']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset = Category.objects.all(),
        source='category',
        write_only=True
    )
    # remove read only
    sizes = ProductSizeSerializer(many=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_id',
            'image', 'is_archived', 'sizes'
        ]
        
    # add create function for bulk creation
    def create(self, validated_data):
        print(validated_data)
        # get data from api call. expects ex: sizes: [{size: 'XL', price: '150'},...]
        sizes_data = validated_data.pop('sizes', [])
        # create new product if data is validated, destructure keyword arguments
        product = Product.objects.create(**validated_data)
        
        for size in sizes_data:
            ProductSize.objects.create(product=product, **size)
            
        return product
        
    # add update function for bulk creation
    def update(self, instance, validated_data):
        sizes_data = validated_data.pop('sizes', None)
        instance = super().update(instance, validated_data)
        
        # If PATCH didn’t include `sizes`: leave them unchanged
        if sizes_data is None:
            return instance
        
        # get all existing sizes in current object
        existing_sizes = {size.id: size for size in instance.sizes.all()}
        # prepare array for the currently sent items
        sent_ids = []
        
        for size_item in sizes_data:
            # get ids in the sent size_item
            size_id = size_item.get('id')
            
            # if there's a size_id in sent request and that size_id exist in 
            # current sizes
            if size_id and size_id in existing_sizes:
                # get the object
                size_obj = existing_sizes[size_id]
                
                # quick hand adjust the size object
                for attr, value in size_item.items():
                    setattr(size_obj, attr, value)
                size_obj.save()
                
                # add the size id in the array
                sent_ids.append(size_id)
            else:
                # if there's no size_id in existing sizes, create new one
                ProductSize.objects.create(product=instance, **size_item)

        # for loop through all existing sizes, getting the size id and object (attr)
        for size_id, size_obj in existing_sizes.items():
            # if the current size is not in the sent ids, assume that it has been deleted
            if size_id not in sent_ids:
                size_obj.delete()
                
        return instance
                

class TransactionItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_size = ProductSizeSerializer(read_only=True)
    
    class Meta:
        model = TransactionItem
        fields = ['id', 'product', 'product_size', 'quantity']


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
            'gross_total', 'discount_amount', 'net_total', 'paid_amount', 'change', 'order_type',
        ]
   

class TransactionItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = ['product', 'product_size', 'quantity']


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