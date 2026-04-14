from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase, APIClient
from decimal import Decimal
from django.contrib.auth.models import Group, User
from django.utils import timezone
from .models import Category, Product, ProductVariant, Discount, Transaction, TransactionItem, DiscountUsage, RegisterMoney
from .serializers import TransactionCreateSerializer
from inventory.models import Recipe, Ingredient, RecipeIngredient, Unit, Transaction as InventoryTransaction

class TransactionCreationTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.cashier = User.objects.create_user(username="cashier1", password="password123")
        
        self.category_shirts = Category.objects.create(name="Shirts")
        self.category_pants = Category.objects.create(name="Pants")
        
        self.product_a = Product.objects.create(name="Graphic Tee")
        self.product_a.categories.add(self.category_shirts)
        self.variant_a = ProductVariant.objects.create(product=self.product_a, label="Large", price=Decimal("500.00"))
        
        self.product_b = Product.objects.create(name="Jeans")
        self.product_b.categories.add(self.category_pants)
        self.variant_b = ProductVariant.objects.create(product=self.product_b, label="Medium", price=Decimal("1000.00"))

        self.discount_all = Discount.objects.create(
            name="10% Off Everything",
            discount_type="percentage",
            value=Decimal("10.00"),
            scope="all_products",
            min_order_total=Decimal("0.00")
        )

        self.discount_selected = Discount.objects.create(
            name="100 Off Shirts",
            discount_type="fixed",
            value=Decimal("100.00"),
            scope="selected_products",
            min_order_total=Decimal("0.00")
        )
        self.discount_selected.products.add(self.product_a)

    def test_transaction_without_discount(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "cash",
            "paid_amount": Decimal("2000.00"),
            "order_type": "dine-in",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1},
                {"product": self.product_b.id, "product_variant": self.variant_b.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertEqual(transaction.gross_total, Decimal("1500.00"))
        self.assertEqual(transaction.discount_amount, Decimal("0.00"))
        self.assertEqual(transaction.net_total, Decimal("1500.00"))
        self.assertEqual(transaction.change, Decimal("500.00"))

    def test_transaction_with_percentage_discount_all_products(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "discount": self.discount_all.id,
            "payment_method": "cash",
            "paid_amount": Decimal("1500.00"),
            "order_type": "dine-in",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 2} 
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertEqual(transaction.gross_total, Decimal("1000.00"))
        self.assertEqual(transaction.discount_amount, Decimal("100.00"))
        self.assertEqual(transaction.net_total, Decimal("900.00"))
        
        self.discount_all.refresh_from_db()
        self.assertEqual(self.discount_all.used_count, 1)
        self.assertTrue(DiscountUsage.objects.filter(transaction=transaction).exists())

    def test_transaction_with_fixed_discount_selected_products(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "discount": self.discount_selected.id,
            "payment_method": "cash",
            "paid_amount": Decimal("1500.00"),
            "order_type": "dine-in",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1},
                {"product": self.product_b.id, "product_variant": self.variant_b.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertEqual(transaction.gross_total, Decimal("1500.00"))
        self.assertEqual(transaction.discount_amount, Decimal("100.00"))
        self.assertEqual(transaction.net_total, Decimal("1400.00"))

        item_a = transaction.transaction_items.get(product=self.product_a)
        item_b = transaction.transaction_items.get(product=self.product_b)
        
        self.assertEqual(item_a.discount_amount, Decimal("100.00"))
        self.assertEqual(item_b.discount_amount, Decimal("0.00"))

    def test_discount_minimum_order_validation(self):
        self.discount_all.min_order_total = Decimal("5000.00")
        self.discount_all.save()

        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "discount": self.discount_all.id,
            "payment_method": "cash",
            "paid_amount": Decimal("1000.00"),
            "order_type": "dine-in",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        
        with self.assertRaises(Exception) as context:
            serializer.save()
            
        self.assertTrue("minimum order total" in str(context.exception).lower())

    def test_pending_transaction_defaults_to_not_completed(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "cash",
            "paid_amount": Decimal("0.00"),
            "order_type": "dine-in",
            "is_completed": False,
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertFalse(transaction.is_completed)
        self.assertIsNone(transaction.completed_at)

    def test_create_completed_transaction_sets_completed_at(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "cash",
            "paid_amount": Decimal("1000.00"),
            "order_type": "dine-in",
            "is_completed": True,
            "customer_name": "Walk-in Customer",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertTrue(transaction.is_completed)
        self.assertIsNotNone(transaction.completed_at)
        self.assertEqual(transaction.customer_name, "Walk-in Customer")

    def test_void_transaction_is_auto_completed(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "cash",
            "paid_amount": Decimal("0.00"),
            "order_type": "dine-in",
            "is_void": True,
            "is_completed": False,
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertTrue(transaction.is_void)
        self.assertTrue(transaction.is_completed)
        self.assertIsNotNone(transaction.completed_at)

    def test_gcash_transaction_requires_reference_number(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "gcash",
            "paid_amount": Decimal("500.00"),
            "order_type": "dine-in",
            "is_completed": False,
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

        with self.assertRaises(Exception) as context:
            serializer.save()

        self.assertIn("Reference number is required for GCash payments", str(context.exception))

    def test_gcash_transaction_with_reference_number_succeeds(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        data = {
            "payment_method": "gcash",
            "paid_amount": Decimal("500.00"),
            "order_type": "dine-in",
            "is_completed": False,
            "payment_reference_number": "pay_1234567890",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()

        self.assertEqual(transaction.payment_method, "gcash")
        self.assertEqual(transaction.payment_reference_number, "pay_1234567890")

    def test_daily_order_sequence_increments_globally(self):
        request = self.factory.post('/transactions/')
        request.user = self.cashier

        base_payload = {
            "payment_method": "cash",
            "order_type": "dine-in",
            "transaction_items": [
                {"product": self.product_a.id, "product_variant": self.variant_a.id, "quantity": 1}
            ]
        }

        first = TransactionCreateSerializer(
            data={**base_payload, "paid_amount": Decimal("0.00"), "is_completed": False},
            context={'request': request},
        )
        self.assertTrue(first.is_valid(), first.errors)
        first_tx = first.save()

        second = TransactionCreateSerializer(
            data={**base_payload, "paid_amount": Decimal("500.00"), "is_completed": True},
            context={'request': request},
        )
        self.assertTrue(second.is_valid(), second.errors)
        second_tx = second.save()

        third = TransactionCreateSerializer(
            data={**base_payload, "paid_amount": Decimal("0.00"), "is_completed": False},
            context={'request': request},
        )
        self.assertTrue(third.is_valid(), third.errors)
        third_tx = third.save()

        self.assertEqual(first_tx.sequence_number, 1)
        self.assertEqual(second_tx.sequence_number, 2)
        self.assertEqual(third_tx.sequence_number, 3)
        self.assertEqual(first_tx.sequence_date, second_tx.sequence_date)
        self.assertEqual(second_tx.sequence_date, third_tx.sequence_date)

    def test_transaction_with_recipe_includes_recipe_name_in_deduction_reason(self):
        """Verify that ingredient deductions include recipe names in the reason field."""
        # Create units and ingredients with sufficient stock
        kg_unit = Unit.objects.create(name='Kilogram', abbreviation='kg', dimension='mass', multiplier_to_reference=Decimal('1000'))
        butter = Ingredient.objects.create(name='Butter', total_stock=Decimal('100'), unit=kg_unit)
        flour = Ingredient.objects.create(name='Flour', total_stock=Decimal('200'), unit=kg_unit)
        
        # Create inventory transactions to provide stock
        InventoryTransaction.objects.create(
            ingredient=butter,
            amount=Decimal('100'),
            remaining_amount=Decimal('100'),
            transaction_type='in',
            purchase_date=timezone.now().date(),
            unit_purchase_price=Decimal('50.00'),
        )
        InventoryTransaction.objects.create(
            ingredient=flour,
            amount=Decimal('200'),
            remaining_amount=Decimal('200'),
            transaction_type='in',
            purchase_date=timezone.now().date(),
            unit_purchase_price=Decimal('20.00'),
        )
        
        # Create a recipe with ingredients
        cake_recipe = Recipe.objects.create(name='Chocolate Cake', is_temporary=False)
        RecipeIngredient.objects.create(recipe=cake_recipe, ingredient=butter, amount_needed=Decimal('0.5'))
        RecipeIngredient.objects.create(recipe=cake_recipe, ingredient=flour, amount_needed=Decimal('2.0'))
        
        # Create a product linked to the recipe
        category = Category.objects.create(name="Desserts")
        product_with_recipe = Product.objects.create(name="Chocolate Cake")
        product_with_recipe.categories.add(category)
        variant = ProductVariant.objects.create(
            product=product_with_recipe,
            label="Whole Cake",
            price=Decimal("500.00"),
            has_recipe=True,
            recipe=cake_recipe,
        )
        
        # Create transaction with the recipe product
        request = self.factory.post('/transactions/')
        request.user = self.cashier
        
        data = {
            "payment_method": "cash",
            "paid_amount": Decimal("1000.00"),
            "order_type": "dine-in",
            "is_completed": True,
            "transaction_items": [
                {"product": product_with_recipe.id, "product_variant": variant.id, "quantity": 2}
            ]
        }
        
        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        transaction = serializer.save()
        
        # Verify that inventory transactions were created with recipe name in reason
        butter_deductions = InventoryTransaction.objects.filter(ingredient=butter, transaction_type='out')
        flour_deductions = InventoryTransaction.objects.filter(ingredient=flour, transaction_type='out')
        
        self.assertTrue(butter_deductions.exists(), "Butter deduction not found")
        self.assertTrue(flour_deductions.exists(), "Flour deduction not found")
        
        # Check that reason includes "Chocolate Cake"
        for deduction in butter_deductions:
            self.assertIn("Chocolate Cake", deduction.reason, 
                         f"Recipe name not found in reason: {deduction.reason}")
            self.assertIn(f"Transaction #{transaction.id}", deduction.reason,
                         f"Transaction ID not found in reason: {deduction.reason}")
        
        for deduction in flour_deductions:
            self.assertIn("Chocolate Cake", deduction.reason,
                         f"Recipe name not found in reason: {deduction.reason}")
            self.assertIn(f"Transaction #{transaction.id}", deduction.reason,
                         f"Transaction ID not found in reason: {deduction.reason}")
        
        # Verify stock was deducted correctly (2 cakes, each needs 0.5 kg butter and 2 kg flour)
        butter.refresh_from_db()
        flour.refresh_from_db()
        self.assertEqual(butter.total_stock, Decimal('99'))  # 100 - (0.5 * 2)
        self.assertEqual(flour.total_stock, Decimal('196'))  # 200 - (2 * 2)


class TransactionStockValidationApiTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(username="cashier_stock", password="password123")
        self.client.force_authenticate(user=self.cashier)

        self.mass_unit = Unit.objects.create(
            name='Kilogram',
            abbreviation='kg',
            dimension='mass',
            multiplier_to_reference=Decimal('1000'),
        )
        self.ingredient = Ingredient.objects.create(
            name='Heavy Cream',
            total_stock=Decimal('5'),
            unit=self.mass_unit,
        )
        InventoryTransaction.objects.create(
            ingredient=self.ingredient,
            amount=Decimal('5'),
            remaining_amount=Decimal('5'),
            transaction_type='in',
            purchase_date=timezone.now().date(),
            unit_purchase_price=Decimal('120.00'),
        )

        self.recipe = Recipe.objects.create(name='Cream Slice', is_temporary=False)
        RecipeIngredient.objects.create(
            recipe=self.recipe,
            ingredient=self.ingredient,
            amount_needed=Decimal('5'),
        )

        self.category = Category.objects.create(name='Desserts Stock')
        self.product = Product.objects.create(name='Cream Slice')
        self.product.categories.add(self.category)
        self.variant = ProductVariant.objects.create(
            product=self.product,
            label='Single',
            price=Decimal('250.00'),
            has_recipe=True,
            recipe=self.recipe,
        )

    def _payload(self):
        return {
            'payment_method': 'cash',
            'paid_amount': '300.00',
            'order_type': 'dine-in',
            'is_completed': False,
            'transaction_items': [
                {
                    'product': self.product.id,
                    'product_variant': self.variant.id,
                    'quantity': 1,
                }
            ]
        }

    def test_second_transaction_returns_structured_insufficient_stock_error(self):
        first_response = self.client.post('/pos/transactions/', self._payload(), format='json')
        self.assertEqual(first_response.status_code, 201)

        second_response = self.client.post('/pos/transactions/', self._payload(), format='json')
        self.assertEqual(second_response.status_code, 409)
        self.assertEqual(second_response.data.get('error_code'), 'insufficient_ingredient_stock')
        self.assertEqual(
            second_response.data.get('detail'),
            'Insufficient ingredient stock for one or more items.',
        )

        transaction_item_errors = second_response.data.get('transaction_items')
        self.assertTrue(isinstance(transaction_item_errors, list) and len(transaction_item_errors) > 0)


class TransactionCompletionActionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(username="cashier_action", password="password123")
        self.client.force_authenticate(user=self.cashier)

        category = Category.objects.create(name="Bread")
        product = Product.objects.create(name="Loaf")
        product.categories.add(category)
        variant = ProductVariant.objects.create(product=product, label="Regular", price=Decimal("120.00"))

        self.pending_transaction = Transaction.objects.create(
            cashier=self.cashier,
            payment_method='cash',
            order_type='dine-in',
            gross_total=Decimal('120.00'),
            discount_amount=Decimal('0.00'),
            net_total=Decimal('120.00'),
            paid_amount=Decimal('0.00'),
            change=Decimal('0.00'),
            is_completed=False,
        )

        TransactionItem.objects.create(
            transaction=self.pending_transaction,
            product=product,
            product_variant=variant,
            quantity=1,
            discount_amount=Decimal('0.00'),
            price_at_time=Decimal('120.00'),
        )

    def test_complete_transaction_action_sets_flags(self):
        response = self.client.post(f"/pos/transactions/{self.pending_transaction.id}/complete/", {}, format='json')
        self.assertEqual(response.status_code, 200)

        self.pending_transaction.refresh_from_db()
        self.assertTrue(self.pending_transaction.is_completed)
        self.assertIsNotNone(self.pending_transaction.completed_at)

    def test_complete_transaction_action_rejects_already_completed(self):
        self.pending_transaction.is_completed = True
        self.pending_transaction.completed_at = timezone.now()
        self.pending_transaction.save(update_fields=['is_completed', 'completed_at'])

        response = self.client.post(f"/pos/transactions/{self.pending_transaction.id}/complete/", {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_batch_complete_completes_multiple_transactions(self):
        another_transaction = Transaction.objects.create(
            cashier=self.cashier,
            payment_method='cash',
            order_type='dine-in',
            gross_total=Decimal('120.00'),
            discount_amount=Decimal('0.00'),
            net_total=Decimal('120.00'),
            paid_amount=Decimal('0.00'),
            change=Decimal('0.00'),
            is_completed=False,
        )

        response = self.client.post(
            '/pos/transactions/batch-complete/',
            {'transaction_ids': [self.pending_transaction.id, another_transaction.id]},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get('completed_ids', [])), 2)

        self.pending_transaction.refresh_from_db()
        another_transaction.refresh_from_db()

        self.assertTrue(self.pending_transaction.is_completed)
        self.assertTrue(another_transaction.is_completed)


class RegisterMoneyFlowTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.cashier = User.objects.create_user(username="cashier_day", password="password123")
        cashier_group, _ = Group.objects.get_or_create(name="cashier")
        self.cashier.groups.add(cashier_group)
        self.client.force_authenticate(user=self.cashier)

        category = Category.objects.create(name="Session Test")
        self.product = Product.objects.create(name="Cookie")
        self.product.categories.add(category)
        self.variant = ProductVariant.objects.create(product=self.product, label="Regular", price=Decimal("99.00"))

    def _create_payload(self):
        return {
            "payment_method": "cash",
            "paid_amount": "100.00",
            "order_type": "dine-in",
            "is_completed": True,
            "transaction_items": [
                {"product": self.product.id, "product_variant": self.variant.id, "quantity": 1}
            ]
        }

    def test_cashier_can_create_completed_transaction_without_opening_prompt(self):
        response = self.client.post("/pos/transactions/", self._create_payload(), format='json')
        self.assertEqual(response.status_code, 201)

    def test_set_starting_money_sets_register_amount(self):
        response = self.client.post("/pos/transactions/set-starting-money/", {"amount": "1500.00"}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(str(response.data.get("starting_money"))), Decimal("1500.00"))
        self.assertEqual(Decimal(str(response.data.get("current_amount"))), Decimal("1500.00"))

    def test_completed_transaction_increases_register_money(self):
        self.client.post("/pos/transactions/set-starting-money/", {"amount": "1000.00"}, format='json')
        create_response = self.client.post("/pos/transactions/", self._create_payload(), format='json')
        self.assertEqual(create_response.status_code, 201)

        register = RegisterMoney.objects.get(cashier=self.cashier)
        self.assertEqual(register.current_amount, Decimal("1099.00"))

    def test_register_deduction_uses_authenticated_cashier(self):
        self.client.post("/pos/transactions/set-starting-money/", {"amount": "500.00"}, format='json')
        response = self.client.post(
            "/pos/transactions/deductions/",
            {"amount": "100.00", "note": "Drawer mismatch"},
            format='json',
        )
        self.assertEqual(response.status_code, 201)

    def test_register_deduction_requires_reason(self):
        self.client.post("/pos/transactions/set-starting-money/", {"amount": "500.00"}, format='json')
        response = self.client.post(
            "/pos/transactions/deductions/",
            {"amount": "100.00", "note": "   "},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('note', response.data)