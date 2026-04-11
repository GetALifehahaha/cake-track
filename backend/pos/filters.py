# pos/filters.py
import django_filters #type: ignore
from django_filters.rest_framework import FilterSet #type: ignore
from .models import Transaction  # Assume Transaction model is imported

class TransactionFilter(FilterSet):
    
    # 1. Date Filtering (Crucial)
    # The lookup_expr='date' ensures that if Transaction.due_date is a DateTimeField, 
    # it only compares the YYYY-MM-DD portion, avoiding the 'midnight bug'
    created_at = django_filters.DateFilter(field_name='created_at', lookup_expr='date')
    
    # 2. Payment Method Filtering
    payment_method = django_filters.CharFilter(lookup_expr='iexact') # iexact = case-insensitive exact match
    
    # 3. Void Status Filtering
    is_void = django_filters.BooleanFilter(field_name='is_void')
    is_completed = django_filters.BooleanFilter(field_name='is_completed')
    completed_at = django_filters.DateFilter(field_name='completed_at', lookup_expr='date')
    cashier = django_filters.NumberFilter(field_name='cashier_id')

    # # Example Range Filter (For transactions created in a period)
    # created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    # created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')


    class Meta:
        model = Transaction
        # List all fields available for filtering via query parameters
        fields = ['created_at', 'payment_method', 'is_void', 'is_completed', 'completed_at', 'cashier']