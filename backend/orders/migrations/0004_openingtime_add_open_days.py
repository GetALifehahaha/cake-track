from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_openingtime'),
    ]

    operations = [
        migrations.AddField(
            model_name='openingtime',
            name='open_days',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='openingtime',
            name='start_time',
            field=models.TimeField(default='08:00'),
        ),
        migrations.AlterField(
            model_name='openingtime',
            name='end_time',
            field=models.TimeField(default='17:00'),
        ),
    ]
