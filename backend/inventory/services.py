from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.serializers import ValidationError

from .models import Ingredient, Transaction


def get_available_batches_queryset(ingredient: Ingredient, as_of_date=None):
    """Return FIFO-ordered IN batches that still have stock and are not expired."""
    reference_date = as_of_date or timezone.localdate()

    return ingredient.transactions.filter(
        transaction_type='in',
        remaining_amount__gt=0,
    ).filter(
        Q(expiration_date__isnull=True) | Q(expiration_date__gt=reference_date),
    ).order_by('expiration_date', 'purchase_date', 'id')


def get_ingredient_available_stock(ingredient: Ingredient, as_of_date=None) -> Decimal:
    """Compute usable stock from non-expired batches for a single ingredient."""
    total = get_available_batches_queryset(ingredient, as_of_date).aggregate(
        total=Sum('remaining_amount')
    )['total']

    return Decimal(str(total or '0'))


def get_available_stock_by_ingredient_ids(ingredient_ids, as_of_date=None):
    """Compute usable stock by ingredient id from non-expired batches."""
    ids = [int(ingredient_id) for ingredient_id in ingredient_ids]
    if not ids:
        return {}

    reference_date = as_of_date or timezone.localdate()

    rows = Transaction.objects.filter(
        ingredient_id__in=ids,
        transaction_type='in',
        remaining_amount__gt=0,
    ).filter(
        Q(expiration_date__isnull=True) | Q(expiration_date__gt=reference_date),
    ).values('ingredient_id').annotate(
        available_stock=Sum('remaining_amount')
    )

    stock_map = {row['ingredient_id']: Decimal(str(row['available_stock'] or '0')) for row in rows}

    for ingredient_id in ids:
        stock_map.setdefault(ingredient_id, Decimal('0'))

    return stock_map


def deduct_ingredient_stock(
    ingredient: Ingredient,
    amount: Decimal,
    purchase_date=None,
    reason=None,
    exclude_expired=False,
    locked_ingredient=None,
):
    ingredient_obj = locked_ingredient or ingredient
    if transaction.get_connection().in_atomic_block and locked_ingredient is None:
        ingredient_obj = Ingredient.objects.select_for_update().get(id=ingredient.id)

    if amount <= Decimal('0'):
        raise ValidationError(f"Amount to deduct must be greater than zero for {ingredient_obj.name}.")

    requested_amount = Decimal(str(amount))
    out_count = requested_amount
    total_cost = Decimal('0.00')
    in_atomic_block = transaction.get_connection().in_atomic_block

    if exclude_expired:
        batches = get_available_batches_queryset(ingredient_obj)
    else:
        batches = ingredient_obj.transactions.filter(
            transaction_type='in',
            remaining_amount__gt=0,
        ).order_by('expiration_date', 'purchase_date', 'id')

    if in_atomic_block:
        batches = batches.select_for_update()

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
        available_amount = requested_amount - out_count
        stock_label = 'non-expired stock' if exclude_expired else 'stock'
        raise ValidationError({
            'detail': 'Insufficient ingredient stock for one or more items.',
            'error_code': 'insufficient_ingredient_stock',
            'transaction_items': [
                f"Not enough {stock_label} for: {ingredient_obj.name}. Need {requested_amount}, Have {available_amount}"
            ],
        })

    transaction_object = Transaction.objects.create(
        ingredient=ingredient_obj,
        amount=amount,
        remaining_amount=Decimal('0'),
        transaction_type='out',
        purchase_date=purchase_date,
        reason=reason,
        cost_amount=total_cost,
    )

    ingredient_obj.total_stock -= amount
    if ingredient_obj.total_stock < Decimal('0'):
        ingredient_obj.total_stock = Decimal('0')
    ingredient_obj.save(update_fields=['total_stock'])

    return transaction_object


def deduct_ingredient_totals(
    ingredient_totals: dict,
    purchase_date=None,
    reason=None,
    exclude_expired=False,
    locked_ingredients=None,
):
    created_transactions = []
    locked_ingredients_map = dict(locked_ingredients or {})

    with transaction.atomic():
        ingredient_ids = sorted(int(ingredient_id) for ingredient_id in ingredient_totals.keys())
        missing_ids = [
            ingredient_id for ingredient_id in ingredient_ids
            if ingredient_id not in locked_ingredients_map
        ]

        if missing_ids:
            for ingredient in Ingredient.objects.select_for_update().filter(id__in=missing_ids).order_by('id'):
                locked_ingredients_map[ingredient.id] = ingredient

        for ingredient_id in ingredient_ids:
            amount = ingredient_totals.get(ingredient_id)
            ingredient = locked_ingredients_map.get(ingredient_id)

            if ingredient is None:
                raise ValidationError({
                    'detail': 'Insufficient ingredient stock for one or more items.',
                    'error_code': 'insufficient_ingredient_stock',
                    'transaction_items': [f'Ingredient #{ingredient_id} no longer exists.'],
                })

            created_transactions.append(
                deduct_ingredient_stock(
                    ingredient=ingredient,
                    amount=Decimal(str(amount)),
                    purchase_date=purchase_date,
                    reason=reason,
                    exclude_expired=exclude_expired,
                    locked_ingredient=ingredient,
                )
            )

    return created_transactions
