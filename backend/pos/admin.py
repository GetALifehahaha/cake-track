from django.contrib import admin
from .models import (
    Discount, Category, Product, ProductVariant,
    Transaction, TransactionItem
)

# -----------------------------
# Simple model registrations
# -----------------------------
@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'rate']
    search_fields = ['name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


# -----------------------------
# Product & ProductVariant
# -----------------------------
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'label', 'price']
    search_fields = ['product__name', 'label__name']

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1  # how many blank product sizes to show
    readonly_fields = []


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'display_categories', 'is_archived']
    search_fields = ['name', 'description']
    list_filter = ['categories', 'is_archived']
    inlines = [ProductVariantInline]

    def display_categories(self, obj):
        return ", ".join(category.name for category in obj.categories.all())
    
    display_categories.short_description = "Categories"


# -----------------------------
# Transaction & TransactionItem
# -----------------------------
class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 1
    autocomplete_fields = ['product', 'product_variant']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'cashier', 'payment_method', 'is_void', 'created_at', 'gross_total', 'net_total']
    list_filter = ['payment_method', 'is_void', 'created_at']
    search_fields = ['cashier__username', 'id']
    inlines = [TransactionItemInline]


# Optional: Register TransactionItem separately if needed
@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'transaction', 'product', 'product_variant', 'quantity']
    search_fields = ['product__name', 'transaction__id']
    list_filter = ['product']
