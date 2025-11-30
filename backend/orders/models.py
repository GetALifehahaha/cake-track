from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    comments = models.TextField(null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('claimed', 'Claimed'),
    ]
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    status = models.CharField(choices=ORDER_STATUS, max_length=50, default='pending')
    
    reject_reason = models.TextField(null=True, blank=True)


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
