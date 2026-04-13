from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0018_orderpremaderecipe'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('reference_number', 'Reference Number'), ('paymongo', 'PayMongo')], default='reference_number', max_length=30),
        ),
    ]
