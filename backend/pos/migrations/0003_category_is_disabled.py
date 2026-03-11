from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0002_alter_transaction_order_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_disabled',
            field=models.BooleanField(default=False),
        ),
    ]
