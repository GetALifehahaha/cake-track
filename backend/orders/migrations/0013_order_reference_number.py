from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0012_alter_cake_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='reference_number',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
