from django.db import IntegrityError, models, transaction
from django.contrib.auth.models import User
from django.utils import timezone
from backend.utils import generate_id
from decimal import Decimal, ROUND_HALF_UP

# Create your models here.


class Discount(models.Model):

    DISCOUNT_TYPE = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]

    SCOPE = [
        ("all_products", "Entire Order"),
        ("selected_products", "Selected Product/s"),
        ("selected_category", "Selected Category"),
    ]

    name = models.CharField(max_length=100)

    discount_type = models.CharField(
        max_length=30,
        choices=DISCOUNT_TYPE,
        default="percentage"
    )

    value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("10.00")
    )

    scope = models.CharField(
        max_length=30,
        choices=SCOPE,
        default="all_products"
    )

    products = models.ManyToManyField(
        "Product",
        blank=True,
        related_name="discounts"
    )

    category = models.ManyToManyField(
        "Category",
        blank=True,
        related_name="discounts"
    )

    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    min_order_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    used_count = models.PositiveIntegerField(default=0)

    active = models.BooleanField(default=True)

    def is_valid(self):

        now = timezone.now()

        if not self.active:
            return False

        if self.start_date and now < self.start_date:
            return False

        if self.end_date and now > self.end_date:
            return False

        if self.usage_limit and self.used_count >= self.usage_limit:
            return False

        return True


    def __str__(self):
        return self.name
    

class DiscountUsage(models.Model):
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, related_name="usages", null=True, blank=True)
    transaction = models.ForeignKey("Transaction", on_delete=models.CASCADE, related_name="discount_usages")
    products = models.ManyToManyField("Product", blank=True)
    discount_snapshot = models.JSONField(null=True, blank=True)

    amount = models.DecimalField(max_digits=11, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


class Category(models.Model):
    name = models.CharField(max_length=100)
    is_disabled = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        
    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, null=True)
    categories = models.ManyToManyField(Category, blank=True, related_name="products")
    image = models.CharField(max_length=500, blank=True, null=True)
    has_recipe = models.BooleanField(default=False)
    recipe = models.ForeignKey('inventory.Recipe', on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_products')
    
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
    def __str__(self):
        return self.name
    

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    label = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    has_recipe = models.BooleanField(default=False)
    recipe = models.ForeignKey(
        'inventory.Recipe',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pos_product_variants',
    )

    def __str__(self):
        return f"{self.product.name} - {self.label} : {self.price}"
    

class Transaction(models.Model):
    id = models.CharField(primary_key=True, max_length=20, editable=False)

    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="transactions")
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, null=True, blank=True)
    discount_snapshot = models.JSONField(null=True, blank=True)
    
    is_void = models.BooleanField(default=False)
    paid_amount = models.DecimalField(decimal_places=2, max_digits=11, default=0) #type: ignore

    is_completed = models.BooleanField(default=False)
    is_register_counted = models.BooleanField(default=False)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    sequence_date = models.DateField(null=True, blank=True, editable=False, db_index=True)
    sequence_number = models.PositiveIntegerField(null=True, blank=True, editable=False)
    
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

    order_type = models.CharField(max_length=10, default='dine-in')

    gross_total = models.DecimalField(max_digits=11, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=11, decimal_places=2)
    net_total = models.DecimalField(max_digits=11, decimal_places=2)
    change = models.DecimalField(max_digits=11, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sequence_date', 'sequence_number'],
                name='unique_daily_transaction_sequence_number',
            )
        ]

    def _assign_sequence(self):
        if self.sequence_date and self.sequence_number:
            return

        sequence_date = timezone.localdate()

        for _ in range(10):
            try:
                with transaction.atomic():
                    counter, _ = DailyOrderCounter.objects.select_for_update().get_or_create(
                        sequence_date=sequence_date,
                        defaults={'last_number': 0},
                    )
                    counter.last_number += 1
                    counter.save(update_fields=['last_number'])

                    self.sequence_date = sequence_date
                    self.sequence_number = counter.last_number
                    return
            except IntegrityError:
                continue

        raise IntegrityError('Failed to assign a unique daily transaction sequence number')

    def save(self, *args, **kwargs):
        if self._state.adding and (not self.sequence_date or not self.sequence_number):
            self._assign_sequence()

        if not self.id:
            while True:
                try:
                    self.id = generate_id("TRX")
                    super().save(*args, **kwargs)
                    break
                except IntegrityError:
                    continue
        else:
            super().save(*args, **kwargs)

    
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
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        variant_name = f" - {self.product_variant.label}" if self.product_variant else ""
        return f"{self.quantity} × {self.product.name}{variant_name}"


class DailyOrderCounter(models.Model):
    sequence_date = models.DateField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-sequence_date']

    def __str__(self):
        return f"{self.sequence_date} - {self.last_number}"


class RegisterMoney(models.Model):
    cashier = models.OneToOneField(User, on_delete=models.CASCADE, related_name='register_money')
    starting_money = models.DecimalField(max_digits=11, decimal_places=2, default=Decimal('0.00'))
    current_amount = models.DecimalField(max_digits=11, decimal_places=2, default=Decimal('0.00'))
    started_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['cashier__username']

    def __str__(self):
        return f"{self.cashier.username} register"


class RegisterDeduction(models.Model):
    register_money = models.ForeignKey(RegisterMoney, on_delete=models.CASCADE, related_name='deductions')
    cashier = models.ForeignKey(User, on_delete=models.CASCADE, related_name='register_deductions')
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_register_deductions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.cashier.username} deduction - {self.amount}"


class RegisterTransaction(models.Model):
    ENTRY_TYPES = [
        ('addition', 'Addition'),
        ('deduction', 'Deduction'),
    ]

    register_money = models.ForeignKey(RegisterMoney, on_delete=models.CASCADE, related_name='register_transactions')
    cashier = models.ForeignKey(User, on_delete=models.CASCADE, related_name='register_transactions')
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPES)
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_register_transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.cashier.username} {self.entry_type} - {self.amount}"


class BusinessSettings(models.Model):
    business_name = models.CharField(max_length=100, default="My Business")
    address = models.TextField(blank=True, verbose_name="Business Address")
    
    tin = models.CharField(max_length=30, blank=True, verbose_name="Tax Identification Number (TIN)")
    
    contact_number = models.CharField(max_length=20, blank=True)
    message = models.TextField(blank=True, help_text="Message to appear at the bottom of the receipt (e.g. Thank you!)")

    secret_pin = models.IntegerField(default=1234)

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