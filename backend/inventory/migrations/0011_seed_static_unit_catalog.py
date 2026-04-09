from decimal import Decimal

from django.db import migrations


def seed_static_unit_catalog(apps, schema_editor):
    Dimension = apps.get_model("inventory", "Dimension")
    Unit = apps.get_model("inventory", "Unit")

    dimensions = {
        "weight": Dimension.objects.get_or_create(name="weight")[0],
        "volume": Dimension.objects.get_or_create(name="volume")[0],
        "count": Dimension.objects.get_or_create(name="count")[0],
    }

    static_units = [
        ("mg", "Milligram", "weight", Decimal("0.001"), False),
        ("g", "Gram", "weight", Decimal("1"), True),
        ("kg", "Kilogram", "weight", Decimal("1000"), False),
        ("oz", "Ounce", "weight", Decimal("28.3495"), False),
        ("lb", "Pound", "weight", Decimal("453.592"), False),
        ("ml", "Milliliter", "volume", Decimal("1"), True),
        ("L", "Liter", "volume", Decimal("1000"), False),
        ("tsp", "Teaspoon", "volume", Decimal("5"), False),
        ("tbsp", "Tablespoon", "volume", Decimal("15"), False),
        ("cup", "Cup", "volume", Decimal("240"), False),
        ("fl oz", "Fluid Ounce", "volume", Decimal("29.5735"), False),
        ("pt", "Pint", "volume", Decimal("473.176"), False),
        ("qt", "Quart", "volume", Decimal("946.353"), False),
        ("gal", "Gallon", "volume", Decimal("3785.41"), False),
        ("pcs", "Piece", "count", Decimal("1"), True),
        ("dozen", "Dozen", "count", Decimal("12"), False),
        ("pack", "Pack", "count", Decimal("1"), False),
        ("box", "Box", "count", Decimal("1"), False),
        ("bag", "Bag", "count", Decimal("1"), False),
        ("bottle", "Bottle", "count", Decimal("1"), False),
        ("can", "Can", "count", Decimal("1"), False),
        ("jar", "Jar", "count", Decimal("1"), False),
        ("sachet", "Sachet", "count", Decimal("1"), False),
        ("tray", "Tray", "count", Decimal("1"), False),
        ("roll", "Roll", "count", Decimal("1"), False),
        ("slice", "Slice", "count", Decimal("1"), False),
    ]

    for symbol, name, dimension_name, factor, is_base in static_units:
        dimension = dimensions[dimension_name]

        unit = Unit.objects.filter(symbol__iexact=symbol).first()
        if unit is None:
            unit = Unit.objects.filter(name__iexact=name).first()

        if unit is None:
            Unit.objects.create(
                name=name,
                symbol=symbol,
                dimension=dimension,
                to_base_factor=factor,
                is_base=is_base,
            )
            continue

        unit.name = name
        unit.symbol = symbol
        unit.dimension = dimension
        unit.to_base_factor = factor
        unit.is_base = is_base
        unit.save(update_fields=["name", "symbol", "dimension", "to_base_factor", "is_base"])


def noop_reverse(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0010_dimension_inventory_item_itemunitconversion_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_static_unit_catalog, reverse_code=noop_reverse),
    ]
