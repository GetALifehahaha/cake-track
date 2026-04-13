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
):
    if amount <= Decimal('0'):
        raise ValidationError(f"Amount to deduct must be greater than zero for {ingredient.name}.")

    out_count = Decimal(str(amount))
    total_cost = Decimal('0.00')

    if exclude_expired:
        batches = get_available_batches_queryset(ingredient)
    else:
        batches = ingredient.transactions.filter(
            transaction_type='in',
            remaining_amount__gt=0,
        ).order_by('expiration_date', 'purchase_date', 'id')

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
        if exclude_expired:
            raise ValidationError(f"Not enough non-expired stock for: {ingredient.name}")

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


def deduct_ingredient_totals(
    ingredient_totals: dict,
    purchase_date=None,
    reason=None,
    exclude_expired=False,
):
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
                    exclude_expired=exclude_expired,
                )
            )

    return created_transactions
