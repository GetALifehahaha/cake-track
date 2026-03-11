from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='payment_type',
            field=models.CharField(
                choices=[('downpayment', 'Downpayment'), ('full_payment', 'Full Payment')],
                default='downpayment',
                max_length=20,
            ),
        ),
    ]
