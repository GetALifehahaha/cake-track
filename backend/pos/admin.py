from django.contrib import admin
from .models import (
    Discount, Size, Category, Product, ProductSize,
    Transaction, TransactionItem
)

# -----------------------------
# Simple model registrations
# -----------------------------
@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'rate']
    search_fields = ['name']


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'short']
    search_fields = ['name', 'short']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


# -----------------------------
# Product & ProductSize
# -----------------------------
@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'size', 'price']
    search_fields = ['product__name', 'size__name']

class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1  # how many blank product sizes to show
    readonly_fields = []
    autocomplete_fields = ['size']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'is_archived']
    search_fields = ['name', 'description']
    list_filter = ['category', 'is_archived']
    inlines = [ProductSizeInline]


# -----------------------------
# Transaction & TransactionItem
# -----------------------------
class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 1
    readonly_fields = ['price']
    autocomplete_fields = ['product', 'product_size']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'cashier', 'payment_method', 'is_void', 'created_at', 'gross_total', 'net_total']
    list_filter = ['payment_method', 'is_void', 'created_at']
    search_fields = ['cashier__username', 'id']
    inlines = [TransactionItemInline]


# Optional: Register TransactionItem separately if needed
@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'transaction', 'product', 'product_size', 'quantity', 'price']
    search_fields = ['product__name', 'transaction__id']
    list_filter = ['product']
