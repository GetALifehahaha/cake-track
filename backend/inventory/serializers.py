from django.db import transaction, models
from rest_framework import serializers
from .models import (Recipe, Transaction, Ingredient, RecipeIngredient, Unit )
from decimal import Decimal
from rest_framework.serializers import ValidationError
from datetime import timezone

class UnitSerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Unit.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A unit with this name already exists.")

        return normalized_name

    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation']

class TransactionSerializer(serializers.ModelSerializer):
    ingredient_id = serializers.IntegerField()
    
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'expiration_date', 'remaining_amount', 'purchase_date', 'ingredient_id']
        extra_kwargs = {
            'ingredient': {'read_only': True}
        }
        
    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Amount must be greater then zero")
        return value
        

class TransactionCreateSerializer(serializers.Serializer):
    transactions = serializers.ListField(child=serializers.DictField())
    
    # class Meta:
    #     model = Transaction
    #     fields = ['transactions']
    
    def create(self, validated_data):
        transactions_data = validated_data['transactions']
        created_transactions = []
        
        with transaction.atomic():
            for item in transactions_data:
                ingredient = Ingredient.objects.get(id=item['ingredient_id'])
                amount = item['amount']
                transaction_type = item['transaction_type']
                purchase_date = item.get("purchase_date") or timezone.now().date()
                
                
                if transaction_type == 'in':
                    # if transaction is IN, create a transaction object, add the amount, then save
                    transaction_object = Transaction.objects.create(
                        ingredient=ingredient,
                        amount=amount,
                        remaining_amount=amount,
                        transaction_type=transaction_type,
                        expiration_date=item.get("expiration_date"),
                        purchase_date=purchase_date
                    )
                    ingredient.total_stock += amount
                    ingredient.save()
                    created_transactions.append(transaction_object)
                    
                else:
                    # if out, get out_count, then get all the batches which has out
                    out_count = amount
                    batches = ingredient.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'purchase_date')
                    
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
                        transaction_type="out",
                        purchase_date=purchase_date
                    )
                    
                    ingredient.total_stock -= amount
                    
                    ingredient.save()
                    created_transactions.append(transaction_object)
                
        return {'transactions': created_transactions}
    
    def to_representation(self, instance):
        # Serialize the created transactions using TransactionSerializer
        return {
            'transactions': TransactionSerializer(instance['transactions'], many=True).data
        }
        
        
class IngredientBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'expiration_date', 'purchase_date', 'remaining_amount']
        
        
class IngredientSerializer(serializers.ModelSerializer):
    batches = serializers.SerializerMethodField()
    unit = UnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Unit.objects.all(),
        source="unit"
    )

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'unit_id', 'total_stock', 'batches']

    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Ingredient.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("An ingredient with this name already exists.")

        return normalized_name
        
    def get_batches(self, obj):
        queryset = obj.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'purchase_date')
        
        return IngredientBatchSerializer(queryset, many=True).data
    
    def create(self, validated_data):
        """
        Create Ingredient and automatically create first batch.
        """
        # Extract fields passed from frontend
        request = self.context.get("request")
        data = request.data

        amount = data.get("amount")
        purchase_date = data.get("purchaseDate")
        expiration_date = data.get("expirationDate")

        # 1. Create Ingredient
        ingredient = Ingredient.objects.create(**validated_data)

        # 2. Create first batch (Transaction)
        Transaction.objects.create(
            ingredient=ingredient,
            amount=amount,
            remaining_amount=amount,      # First batch: full stock is remaining
            transaction_type='in',
            purchase_date=purchase_date,
            expiration_date=expiration_date,
        )

        # 3. Update ingredient total_stock
        ingredient.total_stock = ingredient.transactions.filter(
            transaction_type='in'
        ).aggregate(models.Sum('remaining_amount'))['remaining_amount__sum'] or 0
        ingredient.save()

        return ingredient
    
    
class RecipeIngredientSerializer(serializers.ModelSerializer):
    """
    Used when viewing a recipe to see what's inside it.
    """
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit.abbreviation', read_only=True)
    ingredient_stock = serializers.DecimalField(source='ingredient.total_stock', max_digits=11, decimal_places=2, read_only=True)
    is_missing = serializers.SerializerMethodField()
    ingredient_id = serializers.IntegerField()

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient_id', 'ingredient_name', 'amount_needed', 'ingredient_unit', 'ingredient_stock', 'is_missing']

    def get_is_missing(self, obj):
        return obj.ingredient.total_stock < obj.amount_needed
        


class RecipeOrderInputSerializer(serializers.Serializer):
    """Simple input validator for the list of recipes"""
    recipe_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    
    
