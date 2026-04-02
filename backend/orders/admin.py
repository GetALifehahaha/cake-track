from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Order, CakeOrder, CupcakeOrder, Cake, OrderImage

# 1. Create Inlines for the specific order types
# This allows you to edit Cake/Cupcake details inside the main Order page.

class CakeOrderInline(admin.StackedInline):
    model = CakeOrder
    can_delete = False
    verbose_name_plural = 'Cake Details'
    fk_name = 'order'

class CupcakeOrderInline(admin.StackedInline):
    model = CupcakeOrder
    can_delete = False
    verbose_name_plural = 'Cupcake Details'
    fk_name = 'order'

# 2. Register the Main Order Admin

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Columns to show in the list view
    list_display = ('id', 'full_name', 'status', 'due_date', 'get_order_type', 'created_at')
    
    # Sidebar filters
    list_filter = ('status', 'due_date', 'created_at')
    
    # Search bar capabilities
    search_fields = ('full_name', 'email', 'phone_number', 'id')
    
    # Add the inlines we defined above
    inlines = [CakeOrderInline, CupcakeOrderInline]
    
    # Make created_at visible (since auto_now_add hides it by default)
    readonly_fields = ('created_at',)

    # Custom method to show if it's a Cake or Cupcake in the list view
    def get_order_type(self, obj):
        if hasattr(obj, 'cake_orders'):
            return "Cake"
        elif hasattr(obj, 'cupcake_orders'):
            return "Cupcake"
        return "Generic/Other"
    get_order_type.short_description = 'Order Type'


admin.site.register(Cake)
admin.site.register(OrderImage)

# Optional: If you want to see them separately as well, you can register them, 
# but usually, the Inlines above are enough.
# admin.site.register(CakeOrder)
# admin.site.register(CupcakeOrder)