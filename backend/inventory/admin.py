from django.contrib import admin
from .models import Ingredient, Transaction

# Inline to show transactions inside Ingredient
class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0  # no extra blank rows
    readonly_fields = ('created_at',)
    fields = ('transaction_type', 'amount', 'remaining_amount', 'expiration_date', 'created_at')
    ordering = ('-created_at',)

# Ingredient Admin
@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit', 'total_stock')
    search_fields = ('name',)
    inlines = [TransactionInline]

# Transaction Admin
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'ingredient', 'transaction_type', 'amount', 'expiration_date', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('ingredient__name',)
    ordering = ('-created_at',)
