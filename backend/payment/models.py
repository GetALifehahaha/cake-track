from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order
from django.db.models import JSONField

User = get_user_model()

# Create your models here.
class Payment(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment")
    orders = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payment")
    status = models.CharField(choices=STATUS_CHOICES, max_length=15, default="Pending")
    
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    
    gateway_transaction_id = models.CharField(max_length=255, blank=True, null=True, help_text="Generic Gateway Transaction ID")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    