from decimal import Decimal

from rest_framework.serializers import ValidationError

from .models import IngredientUnitConversion, Unit


def get_unit_conversion_factor(from_unit: Unit, to_unit: Unit, ingredient=None) -> Decimal:
    if from_unit.id == to_unit.id:
        return Decimal('1')

    if ingredient is None:
        raise ValidationError(
            f"Cannot convert {from_unit.name} to {to_unit.name} without ingredient-specific conversion settings."
        )

    base_unit = ingredient.unit

    if from_unit.id != base_unit.id and to_unit.id == base_unit.id:
        conversion = IngredientUnitConversion.objects.filter(
            ingredient=ingredient,
            from_unit=from_unit,
        ).first()
        if conversion:
            return Decimal(str(conversion.multiplier_to_base))

    if from_unit.id == base_unit.id and to_unit.id != base_unit.id:
        conversion = IngredientUnitConversion.objects.filter(
            ingredient=ingredient,
            from_unit=to_unit,
        ).first()
        if conversion and Decimal(str(conversion.multiplier_to_base)) != 0:
            return Decimal('1') / Decimal(str(conversion.multiplier_to_base))

    if from_unit.id != base_unit.id and to_unit.id != base_unit.id:
        source = IngredientUnitConversion.objects.filter(
            ingredient=ingredient,
            from_unit=from_unit,
        ).first()
        target = IngredientUnitConversion.objects.filter(
            ingredient=ingredient,
            from_unit=to_unit,
        ).first()

        if source and target and Decimal(str(target.multiplier_to_base)) != 0:
            return Decimal(str(source.multiplier_to_base)) / Decimal(str(target.multiplier_to_base))

    if from_unit.dimension == to_unit.dimension:
        from_multiplier = Decimal(str(from_unit.multiplier_to_reference))
        to_multiplier = Decimal(str(to_unit.multiplier_to_reference))

        if to_multiplier == 0:
            raise ValidationError("Target unit multiplier cannot be zero.")

        return from_multiplier / to_multiplier

    raise ValidationError(
        f"No conversion rule found for {ingredient.name}: {from_unit.name} -> {to_unit.name}."
    )
