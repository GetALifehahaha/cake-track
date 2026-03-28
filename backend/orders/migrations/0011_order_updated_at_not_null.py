from django.db import migrations, models
from django.utils import timezone


def backfill_order_updated_at(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    Order.objects.filter(updated_at__isnull=True).update(updated_at=timezone.now())


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0010_order_updated_at'),
    ]

    operations = [
        migrations.RunPython(backfill_order_updated_at, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='order',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
