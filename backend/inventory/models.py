from decimal import Decimal

from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

# Create your models here.
class Dimension(models.Model):
    name = models.CharField(max_length=20, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class UnitManager(models.Manager):
    LEGACY_DIMENSION_MAP = {
        'mass': 'weight',
        'weight': 'weight',
        'volume': 'volume',
        'count': 'count',
    }

    def _normalize_legacy_kwargs(self, kwargs):
        if 'abbreviation' in kwargs and 'symbol' not in kwargs:
            kwargs['symbol'] = kwargs.pop('abbreviation')

        if 'multiplier_to_reference' in kwargs and 'to_base_factor' not in kwargs:
            kwargs['to_base_factor'] = kwargs.pop('multiplier_to_reference')

        legacy_dimension = kwargs.get('dimension')
        if isinstance(legacy_dimension, str):
            normalized_dimension = self.LEGACY_DIMENSION_MAP.get(legacy_dimension.lower(), legacy_dimension.lower())
            kwargs['dimension'] = Dimension.objects.get_or_create(name=normalized_dimension)[0]

        return kwargs

    def create(self, **kwargs):
        kwargs = self._normalize_legacy_kwargs(kwargs)
        return super().create(**kwargs)


class Unit(models.Model):
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10, blank=True)
    dimension = models.ForeignKey(Dimension, on_delete=models.PROTECT, related_name='units')
    to_base_factor = models.DecimalField(max_digits=18, decimal_places=8, default=1)
    is_base = models.BooleanField(default=False)

    objects = UnitManager()

    class Meta:
        indexes = [
            models.Index(fields=['dimension', 'to_base_factor'], name='inventory_u_dimensi_c2273a_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=('dimension',),
                condition=models.Q(is_base=True),
                name='unique_base_unit_per_dimension',
            )
        ]

    def __str__(self):
        return f"{self.symbol} : {self.name}"

    @property
    def abbreviation(self):
        return self.symbol

    @abbreviation.setter
    def abbreviation(self, value):
        self.symbol = value

    @property
    def multiplier_to_reference(self):
        return self.to_base_factor

    @multiplier_to_reference.setter
    def multiplier_to_reference(self, value):
        self.to_base_factor = value

    @property
    def legacy_dimension(self):
        if self.dimension and self.dimension.name == 'weight':
            return 'mass'

        return self.dimension.name if self.dimension else 'count'


class Container(models.Model):
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=20, blank=True, default='')
    unit = models.OneToOneField(Unit, on_delete=models.PROTECT, related_name='container_definition')

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.symbol:
            return f"{self.name} ({self.symbol})"

        return self.name

class Ingredient(models.Model):
    name = models.CharField(max_length=20)
    total_stock = models.DecimalField(max_digits=18, decimal_places=4, default=0) #type: ignore
    low_amount = models.DecimalField(max_digits=18, decimal_places=4, default=0)

    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="ingredients")

    def __str__(self):
        return self.name

    @property
    def containers(self):
        return self.conversions
    

class Transaction(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="transactions")
    created_at = models.DateTimeField(auto_now_add=True)
    
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    remaining_amount = models.DecimalField(max_digits=18, decimal_places=4, default=0) #type: ignore

    TYPE = [
        ('in', 'In'),
        ('out', 'Out'),
    ]
    transaction_type = models.CharField(max_length=3, choices=TYPE)

    # Extra fields needed for inventory logic
    purchase_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)  # only used for IN
    unit_purchase_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    reason = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.ingredient.name} - {self.transaction_type} {self.amount}"
    
    

