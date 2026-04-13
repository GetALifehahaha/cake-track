from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0020_order_refund_account_and_adjustment_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='reference_number',
            field=models.CharField(blank=True, db_index=True, max_length=15, null=True),
        ),
    ]
