from datetime import date
from decimal import Decimal
import re

from django.db import transaction, models
from django.core.validators import MaxValueValidator
from rest_framework import serializers
from rest_framework.serializers import ValidationError
from django.utils import timezone

from .models import (Recipe, Transaction, Ingredient, RecipeIngredient, Unit, IngredientUnitConversion, Container, Dimension)
from .conversions import get_unit_conversion_factor
from .services import (
    deduct_ingredient_totals,
    deduct_ingredient_stock,
    get_ingredient_available_stock,
    get_available_stock_by_ingredient_ids,
)

MAX_DECIMAL_VALUE = Decimal('999999.99')
MAX_INTEGER_VALUE = 999999


def build_container_unit_name(raw_name):
    slug = re.sub(r'[^a-z0-9]+', '-', str(raw_name or '').strip().lower()).strip('-')
    if not slug:
        slug = 'container'

    return f"container::{slug}"

class UnitSerializer(serializers.ModelSerializer):
    abbreviation = serializers.CharField(source='symbol', required=False, allow_blank=True)
    dimension = serializers.CharField(source='legacy_dimension', read_only=True)
    multiplier_to_reference = serializers.DecimalField(source='to_base_factor', max_digits=18, decimal_places=8)
    is_container_unit = serializers.SerializerMethodField()

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
        fields = ['id', 'name', 'abbreviation', 'dimension', 'multiplier_to_reference', 'is_base', 'is_container_unit']

    def get_is_container_unit(self, obj):
        return hasattr(obj, 'container_definition')


class ContainerSerializer(serializers.ModelSerializer):
    unit_id = serializers.IntegerField(source='unit.id', read_only=True)

    class Meta:
        model = Container
        fields = ['id', 'name', 'symbol', 'unit_id']

    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Container.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A container with this name already exists.")

        return normalized_name

    def validate_symbol(self, value):
        normalized_symbol = (value or '').strip()

        if len(normalized_symbol) > 10:
            raise serializers.ValidationError("Container symbol must be 10 characters or less.")

        return normalized_symbol

    def _generate_unique_internal_unit_name(self, name, exclude_unit_id=None):
        base_name = build_container_unit_name(name)
        candidate = base_name
        suffix = 2

        while True:
            queryset = Unit.objects.filter(name__iexact=candidate)
            if exclude_unit_id:
                queryset = queryset.exclude(pk=exclude_unit_id)

            if not queryset.exists():
                return candidate

            candidate = f"{base_name}-{suffix}"
            suffix += 1

    def create(self, validated_data):
        name = validated_data['name']
        symbol = validated_data.get('symbol', '')

        count_dimension = Dimension.objects.get_or_create(name='count')[0]
        internal_unit_name = self._generate_unique_internal_unit_name(name)

        unit = Unit.objects.create(
            name=internal_unit_name,
            symbol=symbol,
            dimension=count_dimension,
            to_base_factor=Decimal('1'),
            is_base=False,
        )

        return Container.objects.create(
            name=name,
            symbol=symbol,
            unit=unit,
        )

    def update(self, instance, validated_data):
        new_name = validated_data.get('name', instance.name)
        new_symbol = validated_data.get('symbol', instance.symbol)

        internal_unit_name = self._generate_unique_internal_unit_name(new_name, exclude_unit_id=instance.unit_id)

        instance.unit.name = internal_unit_name
        instance.unit.symbol = new_symbol
        instance.unit.is_base = False
        instance.unit.to_base_factor = Decimal('1')
        instance.unit.save(update_fields=['name', 'symbol', 'is_base', 'to_base_factor'])

        instance.name = new_name
        instance.symbol = new_symbol
        instance.save(update_fields=['name', 'symbol'])

        return instance


class TransactionSerializer(serializers.ModelSerializer):
    ingredient_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)]
    )
    remaining_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)],
        required=False,
        allow_null=True
    )
    unit_purchase_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)],
        required=False,
        allow_null=True
    )
    cost_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)],
        required=False,
        allow_null=True
    )
    
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

    def validate(self, attrs):
        transaction_type = attrs.get('transaction_type')
        purchase_date = attrs.get('purchase_date')
        expiration_date = attrs.get('expiration_date')

        if transaction_type == 'in' and purchase_date and expiration_date and expiration_date <= purchase_date:
            raise ValidationError({"expiration_date": "Expiration date must be later than purchase date."})

        return attrs
        

