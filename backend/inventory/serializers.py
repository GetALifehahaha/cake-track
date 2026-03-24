from datetime import date

from django.db import transaction, models
from rest_framework import serializers
from .models import (Recipe, Transaction, Ingredient, RecipeIngredient, Unit, IngredientUnitConversion )
from decimal import Decimal
from rest_framework.serializers import ValidationError
from django.utils import timezone

from .conversions import get_unit_conversion_factor
from .services import deduct_ingredient_totals, deduct_ingredient_stock

class UnitSerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Unit.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A unit with this name already exists.")

        return normalized_name

    def validate_multiplier_to_reference(self, value):
        if value <= 0:
            raise serializers.ValidationError("Multiplier must be greater than zero.")
        return value

    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation', 'dimension', 'multiplier_to_reference']

class TransactionSerializer(serializers.ModelSerializer):
    ingredient_id = serializers.IntegerField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'transaction_type', 'expiration_date', 'remaining_amount',
            'purchase_date', 'ingredient_id', 'unit_purchase_price', 'cost_amount', 'reason'
        ]
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
                reason = item.get("reason")
                unit_purchase_price = item.get("unit_purchase_price")

                if unit_purchase_price in [None, '']:
                    unit_purchase_price = None

                if transaction_type == 'out' and not reason:
                    raise ValidationError({"reason": "Reason is required for manual stock out."})
                
                
                if transaction_type == 'in':
                    # if transaction is IN, create a transaction object, add the amount, then save
                    transaction_object = Transaction.objects.create(
                        ingredient=ingredient,
                        amount=amount,
                        remaining_amount=amount,
                        transaction_type=transaction_type,
                        expiration_date=item.get("expiration_date"),
                        purchase_date=purchase_date,
                        unit_purchase_price=unit_purchase_price,
                        cost_amount=(Decimal(str(amount)) * Decimal(str(unit_purchase_price))) if unit_purchase_price is not None else None,
                        reason=reason,
                    )
                    ingredient.total_stock += amount
                    ingredient.save()
                    created_transactions.append(transaction_object)
                    
                else:
                    # if out, get out_count, then get all the batches which has out
                    transaction_object = deduct_ingredient_stock(
                        ingredient=ingredient,
                        amount=Decimal(str(amount)),
                        purchase_date=purchase_date,
                        reason=reason,
                    )
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


class IngredientUnitConversionSerializer(serializers.ModelSerializer):
    from_unit = UnitSerializer(read_only=True)
    from_unit_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Unit.objects.all(),
        source='from_unit'
    )

    class Meta:
        model = IngredientUnitConversion
        fields = ['id', 'from_unit', 'from_unit_id', 'multiplier_to_base']

    def validate_multiplier_to_base(self, value):
        if value <= 0:
            raise serializers.ValidationError("Multiplier to base must be greater than zero.")
        return value
        
        
