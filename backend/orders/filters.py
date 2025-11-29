# app/filters.py
import django_filters # type: ignore
from .models import Order

class OrderFilter(django_filters.FilterSet):
    created_at = django_filters.DateFilter(field_name='due_date')
    
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')

    class Meta:
        model = Order
        fields = ['status', 'due_date']