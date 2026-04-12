from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0016_order_hidden_by_customer'),
    ]

    operations = [
        migrations.AddField(
            model_name='cake',
            name='times_ordered',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