class TransactionCreateSerializer(serializers.Serializer):
    transactions = serializers.ListField(child=serializers.DictField(), allow_empty=False)

    class Meta:
        model = Transaction
        fields = ['transactions']

    @staticmethod
    def _parse_date_value(value, field_name):
        if value in [None, '']:
            return None

        if isinstance(value, date):
            return value

        try:
            return date.fromisoformat(str(value))
        except ValueError as error:
            raise ValidationError({field_name: "Invalid date format. Use YYYY-MM-DD."}) from error

    def validate(self, attrs):
        transactions_data = attrs.get('transactions', [])

        for index, item in enumerate(transactions_data):
            transaction_type = item.get('transaction_type')

            if item.get('ingredient_id') in [None, '']:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Ingredient is required."
                })

            raw_amount = item.get('amount')
            if raw_amount in [None, '']:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Amount is required."
                })

            try:
                parsed_amount = Decimal(str(raw_amount))
            except Exception as error:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Amount must be a valid number."
                }) from error

            if parsed_amount <= 0:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Amount must be greater than zero."
                })

            item['amount'] = parsed_amount

            if transaction_type not in ['in', 'out']:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Transaction type must be 'in' or 'out'."
                })

            if transaction_type != 'in':
                continue

            purchase_date = self._parse_date_value(
                item.get('purchase_date') or timezone.now().date(),
                'purchase_date'
            )
            expiration_date = self._parse_date_value(item.get('expiration_date'), 'expiration_date')

            if purchase_date and expiration_date and expiration_date <= purchase_date:
                raise ValidationError({
                    'transactions': f"Transaction item #{index + 1}: Expiration date must be later than purchase date."
                })

        return attrs
    
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
                    transaction_object = deduct_ingredient_stock(
                        ingredient=ingredient,
                        amount=Decimal(str(amount)),
                        purchase_date=purchase_date,
                        reason=reason,
                    )
                    created_transactions.append(transaction_object)
                
        return {'transactions': created_transactions}
    
    def to_representation(self, instance):
        return {
            'transactions': TransactionSerializer(instance['transactions'], many=True).data
        }
        
        
class IngredientBatchSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)]
    )
    remaining_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)]
    )

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
    multiplier_to_base = serializers.DecimalField(source='factor', max_digits=18, decimal_places=8)

    class Meta:
        model = IngredientUnitConversion
        fields = ['id', 'from_unit', 'from_unit_id', 'multiplier_to_base']

    def validate_multiplier_to_base(self, value):
        if value <= 0:
            raise serializers.ValidationError("Multiplier to base must be greater than zero.")
        return value


class IngredientContainerSerializer(serializers.ModelSerializer):
    container = serializers.SerializerMethodField()
    container_id = serializers.SerializerMethodField()
    container_name = serializers.SerializerMethodField()
    container_symbol = serializers.SerializerMethodField()
    container_unit = UnitSerializer(source='from_unit', read_only=True)
    container_unit_id = serializers.IntegerField(source='from_unit.id', read_only=True)
    container_amount = serializers.DecimalField(source='factor', max_digits=18, decimal_places=8, read_only=True)

    class Meta:
        model = IngredientUnitConversion
        fields = [
            'id',
            'container',
            'container_id',
            'container_name',
            'container_symbol',
            'container_unit',
            'container_unit_id',
            'container_amount',
        ]

    def get_container(self, obj):
        container = getattr(obj, 'container', None)
        if container is None:
            return None

        return {
            'id': container.id,
            'name': container.name,
            'symbol': container.symbol,
        }

    def get_container_id(self, obj):
        container = getattr(obj, 'container', None)
        return container.id if container else None

    def get_container_name(self, obj):
        container = getattr(obj, 'container', None)
        if container:
            return container.name

        return obj.from_unit.name

    def get_container_symbol(self, obj):
        container = getattr(obj, 'container', None)
        if container and container.symbol:
            return container.symbol

        return obj.from_unit.symbol
        
        
