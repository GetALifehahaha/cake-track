from decimal import Decimal

from rest_framework.serializers import ValidationError

from .models import IngredientUnitConversion, Unit


def _find_direct_conversion(ingredient, from_unit: Unit, to_unit: Unit):
    conversion = IngredientUnitConversion.objects.filter(
        ingredient=ingredient,
        from_unit=from_unit,
        to_unit=to_unit,
    ).first()

    if not conversion:
        return None

    return Decimal(str(conversion.factor))


def get_unit_conversion_factor(from_unit: Unit, to_unit: Unit, ingredient=None) -> Decimal:
    if from_unit.id == to_unit.id:
        return Decimal('1')

    if ingredient is not None:
        direct_factor = _find_direct_conversion(ingredient, from_unit, to_unit)
        if direct_factor is not None:
            return direct_factor

        reverse_factor = _find_direct_conversion(ingredient, to_unit, from_unit)
        if reverse_factor is not None and reverse_factor != 0:
            return Decimal('1') / reverse_factor

        base_unit = ingredient.unit
        from_to_base = Decimal('1') if from_unit.id == base_unit.id else _find_direct_conversion(ingredient, from_unit, base_unit)
        to_to_base = Decimal('1') if to_unit.id == base_unit.id else _find_direct_conversion(ingredient, to_unit, base_unit)

        if from_to_base is not None and to_to_base is not None and to_to_base != 0:
            return from_to_base / to_to_base

    if from_unit.dimension_id == to_unit.dimension_id:
        from_multiplier = Decimal(str(from_unit.to_base_factor))
        to_multiplier = Decimal(str(to_unit.to_base_factor))

        if to_multiplier == 0:
            raise ValidationError("Target unit multiplier cannot be zero.")

        return from_multiplier / to_multiplier

    if ingredient is None:
        raise ValidationError(
            f"Cannot convert {from_unit.name} to {to_unit.name} without ingredient-specific conversion settings."
        )

    raise ValidationError(
        f"No container mapping found for {ingredient.name}: {from_unit.name} -> {to_unit.name}."
    )
