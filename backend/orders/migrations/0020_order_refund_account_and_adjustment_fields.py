from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0019_order_payment_method'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='customer_adjustment_used',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order',
            name='customer_adjustment_used_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='refund_account_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='refund_account_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