class Recipe(models.Model): 
    name = models.CharField(max_length=100)
    is_temporary = models.BooleanField(default=False)
    ingredients = models.ManyToManyField(
        Ingredient, 
        through='RecipeIngredient'
    )
    image = models.CharField(max_length=500, blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    def is_available(self):
        from .services import get_ingredient_available_stock

        for ing in self.recipe_ingredients.all():
            available_stock = get_ingredient_available_stock(ing.ingredient)
            if available_stock < ing.amount_needed:
                return False
        return True

    def cook(self, quantity=1, reason=None):
        """
        Deducts ingredients for this recipe. 
        quantity: How many of this recipe are being made (default 1).
        """
        from .services import deduct_ingredient_totals, get_ingredient_available_stock

        ingredient_totals = {}

        for recipe_item in self.recipe_ingredients.select_related('ingredient'):  # type: ignore
            ingredient = recipe_item.ingredient
            amount_needed = recipe_item.amount_needed * quantity
            available_stock = get_ingredient_available_stock(ingredient)

            if available_stock < amount_needed:
                raise ValidationError(
                    f"Not enough non-expired {ingredient.name}. Needed: {amount_needed}, Available: {available_stock}"
                )

            if ingredient.id in ingredient_totals:
                ingredient_totals[ingredient.id] += amount_needed
            else:
                ingredient_totals[ingredient.id] = amount_needed

        deduct_ingredient_totals(
            ingredient_totals=ingredient_totals,
            purchase_date=timezone.now().date(),
            reason=reason,
            exclude_expired=True,
        )
                

class RecipeIngredient(models.Model):
    """
    This links a Recipe to an Ingredient and defines HOW MUCH is needed.
    """
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    
    # How much of this ingredient is needed for 1 portion of the recipe
    amount_needed = models.DecimalField(max_digits=18, decimal_places=4)

    def __str__(self):
        return f"{self.recipe.name} needs {self.amount_needed} of {self.ingredient.name}"


class IngredientUnitConversion(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='conversions')
    from_unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name='ingredient_conversion_sources')
    to_unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name='ingredient_conversion_targets')
    factor = models.DecimalField(max_digits=18, decimal_places=8)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('ingredient', 'from_unit', 'to_unit'),
                name='unique_item_unit_conversion_pair',
            )
        ]
        indexes = [
            models.Index(fields=['ingredient', 'from_unit', 'to_unit']),
        ]

    def clean(self):
        if self.from_unit_id and self.ingredient_id and self.from_unit_id == self.ingredient.unit_id:
            raise ValidationError("Container unit cannot be the same as the ingredient base unit.")

    def save(self, *args, **kwargs):
        if self.to_unit_id is None and self.ingredient_id:
            self.to_unit_id = self.ingredient.unit_id

        if self.factor is None:
            self.factor = Decimal('1')

        super().save(*args, **kwargs)

    @property
    def multiplier_to_base(self):
        return self.factor

    @multiplier_to_base.setter
    def multiplier_to_base(self, value):
        self.factor = value

    @property
    def container_unit(self):
        return self.from_unit

    @container_unit.setter
    def container_unit(self, value):
        self.from_unit = value

    @property
    def container_amount(self):
        return self.factor

    @container_amount.setter
    def container_amount(self, value):
        self.factor = value

    @property
    def container(self):
        return getattr(self.from_unit, 'container_definition', None)

    def __str__(self):
        return f"{self.ingredient.name}: 1 {self.from_unit.symbol or self.from_unit.name} = {self.factor} {self.to_unit.symbol or self.to_unit.name}"


class Inventory(models.Model):
    item = models.OneToOneField(Ingredient, on_delete=models.CASCADE, related_name='inventory')
    quantity_base = models.DecimalField(max_digits=18, decimal_places=4, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['updated_at'], name='inventory_i_updated_22da79_idx'),
        ]


class Item(Ingredient):
    class Meta:
        proxy = True
        verbose_name = 'Item'
        verbose_name_plural = 'Items'


class ItemUnitConversion(IngredientUnitConversion):
    class Meta:
        proxy = True
        verbose_name = 'Item Unit Conversion'
        verbose_name_plural = 'Item Unit Conversions'
    