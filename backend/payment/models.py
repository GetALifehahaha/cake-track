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

    PAYMENT_TYPE_CHOICES = [
        ('downpayment', 'Downpayment'),
        ('full_payment', 'Full Payment'),
    ]
    
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment")
    orders = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payment")
    status = models.CharField(choices=STATUS_CHOICES, max_length=15, default="Pending")
    payment_type = models.CharField(choices=PAYMENT_TYPE_CHOICES, max_length=20, default='downpayment')
    
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    
    gateway_transaction_id = models.CharField(max_length=255, blank=True, null=True, help_text="Generic Gateway Transaction ID")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    