class IngredientSerializer(serializers.ModelSerializer):
    batches = serializers.SerializerMethodField()
    unit = UnitSerializer(read_only=True)
    conversions = IngredientUnitConversionSerializer(many=True, required=False)
    unit_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Unit.objects.all(),
        source="unit"
    )

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'unit_id', 'total_stock', 'batches', 'conversions']

    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Ingredient.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("An ingredient with this name already exists.")

        return normalized_name

    def _validate_conversions_data(self, base_unit, conversions_data):
        seen_from_units = set()

        for conversion in conversions_data:
            from_unit = conversion['from_unit']

            if from_unit.id == base_unit.id:
                raise serializers.ValidationError("Conversion source unit cannot be the same as the ingredient base unit.")

            if from_unit.id in seen_from_units:
                raise serializers.ValidationError("Duplicate conversion units are not allowed for the same ingredient.")

            seen_from_units.add(from_unit.id)

    def validate(self, attrs):
        if self.instance is None:
            request = self.context.get("request")
            data = request.data if request else {}

            amount = data.get("amount")
            purchase_date = data.get("purchaseDate")
            expiration_date = data.get("expirationDate")

            if amount is None or Decimal(str(amount)) <= 0:
                raise serializers.ValidationError({"amount": "Initial amount must be greater than zero."})

            if not purchase_date:
                raise serializers.ValidationError({"purchaseDate": "Purchase date is required."})

            if not expiration_date:
                raise serializers.ValidationError({"expirationDate": "Expiration date is required."})

            try:
                parsed_purchase = date.fromisoformat(str(purchase_date))
                parsed_expiration = date.fromisoformat(str(expiration_date))
            except ValueError as error:
                raise serializers.ValidationError({"dates": "Invalid date format. Use YYYY-MM-DD."}) from error

            if parsed_expiration < parsed_purchase:
                raise serializers.ValidationError({"expirationDate": "Expiration date cannot be earlier than purchase date."})

        base_unit = attrs.get('unit', self.instance.unit if self.instance else None)
        conversions_data = attrs.get('conversions', None)

        if base_unit and conversions_data is not None:
            self._validate_conversions_data(base_unit, conversions_data)

        return attrs
        
    def get_batches(self, obj):
        queryset = obj.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'purchase_date')
        
        return IngredientBatchSerializer(queryset, many=True).data
    
    def create(self, validated_data):
        """
        Create Ingredient and automatically create first batch.
        """
        conversions_data = validated_data.pop('conversions', [])

        # Extract fields passed from frontend
        request = self.context.get("request")
        data = request.data

        amount = data.get("amount")
        purchase_date = data.get("purchaseDate")
        expiration_date = data.get("expirationDate")

        # 1. Create Ingredient
        ingredient = Ingredient.objects.create(**validated_data)

        for conversion in conversions_data:
            IngredientUnitConversion.objects.create(
                ingredient=ingredient,
                from_unit=conversion['from_unit'],
                multiplier_to_base=conversion['multiplier_to_base']
            )

        # 2. Create first batch (Transaction)
        Transaction.objects.create(
            ingredient=ingredient,
            amount=amount,
            remaining_amount=amount,      # First batch: full stock is remaining
            transaction_type='in',
            purchase_date=purchase_date,
            expiration_date=expiration_date,
            reason='Initial stock in',
        )

        # 3. Update ingredient total_stock
        ingredient.total_stock = ingredient.transactions.filter(
            transaction_type='in'
        ).aggregate(models.Sum('remaining_amount'))['remaining_amount__sum'] or 0
        ingredient.save()

        return ingredient

    def update(self, instance, validated_data):
        conversions_data = validated_data.pop('conversions', None)

        old_unit = instance.unit
        new_unit = validated_data.get('unit', instance.unit)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            unit_changed = old_unit.id != new_unit.id

            if unit_changed:
                conversion_factor = get_unit_conversion_factor(old_unit, new_unit, ingredient=instance)

                instance.total_stock = Decimal(str(instance.total_stock)) * conversion_factor

            instance.save()

            if unit_changed:
                for transaction_item in instance.transactions.all():
                    transaction_item.amount = Decimal(str(transaction_item.amount)) * conversion_factor
                    transaction_item.remaining_amount = Decimal(str(transaction_item.remaining_amount)) * conversion_factor
                    transaction_item.save(update_fields=['amount', 'remaining_amount'])

                for recipe_ingredient in RecipeIngredient.objects.filter(ingredient=instance):
                    recipe_ingredient.amount_needed = Decimal(str(recipe_ingredient.amount_needed)) * conversion_factor
                    recipe_ingredient.save(update_fields=['amount_needed'])

                for conversion in instance.conversions.all():
                    conversion.multiplier_to_base = Decimal(str(conversion.multiplier_to_base)) * conversion_factor
                    conversion.save(update_fields=['multiplier_to_base'])

            if conversions_data is not None:
                instance.conversions.all().delete()

                for conversion in conversions_data:
                    IngredientUnitConversion.objects.create(
                        ingredient=instance,
                        from_unit=conversion['from_unit'],
                        multiplier_to_base=conversion['multiplier_to_base']
                    )

        return instance
    
    
