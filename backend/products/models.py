from django.db import models

# Create your models here.
class Recipe(models.Model):
    name = models.CharField(max_length=255)
    instructions = models.TextField()
    prep_time = models.DurationField()
    cook_time = models.DurationField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

class Product(models.Model):
    # consisting of cakes, coffee, misc
    # if misc, no recipe
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    has_recipe = models.BooleanField()
    has_storage = models.BooleanField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    recipe = models.OneToOneField(
        Recipe,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name='product'
    )


class ProductStorage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='storage'
    )

    quantity = models.IntegerField()
    creation_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()
    shelf_life = models.DurationField()


class Ingredient(models.Model):
    name = models.CharField(max_length=255)
    
    UNIT = [
        # weight
        ('g', 'Grams'), ('kg', 'Kilograms'), ('sk', 'Sack'), ('bg', 'Bag'), ('bx', 'Box'), ('pk', 'Pack'),

        # volume
        ('ml', 'Milliliter'), ('l', 'Liter'), ('gl', 'Gallon'),

        # count
        ('pc', 'Piece'), ('dz', 'Dozen'), ('tr', 'Tray'),

        # bottle
        ('bt', 'Bottle'), ('cn', 'Can'),
    ]

    unit = models.CharField(choices=UNIT, max_length=15, default='g')


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_ingredient')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='recipe_ingredient')
    amount = models.IntegerField()


class IngredientStorage(models.Model):
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name='ingredients'
    )
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    received_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()
    shelf_life = models.DurationField()
    