class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(source='recipe_ingredients', many=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'ingredients', 'image', 'instructions', 'is_available']
        
    def create(self, validated_data):
        ingredients_data = validated_data.pop('recipe_ingredients')
        
        recipe = Recipe.objects.create(**validated_data)
        
        for item in ingredients_data:
            RecipeIngredient.objects.create(
                recipe=recipe, 
                ingredient_id=item['ingredient_id'],
                amount_needed=item['amount_needed']
            )
        return recipe
    
    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('recipe_ingredients', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ingredients_data is not None:
            existing_ingredients = {item.ingredient_id: item for item in instance.recipe_ingredients.all()}
            incoming_ingredient_ids = [item['ingredient_id'] for item in ingredients_data]

            for ingredient_id, recipe_ingredient in existing_ingredients.items():
                if ingredient_id not in incoming_ingredient_ids:
                    recipe_ingredient.delete()

            for item in ingredients_data:
                ingredient_id = item['ingredient_id']
                amount_needed = item['amount_needed']

                if ingredient_id in existing_ingredients:
                    recipe_ingredient = existing_ingredients[ingredient_id]
                    recipe_ingredient.amount_needed = amount_needed
                    recipe_ingredient.save()
                else:
                    RecipeIngredient.objects.create(
                        recipe=instance,
                        ingredient_id=ingredient_id,
                        amount_needed=amount_needed
                    )

        return instance


class BulkRecipeCookSerializer(serializers.Serializer):
    orders = RecipeOrderInputSerializer(many=True)

    def validate(self, data):
        """
        1. Calculate TOTAL ingredients needed for the entire batch of recipes.
        2. Check if enough TOTAL stock exists before starting any DB operations.
        """
        orders = data.get('orders', [])
        
        # Dictionary to aggregate totals: { ingredient_id: Decimal('amount_needed') }
        ingredient_totals = {}
        
        # 1. Aggregation Phase
        for order in orders:
            try:
                recipe = Recipe.objects.get(id=order['recipe_id'])
            except Recipe.DoesNotExist:
                raise ValidationError(f"Recipe ID {order['recipe_id']} not found.")

            qty = Decimal(order['quantity'])
            
            # Efficiently fetch ingredients
            # Assuming related_name='recipe_ingredients' based on standard practice
            for ri in recipe.recipe_ingredients.all():
                ing_id = ri.ingredient.id
                needed = ri.amount_needed * qty
                
                if ing_id in ingredient_totals:
                    ingredient_totals[ing_id] += needed
                else:
                    ingredient_totals[ing_id] = needed

        # 2. Validation Phase (Check Global Stock)
        errors = []
        for ing_id, amount_needed in ingredient_totals.items():
            ingredient = Ingredient.objects.get(id=ing_id)
            if ingredient.total_stock < amount_needed:
                errors.append(f"Not enough {ingredient.name}. Need {amount_needed}, Have {ingredient.total_stock}")
        
        if errors:
            raise ValidationError(errors)

        # Store the calculated totals in context to reuse in create()
        self.context['ingredient_totals'] = ingredient_totals
        return data

    def create(self, validated_data):
        """
        Performs the FIFO/FEFO deduction logic you defined in your 
        TransactionCreateSerializer, but applied to the aggregated ingredients.
        """
        ingredient_totals = self.context['ingredient_totals']
        created_transactions = []

        with transaction.atomic():
            for ing_id, total_amount_needed in ingredient_totals.items():
                ingredient = Ingredient.objects.get(id=ing_id)
                
                out_count = total_amount_needed
                
                batches = ingredient.transactions.filter(
                    transaction_type='in', 
                    remaining_amount__gt=0
                ).order_by('expiration_date', 'purchase_date')

                for batch in batches:
                    if out_count <= 0:
                        break

                    if batch.remaining_amount > out_count:
                        # Batch has enough to cover the rest
                        batch.remaining_amount -= out_count
                        batch.save()
                        out_count = Decimal("0")
                    else:
                        # Drain this batch and continue to next
                        out_count -= batch.remaining_amount
                        batch.remaining_amount = Decimal("0")
                        batch.save()

                # Double check logic (should be caught by validate, but safe to keep)
                if out_count > 0:
                     raise ValidationError(f"Data integrity error: Stock mismatch for {ingredient.name}")

                # Create the OUT transaction record
                transaction_object = Transaction.objects.create(
                    ingredient=ingredient,
                    amount=total_amount_needed,
                    remaining_amount=Decimal("0"),
                    transaction_type="out"
                    # Note: We don't usually set expiration_date on OUT transactions
                )
                
                # Update main stock
                ingredient.total_stock -= total_amount_needed
                ingredient.save()
                
                created_transactions.append(transaction_object)

        return {
            'status': 'success',
            'transactions_created': len(created_transactions),
            'orders_processed': len(validated_data['orders'])
        }
        
    
class DashboardSummarySerializer(serializers.Serializer):
    in_stock_count = serializers.IntegerField()
    out_of_stock_count = serializers.IntegerField()
    near_expiration_count = serializers.IntegerField()
    expired_count = serializers.IntegerField()


class TransactionHistorySerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    unit_abbreviation = serializers.CharField(source='ingredient.unit.abbreviation', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 
            'ingredient_name', 
            'unit_abbreviation', 
            'amount', 
            'transaction_type', 
            'remaining_amount', 
            'purchase_date', 
            'expiration_date'
        ]