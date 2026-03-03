from django.db import models
from django.contrib.auth.models import User
from inventory.models import Recipe
from backend.utils import generate_id

# Create your models here.
class Order(models.Model):
    id = models.CharField(primary_key=True, max_length=20, editable=False)

    recipe = models.ForeignKey(Recipe, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    comments = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    full_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    
    ORDER_STATUS = [
        ('unpaid', 'Unpaid'),
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
    ]
    
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    pickup_time = models.TimeField()
    status = models.CharField(choices=ORDER_STATUS, max_length=50, default='unpaid')
    
    reject_reason = models.TextField(null=True, blank=True)
    payment_source_id = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = generate_id("ORD")
            while Order.objects.filter(id=self.id).exists():
                self.id = generate_id("ORD")
        super().save(*args, **kwargs)
    

class OrderImage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_images')
    image_url = models.CharField(max_length=500)

    def __str__(self):
        return f"Image for Order {self.order}"


class CakeOrder(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="cake_orders")
    
    occasion = models.CharField(max_length=255)
    shape = models.CharField(max_length=255)
    cake_tier = models.PositiveIntegerField()
    base_flavor = models.CharField(max_length=255)
    filling = models.CharField(max_length=255)
    coating_color = models.CharField(max_length=255)
    border = models.CharField(max_length=255, default='none')
    border_color = models.CharField(max_length=255, default='none')
    toppings = models.CharField(max_length=255, default='none')
    addons = models.CharField(max_length=255, default='none')
    message_type = models.CharField(max_length=255, default='none')
    message = models.CharField(max_length=255, null=True, blank=True)


class CupcakeOrder(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="cupcake_orders")
    amount = models.PositiveIntegerField()
    frosting = models.CharField(max_length=255)

from django.db import models


class Cake(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.CharField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class BlockedDate(models.Model):
    date = models.DateField(unique=True)


class OpeningTime(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
