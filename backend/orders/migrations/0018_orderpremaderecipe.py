from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0014_sync_unit_catalog_for_dimension_picker'),
        ('orders', '0017_cake_times_ordered'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderPremadeRecipe',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('cake', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='order_premade_recipes', to='orders.cake')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='premade_recipes', to='orders.order')),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='premade_order_recipes', to='inventory.recipe')),
            ],
            options={
                'ordering': ['created_at', 'id'],
            },
        ),
    ]
