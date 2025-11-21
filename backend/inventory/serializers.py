from django.db import transaction
from rest_framework import serializers
from .models import (Transaction, Ingredient)
from decimal import Decimal
from rest_framework.serializers import ValidationError

class TransactionSerializer(serializers.ModelSerializer):
    ingredient_id = serializers.IntegerField()
    
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'expiration_date', 'remaining_amount', 'created_at', 'ingredient_id']
        extra_kwargs = {
            'ingredient': {'read_only': True}
        }
        
    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Amount must be greater then zero")
        return value
        

class TransactionCreateSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True)
    
    def create(self, validated_data):
        transactions_data = validated_data['transactions']
        
        created_transactions = []
        
        with transaction.atomic():
            for item in transactions_data:
                ingredient = Ingredient.objects.get(id=item['ingredient_id'])
                amount = item['amount']
                transaction_type = item['transaction_type']
                
                
                if transaction_type == 'in':
                    # if transaction is IN, create a transaction object, add the amount, then save
                    transaction_object = Transaction.objects.create(
                        ingredient=ingredient,
                        amount=amount,
                        remaining_amount=amount,
                        transaction_type=transaction_type,
                        expiration_date=item.get("expiration_date")
                    )
                    ingredient.total_stock += amount
                    ingredient.save()
                    created_transactions.append(transaction_object)
                    
                else:
                    # if out, get out_count, then get all the batches which has out
                    out_count = amount
                    batches = ingredient.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'created_at')
                    
                    for batch in batches:
                        if out_count <= 0:
                            break
                        
                        if batch.remaining_amount > out_count:
                            batch.remaining_amount -= out_count
                            batch.save()
                            out_count = Decimal("0")
                        else:
                            out_count -= batch.remaining_amount
                            batch.remaining_amount = Decimal("0")
                            batch.save()
                            
                    if out_count > 0:
                        raise ValidationError(f"Not enough stock for: {ingredient.name}")
                    
                    transaction_object = Transaction.objects.create(
                        ingredient=ingredient,
                        amount=amount,
                        remaining_amount=Decimal("0"),
                        transaction_type="out"
                    )
                    
                    ingredient.total_stock -= amount
                    
                    ingredient.save()
                    created_transactions.append(transaction_object)
                
        return TransactionSerializer(created_transactions, many=True).data
        
        
class IngredientBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'expiration_date', 'created_at', 'remaining_amount']
        
        
class IngredientSerializer(serializers.ModelSerializer):
    batches = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'total_stock', 'batches']
        
    def get_batches(self, obj):
        queryset = obj.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'created_at')
        
        return IngredientBatchSerializer(queryset, many=True).data