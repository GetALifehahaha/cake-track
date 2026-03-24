from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0006_transaction_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='ingredient',
            name='low_amount',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
