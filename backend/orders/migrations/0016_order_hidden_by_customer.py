from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0015_alter_order_status_refunded'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='hidden_by_customer',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order',
            name='hidden_by_customer_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
