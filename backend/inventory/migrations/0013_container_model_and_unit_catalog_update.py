from decimal import Decimal
import re

import django.db.models.deletion
from django.db import migrations, models


def build_container_unit_name(raw_name):
    slug = re.sub(r'[^a-z0-9]+', '-', str(raw_name or '').strip().lower()).strip('-')
    if not slug:
        slug = 'container'
    return f"container::{slug}"


def sync_unit_catalog_and_seed_containers(apps, schema_editor):
    Dimension = apps.get_model("inventory", "Dimension")
    Unit = apps.get_model("inventory", "Unit")
    Ingredient = apps.get_model("inventory", "Ingredient")
    IngredientUnitConversion = apps.get_model("inventory", "IngredientUnitConversion")
    Container = apps.get_model("inventory", "Container")

    dimensions = {
        "weight": Dimension.objects.get_or_create(name="weight")[0],
        "volume": Dimension.objects.get_or_create(name="volume")[0],
        "count": Dimension.objects.get_or_create(name="count")[0],
    }

    static_units = [
        ("mg", "Milligram", "weight", Decimal("0.001"), False),
        ("g", "Gram", "weight", Decimal("1"), True),
        ("kg", "Kilogram", "weight", Decimal("1000"), False),
        ("lb", "Pound", "weight", Decimal("453.592"), False),
        ("ml", "Milliliter", "volume", Decimal("1"), True),
        ("l", "Liter", "volume", Decimal("1000"), False),
        ("cup", "Cup", "volume", Decimal("240"), False),
        ("bottle", "Bottle", "volume", Decimal("1000"), False),
        ("pcs", "Piece", "count", Decimal("1"), True),
        ("stick", "Stick", "count", Decimal("1"), False),
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
    referenced_unit_ids.update(Container.objects.values_list("unit_id", flat=True))

    for unit_id in referenced_unit_ids:
        if unit_id:
            keep_ids.add(unit_id)

    if keep_ids:
        Unit.objects.exclude(id__in=keep_ids).delete()

    default_containers = [
        ("Teaspoon", "tsp"),
        ("Tablespoon", "tbsp"),
        ("Cup", "cup"),
        ("Bottle", "btl"),
    ]

    for name, symbol in default_containers:
        container = Container.objects.filter(name__iexact=name).first()
        if container is not None:
            container.symbol = symbol
            container.save(update_fields=["symbol"])
            continue

        base_name = build_container_unit_name(name)
        candidate = base_name
        suffix = 2

        while Unit.objects.filter(name__iexact=candidate).exists():
            candidate = f"{base_name}-{suffix}"
            suffix += 1

        unit = Unit.objects.create(
            name=candidate,
            symbol=symbol,
            dimension=dimensions["count"],
            to_base_factor=Decimal("1"),
            is_base=False,
        )

        Container.objects.create(
            name=name,
            symbol=symbol,
            unit=unit,
        )


def noop_reverse(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0012_trim_static_unit_catalog"),
    ]

    operations = [
        migrations.CreateModel(
            name="Container",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
                ("symbol", models.CharField(blank=True, default="", max_length=20)),
                (
                    "unit",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="container_definition",
                        to="inventory.unit",
                    ),
                ),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.RunPython(sync_unit_catalog_and_seed_containers, reverse_code=noop_reverse),
    ]
