from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_userprofile_activation_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='deactivated_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]