class IngredientSerializer(serializers.ModelSerializer):
    batches = serializers.SerializerMethodField()
    unit = UnitSerializer(read_only=True)
    containers = IngredientContainerSerializer(source='conversions', many=True, read_only=True)
    conversions = IngredientUnitConversionSerializer(many=True, required=False)
    reset_stock_on_dimension_change = serializers.BooleanField(write_only=True, required=False, default=False)
    unit_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Unit.objects.all(),
        source="unit"
    )

    total_stock = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)],
        required=False
    )
    low_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)]
    )

    class Meta:
        model = Ingredient
        fields = [
            'id',
            'name',
            'unit',
            'unit_id',
            'total_stock',
            'low_amount',
            'batches',
            'containers',
            'conversions',
            'reset_stock_on_dimension_change',
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)

        containers = mutable_data.get('containers')
        has_legacy_conversions = mutable_data.get('conversions') is not None

        if containers is not None and not has_legacy_conversions:
            normalized_conversions = []

            for container in containers:
                if not isinstance(container, dict):
                    continue

                normalized_row = dict(container)

                if 'from_unit_id' not in normalized_row and 'container_id' in normalized_row:
                    container_id = normalized_row.get('container_id')

                    if container_id not in [None, '']:
                        try:
                            container_obj = Container.objects.get(pk=container_id)
                        except Container.DoesNotExist as error:
                            raise serializers.ValidationError(
                                {'containers': [f"Container with id '{container_id}' does not exist."]}
                            ) from error

                        normalized_row['from_unit_id'] = container_obj.unit_id

                if 'from_unit_id' not in normalized_row and 'container_unit_id' in normalized_row:
                    normalized_row['from_unit_id'] = normalized_row['container_unit_id']

                if 'multiplier_to_base' not in normalized_row and 'container_amount' in normalized_row:
                    normalized_row['multiplier_to_base'] = normalized_row['container_amount']

                normalized_conversions.append(normalized_row)

            mutable_data['conversions'] = normalized_conversions

        return super().to_internal_value(mutable_data)

    def validate_name(self, value):
        normalized_name = value.strip()

        queryset = Ingredient.objects.filter(name__iexact=normalized_name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("An ingredient with this name already exists.")

        return normalized_name

    def validate_low_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Low stock threshold must be zero or greater.")
        return value

    def _validate_conversions_data(self, base_unit, conversions_data):
        seen_from_units = set()

        for conversion in conversions_data:
            from_unit = conversion['from_unit']

            if from_unit.id == base_unit.id:
                raise serializers.ValidationError("Container unit cannot be the same as the ingredient base unit.")

            if from_unit.id in seen_from_units:
                raise serializers.ValidationError("Duplicate container units are not allowed for the same ingredient.")

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

            if parsed_expiration <= parsed_purchase:
                raise serializers.ValidationError({"expirationDate": "Expiration date must be later than purchase date."})

        base_unit = attrs.get('unit', self.instance.unit if self.instance else None)
        conversions_data = attrs.get('conversions', None)

        if base_unit and conversions_data is not None:
            self._validate_conversions_data(base_unit, conversions_data)

        if self.instance is not None:
            requested_unit = attrs.get('unit', self.instance.unit)
            reset_stock_on_dimension_change = attrs.get('reset_stock_on_dimension_change', False)

            unit_changed = requested_unit.id != self.instance.unit.id
            dimension_changed = unit_changed and requested_unit.dimension_id != self.instance.unit.dimension_id

            if dimension_changed:
                low_amount = attrs.get('low_amount', self.instance.low_amount)
                normalized_low_amount = Decimal(str(low_amount or 0))

                if normalized_low_amount != 0:
                    raise serializers.ValidationError({
                        'low_amount': 'Changing between Weight, Volume, and Count requires low stock threshold to be zero.'
                    })

                if not reset_stock_on_dimension_change:
                    raise serializers.ValidationError({
                        'reset_stock_on_dimension_change': 'Dimension changes require explicit stock reset confirmation.'
                    })

        return attrs
        
    def get_batches(self, obj):
        queryset = obj.transactions.filter(transaction_type='in', remaining_amount__gt=0).order_by('expiration_date', 'purchase_date')
        
        return IngredientBatchSerializer(queryset, many=True).data
    
    def create(self, validated_data):
        validated_data.pop('reset_stock_on_dimension_change', None)
        conversions_data = validated_data.pop('conversions', [])

        request = self.context.get("request")
        data = request.data

        amount = data.get("amount")
        purchase_date = data.get("purchaseDate")
        expiration_date = data.get("expirationDate")

        ingredient = Ingredient.objects.create(**validated_data)

        for conversion in conversions_data:
            IngredientUnitConversion.objects.create(
                ingredient=ingredient,
                from_unit=conversion['from_unit'],
                to_unit=ingredient.unit,
                factor=conversion['factor']
            )

        Transaction.objects.create(
            ingredient=ingredient,
            amount=amount,
            remaining_amount=amount,
            transaction_type='in',
            purchase_date=purchase_date,
            expiration_date=expiration_date,
            reason='Initial stock in',
        )

        ingredient.total_stock = ingredient.transactions.filter(
            transaction_type='in'
        ).aggregate(models.Sum('remaining_amount'))['remaining_amount__sum'] or 0
        ingredient.save()

        return ingredient

    def update(self, instance, validated_data):
        reset_stock_on_dimension_change = validated_data.pop('reset_stock_on_dimension_change', False)
        conversions_data = validated_data.pop('conversions', None)

        old_unit = instance.unit
        new_unit = validated_data.get('unit', instance.unit)
        unit_changed = old_unit.id != new_unit.id
        dimension_changed = unit_changed and old_unit.dimension_id != new_unit.dimension_id

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            conversion_factor = Decimal('1')

            if unit_changed and not dimension_changed:
                conversion_factor = get_unit_conversion_factor(old_unit, new_unit, ingredient=instance)

                instance.total_stock = Decimal(str(instance.total_stock)) * conversion_factor

            if dimension_changed:
                if not reset_stock_on_dimension_change:
                    raise serializers.ValidationError({
                        'reset_stock_on_dimension_change': 'Dimension changes require explicit stock reset confirmation.'
                    })

                instance.total_stock = Decimal('0')
                instance.low_amount = Decimal('0')

            instance.save()

            if unit_changed and not dimension_changed:
                for transaction_item in instance.transactions.all():
                    transaction_item.amount = Decimal(str(transaction_item.amount)) * conversion_factor
                    transaction_item.remaining_amount = Decimal(str(transaction_item.remaining_amount)) * conversion_factor
                    transaction_item.save(update_fields=['amount', 'remaining_amount'])

                for recipe_ingredient in RecipeIngredient.objects.filter(ingredient=instance):
                    recipe_ingredient.amount_needed = Decimal(str(recipe_ingredient.amount_needed)) * conversion_factor
                    recipe_ingredient.save(update_fields=['amount_needed'])

                for conversion in instance.conversions.all():
                    conversion.factor = Decimal(str(conversion.factor)) * conversion_factor
                    conversion.to_unit = new_unit
                    conversion.save(update_fields=['factor', 'to_unit'])

            if dimension_changed:
                for transaction_item in instance.transactions.all():
                    if transaction_item.remaining_amount != 0:
                        transaction_item.remaining_amount = Decimal('0')
                        transaction_item.save(update_fields=['remaining_amount'])

                for recipe_ingredient in RecipeIngredient.objects.filter(ingredient=instance):
                    if recipe_ingredient.amount_needed != 0:
                        recipe_ingredient.amount_needed = Decimal('0')
                        recipe_ingredient.save(update_fields=['amount_needed'])

                instance.conversions.all().delete()

            if conversions_data is not None:
                instance.conversions.all().delete()

                for conversion in conversions_data:
                    IngredientUnitConversion.objects.create(
                        ingredient=instance,
                        from_unit=conversion['from_unit'],
                        to_unit=instance.unit,
                        factor=conversion['factor']
                    )

        return instance
    
    
class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit.abbreviation', read_only=True)
    ingredient_stock = serializers.SerializerMethodField()
    
    amount_needed = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MaxValueValidator(MAX_DECIMAL_VALUE)]
    )
    
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

    def _get_available_stock(self, ingredient):
        stock_cache = self.context.setdefault('ingredient_non_expired_stock', {})

        if ingredient.id not in stock_cache:
            stock_cache[ingredient.id] = get_ingredient_available_stock(ingredient)

        return stock_cache[ingredient.id]

    def get_is_missing(self, obj):
        return self._get_available_stock(obj.ingredient) < obj.amount_needed

    def get_ingredient_stock(self, obj):
        return self._get_available_stock(obj.ingredient)

    def get_ingredient_units(self, obj):
        base_unit = obj.ingredient.unit
        units = [
            {
                'id': base_unit.id,
                'name': base_unit.name,
                'abbreviation': base_unit.abbreviation,
                'dimension': base_unit.dimension.name,
                'multiplier_to_base': 1,
            }
        ]

        for conversion in obj.ingredient.conversions.select_related('from_unit').all():
            unit = conversion.from_unit
            container_definition = getattr(unit, 'container_definition', None)

            option_name = container_definition.name if container_definition else unit.name
            option_symbol = (container_definition.symbol if container_definition else unit.abbreviation) or option_name

            units.append(
                {
                    'id': unit.id,
                    'container_id': container_definition.id if container_definition else None,
                    'name': option_name,
                    'abbreviation': option_symbol,
                    'dimension': unit.dimension.name,
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
                {"input_unit_id": f"No container mapping found for {ingredient.name}: {selected_unit.name} -> {ingredient.unit.name}."}
            ) from error

        return attrs
        

class RecipeOrderInputSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=MAX_INTEGER_VALUE)
    
    
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
        orders = data.get('orders', [])
        
        ingredient_totals = {}
        
        for order in orders:
            try:
                recipe = Recipe.objects.get(id=order['recipe_id'])
            except Recipe.DoesNotExist:
                raise ValidationError(f"Recipe ID {order['recipe_id']} not found.")

            qty = Decimal(order['quantity'])
            
            for ri in recipe.recipe_ingredients.all():
                ing_id = ri.ingredient.id
                needed = ri.amount_needed * qty
                
                if ing_id in ingredient_totals:
                    ingredient_totals[ing_id] += needed
                else:
                    ingredient_totals[ing_id] = needed

        errors = []
        ingredient_ids = list(ingredient_totals.keys())
        ingredient_map = Ingredient.objects.in_bulk(ingredient_ids)
        available_stock_map = get_available_stock_by_ingredient_ids(ingredient_ids)

        for ing_id, amount_needed in ingredient_totals.items():
            ingredient = ingredient_map.get(ing_id)
            ingredient_name = ingredient.name if ingredient else f"Ingredient {ing_id}"
            available_stock = available_stock_map.get(ing_id, Decimal('0'))

            if available_stock < amount_needed:
                errors.append(
                    f"Not enough non-expired {ingredient_name}. Need {amount_needed}, Have {available_stock}"
                )
        
        if errors:
            raise ValidationError(errors)

        self.context['ingredient_totals'] = ingredient_totals
        return data

    def create(self, validated_data):
        ingredient_totals = self.context['ingredient_totals']
        created_transactions = []
        orders = validated_data.get('orders', [])

        recipe_names = []
        for order in orders:
            recipe = Recipe.objects.filter(id=order['recipe_id']).first()
            if recipe:
                recipe_names.append(recipe.name)

        unique_recipe_names = sorted(set(recipe_names))

        if len(unique_recipe_names) == 1:
            reason = f"Cooked for Recipe: {unique_recipe_names[0]}"
        elif len(unique_recipe_names) > 1:
            reason = f"Cooked for Recipes: {', '.join(unique_recipe_names)}"
        else:
            reason = "Cooked for Recipe"

        purchase_date = timezone.now().date()

        with transaction.atomic():
            created_transactions = deduct_ingredient_totals(
                ingredient_totals=ingredient_totals,
                purchase_date=purchase_date,
                reason=reason,
                exclude_expired=True,
            )

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