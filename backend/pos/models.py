from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Discount(models.Model):
    name = models.CharField(max_length=50)
    rate = models.DecimalField(decimal_places=2, max_digits=3)
    
    def __str__(self):
        return self.name


class Size(models.Model):
    name = models.CharField(max_length=50)
    short = models.CharField(max_length=5, blank=True)

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
    description = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    image_path = models.ImageField(upload_to='products/', blank=True)
    
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
    def __str__(self):
        return self.name
    

class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sizes")
    size = models.ForeignKey(Size, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.size.name}"
    

class Transaction(models.Model):
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="transactions")
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, null=True, blank=True)
    is_void = models.BooleanField(default=False)
    
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
    
    @property
    def gross_total(self):
        return sum(item.price * item.quantity for item in self.transaction_items.all()) #type: ignore
    
    @property
    def discount_amount(self):
        if self.discount:
            return self.gross_total * self.discount.rate
        return 0
    
    @property
    def net_total(self):
        return self.gross_total - self.discount_amount
    
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
    product_size = models.ForeignKey(
        ProductSize,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # store price at sale

    def __str__(self):
        size_name = f" - {self.product_size.size.name}" if self.product_size else ""
        return f"{self.quantity} × {self.product.name}{size_name}"
