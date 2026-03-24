from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

# Create your models here.
class Unit(models.Model):
    DIMENSION_CHOICES = [
        ('mass', 'Mass'),
        ('volume', 'Volume'),
        ('count', 'Count'),
    ]

    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10, blank=True)
    dimension = models.CharField(max_length=20, choices=DIMENSION_CHOICES, default='mass')
    multiplier_to_reference = models.DecimalField(max_digits=14, decimal_places=6, default=1)

    def __str__(self):
        return f"{self.abbreviation} : {self.name}"

class Ingredient(models.Model):
    name = models.CharField(max_length=20)
    total_stock = models.DecimalField(max_digits=14, decimal_places=4, default=0) #type: ignore

    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="ingredients")

    def __str__(self):
        return self.name
    

class Transaction(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="transactions")
    created_at = models.DateTimeField(auto_now_add=True)
    
    amount = models.DecimalField(max_digits=14, decimal_places=4)
    remaining_amount = models.DecimalField(max_digits=14, decimal_places=4, default=0) #type: ignore

    TYPE = [
        ('in', 'In'),
        ('out', 'Out'),
    ]
    transaction_type = models.CharField(max_length=3, choices=TYPE)

    # Extra fields needed for inventory logic
    purchase_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)  # only used for IN
    unit_purchase_price = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True)
    cost_amount = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True)
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
        for ing in self.recipe_ingredients.all():
            if ing.ingredient.total_stock < ing.amount_needed:
                return False
        return True

    def cook(self, quantity=1, reason=None):
        """
        Deducts ingredients for this recipe. 
        quantity: How many of this recipe are being made (default 1).
        """
        from .services import deduct_ingredient_totals

        ingredient_totals = {}

        for recipe_item in self.recipe_ingredients.select_related('ingredient'):  # type: ignore
            ingredient = recipe_item.ingredient
            amount_needed = recipe_item.amount_needed * quantity

            if ingredient.total_stock < amount_needed:
                raise ValidationError(
                    f"Not enough {ingredient.name}. Needed: {amount_needed}, Stock: {ingredient.total_stock}"
                )

            if ingredient.id in ingredient_totals:
                ingredient_totals[ingredient.id] += amount_needed
            else:
                ingredient_totals[ingredient.id] = amount_needed

        deduct_ingredient_totals(
            ingredient_totals=ingredient_totals,
            purchase_date=timezone.now().date(),
            reason=reason,
        )
                

class RecipeIngredient(models.Model):
    """
    This links a Recipe to an Ingredient and defines HOW MUCH is needed.
    """
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    
    # How much of this ingredient is needed for 1 portion of the recipe
    amount_needed = models.DecimalField(max_digits=14, decimal_places=4) 

    def __str__(self):
        return f"{self.recipe.name} needs {self.amount_needed} of {self.ingredient.name}"


class IngredientUnitConversion(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='conversions')
    from_unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name='ingredient_conversion_sources')
    multiplier_to_base = models.DecimalField(max_digits=14, decimal_places=6)

    class Meta:
        unique_together = ('ingredient', 'from_unit')

    def clean(self):
        if self.from_unit_id and self.ingredient_id and self.from_unit_id == self.ingredient.unit_id:
            raise ValidationError("Source unit cannot be the same as the ingredient base unit.")

    def __str__(self):
        return f"{self.ingredient.name}: 1 {self.from_unit.abbreviation or self.from_unit.name} = {self.multiplier_to_base} {self.ingredient.unit.abbreviation or self.ingredient.unit.name}"
    