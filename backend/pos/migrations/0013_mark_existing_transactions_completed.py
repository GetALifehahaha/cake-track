from django.db import migrations
from django.utils import timezone


def mark_existing_transactions_completed(apps, schema_editor):
    Transaction = apps.get_model('pos', 'Transaction')

    Transaction.objects.filter(is_completed=False).update(
        is_completed=True,
    )

    Transaction.objects.filter(completed_at__isnull=True).update(
        completed_at=timezone.now(),
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0012_transaction_completed_at_transaction_customer_name_and_more'),
    ]

    operations = [
        migrations.RunPython(mark_existing_transactions_completed, noop_reverse),
    ]
