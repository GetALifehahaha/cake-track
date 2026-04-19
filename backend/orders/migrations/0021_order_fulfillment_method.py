from django.db import migrations, models


def ensure_fulfillment_method_column(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    table_name = Order._meta.db_table

    with schema_editor.connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(cursor, table_name)
        }

    if 'fulfillment_method' in existing_columns:
        return

    field = models.CharField(
        max_length=20,
        choices=[('pickup', 'Pickup'), ('delivery', 'Delivery')],
        default='pickup',
    )
    field.set_attributes_from_name('fulfillment_method')
    schema_editor.add_field(Order, field)


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0020_order_refund_account_and_adjustment_fields'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(ensure_fulfillment_method_column, reverse_code=migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='order',
                    name='fulfillment_method',
                    field=models.CharField(
                        choices=[('pickup', 'Pickup'), ('delivery', 'Delivery')],
                        default='pickup',
                        max_length=20,
                    ),
                ),
            ],
        ),
    ]
