from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase, APIClient
from decimal import Decimal
from django.contrib.auth.models import Group, User
from django.utils import timezone
from .models import Category, Product, ProductVariant, Discount, Transaction, TransactionItem, DiscountUsage
from .serializers import TransactionCreateSerializer

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


class CashSessionFlowTests(APITestCase):
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

    def test_cashier_cannot_create_transaction_without_open_session(self):
        response = self.client.post("/pos/transactions/", self._create_payload(), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("cash_session", response.data)

    def test_open_day_allows_transaction_and_assigns_session(self):
        open_response = self.client.post("/pos/transactions/open-day/", {"opening_amount": "1500.00"}, format='json')
        self.assertIn(open_response.status_code, [200, 201])

        create_response = self.client.post("/pos/transactions/", self._create_payload(), format='json')
        self.assertEqual(create_response.status_code, 201)
        self.assertIsNotNone(create_response.data.get("cash_session"))

    def test_close_day_marks_session_closed(self):
        self.client.post("/pos/transactions/open-day/", {"opening_amount": "1200.00"}, format='json')
        close_response = self.client.post("/pos/transactions/close-day/", {"removed_amount": "500.00"}, format='json')

        self.assertEqual(close_response.status_code, 200)
        self.assertEqual(close_response.data.get("is_closed"), True)