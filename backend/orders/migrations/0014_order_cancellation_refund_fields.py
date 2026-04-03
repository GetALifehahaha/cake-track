from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0013_order_reference_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='cancellation_requested',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order',
            name='cancellation_requested_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='refund_reference_number',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
