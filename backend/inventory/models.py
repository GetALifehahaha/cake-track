from django.db import models

# Create your models here.
class Ingredient(models.Model):
    name = models.CharField(max_length=20)
    total_stock = models.DecimalField(max_digits=11, decimal_places=2, default=0)  

    UNITS = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('pc', 'Pieces'),
        ('st', 'Sticks'),
        ('ml', 'Milliliter'),
        ('cp', 'Cup'),
    ]
    unit = models.CharField(max_length=2, choices=UNITS)

    def __str__(self):
        return self.name
    

class Transaction(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="transactions")
    
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=11, decimal_places=2, default=0)

    TYPE = [
        ('in', 'In'),
        ('out', 'Out'),
    ]
    transaction_type = models.CharField(max_length=3, choices=TYPE)

    # Extra fields needed for inventory logic
    purchase_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)  # only used for IN

    def __str__(self):
        return f"{self.ingredient.name} - {self.transaction_type} {self.amount}"
    
    
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

# ... (Your existing Ingredient and Transaction models remain here) ...

class Recipe(models.Model): 
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # This creates a link to ingredients through the intermediate model below
    ingredients = models.ManyToManyField(
        Ingredient, 
        through='RecipeIngredient'
    )

    def __str__(self):
        return self.name

    def cook(self, quantity=1):
        """
        Deducts ingredients for this recipe. 
        quantity: How many of this recipe are being made (default 1).
        """
        with transaction.atomic():
            # 1. Loop through all required ingredients for this recipe
            for recipe_item in self.recipe_ingredients.select_related('ingredient'):
                ingredient = recipe_item.ingredient
                amount_needed = recipe_item.amount_needed * quantity

                # 2. Check if enough stock exists
                if ingredient.total_stock < amount_needed:
                    raise ValidationError(
                        f"Not enough {ingredient.name}. Needed: {amount_needed}, Stock: {ingredient.total_stock}"
                    )

                # 3. Update the Ingredient Stock
                ingredient.total_stock -= amount_needed
                ingredient.save()

                # 4. Create the 'OUT' Transaction record (To keep history clean)
                Transaction.objects.create(
                    ingredient=ingredient,
                    amount=amount_needed,
                    transaction_type='out',
                    remaining_amount=ingredient.total_stock,
                    purchase_date=timezone.now() # Using now as the "usage" date
                )

class RecipeIngredient(models.Model):
    """
    This links a Recipe to an Ingredient and defines HOW MUCH is needed.
    """
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    
    # How much of this ingredient is needed for 1 portion of the recipe
    amount_needed = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.recipe.name} needs {self.amount_needed} of {self.ingredient.name}"
    