class RecipeIngredientSerializer(serializers.ModelSerializer):
    """
    Used when viewing a recipe to see what's inside it.
    """
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit.abbreviation', read_only=True)
    ingredient_stock = serializers.DecimalField(source='ingredient.total_stock', max_digits=14, decimal_places=4, read_only=True)
    is_missing = serializers.SerializerMethodField()
    ingredient_id = serializers.IntegerField()
    ingredient_unit_id = serializers.IntegerField(source='ingredient.unit.id', read_only=True)
    ingredient_units = serializers.SerializerMethodField()
    input_unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient_id', 'ingredient_name', 'amount_needed', 'ingredient_unit', 'ingredient_unit_id', 'ingredient_units', 'ingredient_stock', 'is_missing', 'input_unit_id']

    def get_is_missing(self, obj):
        return obj.ingredient.total_stock < obj.amount_needed

    def get_ingredient_units(self, obj):
        base_unit = obj.ingredient.unit
        units = [
            {
                'id': base_unit.id,
                'name': base_unit.name,
                'abbreviation': base_unit.abbreviation,
                'dimension': base_unit.dimension,
                'multiplier_to_base': 1,
            }
        ]

        for conversion in obj.ingredient.conversions.select_related('from_unit').all():
            unit = conversion.from_unit
            units.append(
                {
                    'id': unit.id,
                    'name': unit.name,
                    'abbreviation': unit.abbreviation,
                    'dimension': unit.dimension,
                    'multiplier_to_base': conversion.multiplier_to_base,
                }
            )

        return units

    def validate(self, attrs):
        ingredient_id = attrs.get('ingredient_id')
        amount_needed = attrs.get('amount_needed')
        input_unit = attrs.get('input_unit_id')

        if amount_needed is not None and Decimal(str(amount_needed)) <= 0:
            raise serializers.ValidationError({"amount_needed": "Amount needed must be greater than zero."})

        if ingredient_id is None:
            return attrs

        ingredient = Ingredient.objects.filter(id=ingredient_id).first()
        if ingredient is None:
            raise serializers.ValidationError({"ingredient_id": "Ingredient does not exist."})

        selected_unit = input_unit or ingredient.unit

        if selected_unit.id == ingredient.unit.id:
            return attrs

        try:
            get_unit_conversion_factor(selected_unit, ingredient.unit, ingredient=ingredient)
        except ValidationError as error:
            raise serializers.ValidationError(
                {"input_unit_id": f"No conversion rule found for {ingredient.name}: {selected_unit.name} -> {ingredient.unit.name}."}
            ) from error

        return attrs
        


class RecipeOrderInputSerializer(serializers.Serializer):
    """Simple input validator for the list of recipes"""
    recipe_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    
    
class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(source='recipe_ingredients', many=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'ingredients', 'image', 'instructions', 'is_available', 'is_temporary']
        
    def create(self, validated_data):
        ingredients_data = validated_data.pop('recipe_ingredients')
        
        recipe = Recipe.objects.create(**validated_data)
        
        for item in ingredients_data:
            ingredient = Ingredient.objects.get(id=item['ingredient_id'])
            input_unit = item.get('input_unit_id') or ingredient.unit
            amount_needed = Decimal(str(item['amount_needed']))
            conversion_factor = get_unit_conversion_factor(input_unit, ingredient.unit, ingredient=ingredient)

            RecipeIngredient.objects.create(
                recipe=recipe, 
                ingredient_id=item['ingredient_id'],
                amount_needed=amount_needed * conversion_factor
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
                ingredient = Ingredient.objects.get(id=ingredient_id)
                input_unit = item.get('input_unit_id') or ingredient.unit
                amount_needed = Decimal(str(item['amount_needed']))
                conversion_factor = get_unit_conversion_factor(input_unit, ingredient.unit, ingredient=ingredient)
                normalized_amount_needed = amount_needed * conversion_factor

                if ingredient_id in existing_ingredients:
                    recipe_ingredient = existing_ingredients[ingredient_id]
                    recipe_ingredient.amount_needed = normalized_amount_needed
                    recipe_ingredient.save()
                else:
                    RecipeIngredient.objects.create(
                        recipe=instance,
                        ingredient_id=ingredient_id,
                        amount_needed=normalized_amount_needed
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
            created_transactions = deduct_ingredient_totals(ingredient_totals=ingredient_totals)

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
            'created_at',
            'ingredient_name', 
            'unit_abbreviation', 
            'amount', 
            'transaction_type', 
            'remaining_amount', 
            'purchase_date', 
            'expiration_date',
            'unit_purchase_price',
            'cost_amount',
            'reason',
        ]