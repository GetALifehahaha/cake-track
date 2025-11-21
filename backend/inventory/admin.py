from django.contrib import admin
from .models import Ingredient, Transaction

# Inline to show transactions inside Ingredient
class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0  # no extra blank rows
    readonly_fields = ('purchase_date',)
    fields = ('transaction_type', 'amount', 'remaining_amount', 'expiration_date', 'purchase_date')
    ordering = ('-purchase_date',)

# Ingredient Admin
@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit', 'total_stock')
    search_fields = ('name',)
    inlines = [TransactionInline]

# Transaction Admin
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'ingredient', 'transaction_type', 'amount', 'expiration_date', 'purchase_date')
    list_filter = ('transaction_type',)
    search_fields = ('ingredient__name',)
    ordering = ('-purchase_date',)
