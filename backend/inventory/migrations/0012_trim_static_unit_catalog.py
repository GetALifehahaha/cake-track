from decimal import Decimal

from django.db import migrations


def trim_static_unit_catalog(apps, schema_editor):
    Dimension = apps.get_model("inventory", "Dimension")
    Unit = apps.get_model("inventory", "Unit")
    Ingredient = apps.get_model("inventory", "Ingredient")
    IngredientUnitConversion = apps.get_model("inventory", "IngredientUnitConversion")

    dimensions = {
        "weight": Dimension.objects.get_or_create(name="weight")[0],
        "volume": Dimension.objects.get_or_create(name="volume")[0],
        "count": Dimension.objects.get_or_create(name="count")[0],
    }

    static_units = [
        ("g", "Gram", "weight", Decimal("1"), True),
        ("kg", "Kilogram", "weight", Decimal("1000"), False),
        ("ml", "Milliliter", "volume", Decimal("1"), True),
        ("L", "Liter", "volume", Decimal("1000"), False),
        ("tsp", "Teaspoon", "volume", Decimal("5"), False),
        ("tbsp", "Tablespoon", "volume", Decimal("15"), False),
        ("cup", "Cup", "volume", Decimal("240"), False),
        ("pcs", "Piece", "count", Decimal("1"), True),
        ("dozen", "Dozen", "count", Decimal("12"), False),
    ]

    for dimension in dimensions.values():
        Unit.objects.filter(dimension=dimension).update(is_base=False)

    keep_ids = set()

    for symbol, name, dimension_name, factor, is_base in static_units:
        dimension = dimensions[dimension_name]

        unit = Unit.objects.filter(symbol__iexact=symbol).first()
        if unit is None:
            unit = Unit.objects.filter(name__iexact=name).first()

        if unit is None:
            unit = Unit.objects.create(
                name=name,
                symbol=symbol,
                dimension=dimension,
                to_base_factor=factor,
                is_base=is_base,
            )
        else:
            unit.name = name
            unit.symbol = symbol
            unit.dimension = dimension
            unit.to_base_factor = factor
            unit.is_base = is_base
            unit.save(update_fields=["name", "symbol", "dimension", "to_base_factor", "is_base"])

        keep_ids.add(unit.id)

    referenced_unit_ids = set(Ingredient.objects.values_list("unit_id", flat=True))
    referenced_unit_ids.update(IngredientUnitConversion.objects.values_list("from_unit_id", flat=True))
    referenced_unit_ids.update(IngredientUnitConversion.objects.values_list("to_unit_id", flat=True))

    for unit_id in referenced_unit_ids:
        if unit_id:
            keep_ids.add(unit_id)

    if keep_ids:
        Unit.objects.exclude(id__in=keep_ids).delete()


def noop_reverse(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0011_seed_static_unit_catalog"),
    ]

    operations = [
        migrations.RunPython(trim_static_unit_catalog, reverse_code=noop_reverse),
    ]
