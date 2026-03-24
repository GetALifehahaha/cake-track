from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0021_productvariant_recipe_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='discount',
            name='start_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='discount',
            name='end_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
