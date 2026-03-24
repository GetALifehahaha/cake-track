from django.db import migrations


def add_cost_amount_if_missing(apps, schema_editor):
    table_name = 'inventory_transaction'
    column_name = 'cost_amount'

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_columns = {row[1] for row in cursor.fetchall()}

        if column_name not in existing_columns:
            cursor.execute(
                f"ALTER TABLE {table_name} ADD COLUMN {column_name} decimal"
            )


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0004_transaction_unit_purchase_price_transaction_reason'),
    ]

    operations = [
        migrations.RunPython(add_cost_amount_if_missing, migrations.RunPython.noop),
    ]
