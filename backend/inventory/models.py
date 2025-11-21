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