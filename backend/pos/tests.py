from django.test import TestCase
from rest_framework.test import APIRequestFactory
from decimal import Decimal
from django.contrib.auth.models import User
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