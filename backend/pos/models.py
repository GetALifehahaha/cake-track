from django.db import models
from django.contrib.auth.models import User
import random
from django.db import models
from django.utils import timezone

# Create your models here.


class Discount(models.Model):
    name = models.CharField(max_length=50)
    rate = models.DecimalField(decimal_places=2, max_digits=5)
    
    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        
    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
    def __str__(self):
        return self.name
    

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    label = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.size} : {self.price}"
    

class Transaction(models.Model):
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="transactions")
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, null=True, blank=True)
    is_void = models.BooleanField(default=False)
    paid_amount = models.DecimalField(decimal_places=2, max_digits=11, default=0) #type: ignore
    
    def __str__(self):
        return f"Transaction #{self.pk}"
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('gcash', 'GCash'),
        ('other', 'Other')
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    
    ORDER_TYPE = [
        ('dine-in', 'Dine IN'),
        ('take-out', 'Take OUT')
    ]
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE, default='dine-in')
    
    @property
    def gross_total(self):
        # We add "if item.product_size" to check if the size still exists
        return sum(
            (item.product_size.price * item.quantity) 
            for item in self.transaction_items.all() #type:ignore
            if item.product_size 
        )
    
    @property
    def discount_amount(self):
        if self.discount:
            return self.gross_total * self.discount.rate
        return 0
    
    @property
    def net_total(self):
        return self.gross_total - self.discount_amount
    
    @property
    def change(self):
        return (self.net_total - self.paid_amount) * -1
    
class TransactionItem(models.Model):
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name="transaction_items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="product_items"
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    quantity = models.PositiveIntegerField()

    def __str__(self):
        variant_name = f" - {self.product_variant.label}" if self.product_variant else ""
        return f"{self.quantity} × {self.product.name}{size_name}"


class BusinessSettings(models.Model):
    # --- Business Details ---
    business_name = models.CharField(max_length=100, default="My Business")
    address = models.TextField(blank=True, verbose_name="Business Address")
    
    # --- Credentials ---
    tin = models.CharField(max_length=30, blank=True, verbose_name="Tax Identification Number (TIN)")
    
    # --- Contact and Message ---
    contact_number = models.CharField(max_length=20, blank=True)
    message = models.TextField(blank=True, help_text="Message to appear at the bottom of the receipt (e.g. Thank you!)")
    
    # Optional: Add a logo
    logo = models.ImageField(upload_to='company/', blank=True, null=True)

    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"

    def __str__(self):
        return self.business_name

    def save(self, *args, **kwargs):
        """
        Singleton Logic: Ensure there is only ever one ID=1.
        """
        self.pk = 1
        super(BusinessSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        """
        Helper method to get the settings. 
        If it doesn't exist, create it.
        """
        obj, created = cls.objects.get_or_create(pk=1)
        return obj