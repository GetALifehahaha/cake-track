from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework.serializers import ValidationError

from .conversions import get_unit_conversion_factor
from .models import Ingredient, IngredientUnitConversion, Recipe, RecipeIngredient, Transaction, Unit
from .serializers import IngredientSerializer, RecipeSerializer, TransactionCreateSerializer
from .services import deduct_ingredient_stock


class ConversionUtilityTests(TestCase):
	def setUp(self):
		self.kg = Unit.objects.create(name='Kilogram', abbreviation='kg', dimension='mass', multiplier_to_reference=Decimal('1000'))
		self.g = Unit.objects.create(name='Gram', abbreviation='g', dimension='mass', multiplier_to_reference=Decimal('1'))
		self.cup = Unit.objects.create(name='Cup', abbreviation='cup', dimension='volume', multiplier_to_reference=Decimal('1'))

		self.flour = Ingredient.objects.create(name='Flour', total_stock=Decimal('10'), unit=self.kg)
		IngredientUnitConversion.objects.create(
			ingredient=self.flour,
			from_unit=self.cup,
			multiplier_to_base=Decimal('0.2')
		)

	def test_same_dimension_conversion_factor(self):
		self.assertEqual(get_unit_conversion_factor(self.g, self.kg), Decimal('0.001'))
		self.assertEqual(get_unit_conversion_factor(self.kg, self.g), Decimal('1000'))

	def test_cross_dimension_conversion_factor_with_override(self):
		self.assertEqual(get_unit_conversion_factor(self.cup, self.kg, ingredient=self.flour), Decimal('0.2'))
		self.assertEqual(get_unit_conversion_factor(self.kg, self.cup, ingredient=self.flour), Decimal('5'))

	def test_cross_dimension_conversion_factor_without_override_raises(self):
		sugar = Ingredient.objects.create(name='Sugar', total_stock=Decimal('3'), unit=self.kg)
		with self.assertRaises(ValidationError):
			get_unit_conversion_factor(self.cup, self.kg, ingredient=sugar)


class RecipeSerializerConversionTests(TestCase):
	def setUp(self):
		self.kg = Unit.objects.create(name='Kilogram', abbreviation='kg', dimension='mass', multiplier_to_reference=Decimal('1000'))
		self.cup = Unit.objects.create(name='Cup', abbreviation='cup', dimension='volume', multiplier_to_reference=Decimal('1'))

		self.flour = Ingredient.objects.create(name='Flour', total_stock=Decimal('10'), unit=self.kg)
		IngredientUnitConversion.objects.create(
			ingredient=self.flour,
			from_unit=self.cup,
			multiplier_to_base=Decimal('0.2')
		)

	def test_recipe_serializer_normalizes_input_unit_to_base(self):
		serializer = RecipeSerializer(data={
			'name': 'Cake Base',
			'instructions': 'Mix well',
			'ingredients': [
				{
					'ingredient_id': self.flour.id,
					'amount_needed': '2',
					'input_unit_id': self.cup.id,
				}
			],
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		recipe = serializer.save()

		recipe_ingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=self.flour)
		self.assertEqual(recipe_ingredient.amount_needed, Decimal('0.4'))

	def test_recipe_serializer_rejects_cross_dimension_without_conversion(self):
		sugar = Ingredient.objects.create(name='Sugar', total_stock=Decimal('5'), unit=self.kg)

		serializer = RecipeSerializer(data={
			'name': 'Sugar Mix',
			'instructions': 'Mix sugar',
			'ingredients': [
				{
					'ingredient_id': sugar.id,
					'amount_needed': '1',
					'input_unit_id': self.cup.id,
				}
			],
		})

		self.assertFalse(serializer.is_valid())
		self.assertIn('ingredients', serializer.errors)


class IngredientUnitAutoConversionTests(TestCase):
	def setUp(self):
		self.kg = Unit.objects.create(name='Kilogram', abbreviation='kg', dimension='mass', multiplier_to_reference=Decimal('1000'))
		self.g = Unit.objects.create(name='Gram', abbreviation='g', dimension='mass', multiplier_to_reference=Decimal('1'))
		self.cup = Unit.objects.create(name='Cup', abbreviation='cup', dimension='volume', multiplier_to_reference=Decimal('1'))

		self.ingredient = Ingredient.objects.create(name='Flour', total_stock=Decimal('2'), unit=self.kg)
		IngredientUnitConversion.objects.create(
			ingredient=self.ingredient,
			from_unit=self.cup,
			multiplier_to_base=Decimal('0.2')
		)

		Transaction.objects.create(
			ingredient=self.ingredient,
			amount=Decimal('2'),
			remaining_amount=Decimal('2'),
			transaction_type='in',
			purchase_date=timezone.now().date(),
			expiration_date=timezone.now().date(),
		)

		recipe = Recipe.objects.create(name='Bread', instructions='Bake')
		RecipeIngredient.objects.create(recipe=recipe, ingredient=self.ingredient, amount_needed=Decimal('0.5'))

	def test_updating_ingredient_base_unit_auto_converts_related_values(self):
		serializer = IngredientSerializer(
			instance=self.ingredient,
			data={
				'name': self.ingredient.name,
				'unit_id': self.g.id,
			},
			partial=True,
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		updated = serializer.save()

		updated.refresh_from_db()

		in_batch = updated.transactions.get(transaction_type='in')
		recipe_ingredient = RecipeIngredient.objects.get(ingredient=updated)
		conversion = updated.conversions.get(from_unit=self.cup)

		self.assertEqual(updated.total_stock, Decimal('2000'))
		self.assertEqual(in_batch.amount, Decimal('2000'))
		self.assertEqual(in_batch.remaining_amount, Decimal('2000'))
		self.assertEqual(recipe_ingredient.amount_needed, Decimal('500'))
		self.assertEqual(conversion.multiplier_to_base, Decimal('200'))


class InventoryReasonAndCostTests(TestCase):
	def setUp(self):
		self.kg = Unit.objects.create(name='Kilogram-2', abbreviation='kg2', dimension='mass', multiplier_to_reference=Decimal('1000'))
		self.ingredient = Ingredient.objects.create(name='Butter', total_stock=Decimal('5'), unit=self.kg)

		Transaction.objects.create(
			ingredient=self.ingredient,
			amount=Decimal('5'),
			remaining_amount=Decimal('5'),
			transaction_type='in',
			purchase_date=timezone.now().date(),
			expiration_date=timezone.now().date(),
			unit_purchase_price=Decimal('120.00'),
		)

	def test_manual_out_requires_reason(self):
		serializer = TransactionCreateSerializer(data={
			'transactions': [
				{
					'ingredient_id': self.ingredient.id,
					'amount': '1',
					'transaction_type': 'out',
					'purchase_date': str(timezone.now().date()),
				}
			]
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		with self.assertRaises(ValidationError):
			serializer.save()

	def test_automatic_deduction_persists_reason(self):
		reason = 'Stock out done for transaction #TRX0001.'
		stock_out = deduct_ingredient_stock(
			ingredient=self.ingredient,
			amount=Decimal('1'),
			purchase_date=timezone.now().date(),
			reason=reason,
		)

		self.assertEqual(stock_out.reason, reason)
