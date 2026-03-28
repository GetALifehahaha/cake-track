from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_cake_recipe'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
