from django.db import migrations, models
import django.db.models.deletion


def forward_copy_product_recipe_to_variants(apps, schema_editor):
    Product = apps.get_model('pos', 'Product')
    ProductVariant = apps.get_model('pos', 'ProductVariant')

    for product in Product.objects.all().iterator():
        variants = ProductVariant.objects.filter(product_id=product.id)

        if product.recipe_id:
            variants.filter(recipe_id__isnull=True).update(
                recipe_id=product.recipe_id,
                has_recipe=True,
            )

        has_variant_recipe = variants.filter(recipe_id__isnull=False).exists()
        if product.has_recipe != has_variant_recipe:
            Product.objects.filter(id=product.id).update(has_recipe=has_variant_recipe)


def reverse_sync_product_has_recipe(apps, schema_editor):
    Product = apps.get_model('pos', 'Product')
    ProductVariant = apps.get_model('pos', 'ProductVariant')

    for product in Product.objects.all().iterator():
        has_variant_recipe = ProductVariant.objects.filter(
            product_id=product.id,
            recipe_id__isnull=False,
        ).exists()
        if product.has_recipe != has_variant_recipe:
            Product.objects.filter(id=product.id).update(has_recipe=has_variant_recipe)


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0005_ensure_cost_amount_column'),
        ('pos', '0020_alter_discount_end_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='productvariant',
            name='has_recipe',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='recipe',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pos_product_variants', to='inventory.recipe'),
        ),
        migrations.RunPython(forward_copy_product_recipe_to_variants, reverse_sync_product_has_recipe),
    ]
