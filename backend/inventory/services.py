from decimal import Decimal

from django.db import transaction
from rest_framework.serializers import ValidationError

from .models import Ingredient, Transaction


def deduct_ingredient_stock(ingredient: Ingredient, amount: Decimal, purchase_date=None, reason=None):
    if amount <= Decimal('0'):
        raise ValidationError(f"Amount to deduct must be greater than zero for {ingredient.name}.")

    out_count = Decimal(str(amount))
    total_cost = Decimal('0.00')

    batches = ingredient.transactions.filter(
        transaction_type='in',
        remaining_amount__gt=0,
    ).order_by('expiration_date', 'purchase_date')

    for batch in batches:
        if out_count <= 0:
            break

        if batch.remaining_amount > out_count:
            deducted_amount = out_count
            batch.remaining_amount -= out_count
            batch.save(update_fields=['remaining_amount'])
            out_count = Decimal('0')
        else:
            deducted_amount = batch.remaining_amount
            out_count -= batch.remaining_amount
            batch.remaining_amount = Decimal('0')
            batch.save(update_fields=['remaining_amount'])

        batch_price = Decimal(str(batch.unit_purchase_price or '0.00'))
        total_cost += deducted_amount * batch_price

    if out_count > 0:
        raise ValidationError(f"Not enough stock for: {ingredient.name}")

    transaction_object = Transaction.objects.create(
        ingredient=ingredient,
        amount=amount,
        remaining_amount=Decimal('0'),
        transaction_type='out',
        purchase_date=purchase_date,
        reason=reason,
        cost_amount=total_cost,
    )

    ingredient.total_stock -= amount
    if ingredient.total_stock < Decimal('0'):
        ingredient.total_stock = Decimal('0')
    ingredient.save(update_fields=['total_stock'])

    return transaction_object


def deduct_ingredient_totals(ingredient_totals: dict, purchase_date=None, reason=None):
    created_transactions = []

    with transaction.atomic():
        for ingredient_id, amount in ingredient_totals.items():
            ingredient = Ingredient.objects.get(id=ingredient_id)
            created_transactions.append(
                deduct_ingredient_stock(
                    ingredient=ingredient,
                    amount=Decimal(str(amount)),
                    purchase_date=purchase_date,
                    reason=reason,
                )
            )

    return created_transactions
