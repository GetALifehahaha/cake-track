from django.db import migrations, models


def backfill_refunded_orders(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    Order.objects.filter(status='cancelled').exclude(refund_reference_number__isnull=True).exclude(refund_reference_number='').update(status='refunded')


def reverse_backfill_refunded_orders(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    Order.objects.filter(status='refunded').update(status='cancelled')


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0014_order_cancellation_refund_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('unpaid', 'Unpaid'),
                    ('pending', 'Pending'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                    ('refunded', 'Refunded'),
                    ('ready', 'Ready'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled'),
                ],
                default='unpaid',
                max_length=50,
            ),
        ),
        migrations.RunPython(backfill_refunded_orders, reverse_backfill_refunded_orders),
    ]
