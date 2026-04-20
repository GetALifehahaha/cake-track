from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0014_sync_unit_catalog_for_dimension_picker"),
    ]

    operations = [
        migrations.AddField(
            model_name="ingredient",
            name="near_expiration_days",
            field=models.PositiveIntegerField(default=7),
        ),
    ]
