from rest_framework import serializers
from .models import Payment
from orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    # Added read_only=True to prevent the "queryset required" AssertionError
    payer_username = serializers.CharField(source="payer.username", read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(source="orders", read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payer', 'payer_username', 'order_id', 
            'amount', 'gateway_transaction_id', 'created_at'
        ]
        read_only_fields = fields
        

class PaymentInitializeSerializers(serializers.Serializer):
    order_id = serializers.IntegerField(
        write_only=True,
        required=True,
        help_text='The ID of the Order to be paid.'
    )
    
    def validate(self, data):
        order_id = data.get('order_id')
        
        # We hardcode 500 as requested, but you can pass it dynamically later
        data['final_amount'] = 500
        
        if order_id is not None:
            try:
                order = Order.objects.get(pk=order_id)
            except Order.DoesNotExist:
                # FIX: Must use 'raise', not 'return'
                raise serializers.ValidationError({"order_id": "Order ID does not exist."})
            
            # Attach the order object to the serializer instance so the View can use it
            self.order_instance = order
            
        else:
            # FIX: Must use 'raise', not 'return'
            raise serializers.ValidationError({"order_id": "This field is required."})
        
        return data