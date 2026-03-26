from decimal import Decimal
from datetime import date, time

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from orders.models import Order
from orders.views import _get_remaining_payment_amount
from payment.models import Payment


class RemainingPaymentAmountTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='customer1', password='secret123')
		self.order = Order.objects.create(
			customer=self.user,
			full_name='Test Customer',
			email='customer@example.com',
			phone_number='09123456789',
			address='Test Address',
			due_date=date.today(),
			pickup_time=time(10, 0),
			total_price=Decimal('1000.00'),
			status='pending',
		)

	def test_remaining_uses_actual_successful_downpayment(self):
		Payment.objects.create(
			payer=self.user,
			orders=self.order,
			amount=Decimal('500.00'),
			status='success',
			payment_type='downpayment',
		)

		remaining = _get_remaining_payment_amount(self.order)

		self.assertEqual(remaining, Decimal('500.00'))

	def test_remaining_ignores_failed_downpayment(self):
		Payment.objects.create(
			payer=self.user,
			orders=self.order,
			amount=Decimal('500.00'),
			status='failed',
			payment_type='downpayment',
		)

		remaining = _get_remaining_payment_amount(self.order)

		self.assertEqual(remaining, Decimal('1000.00'))


class ReadyStatusGuardTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(username='admin1', password='secret123', is_staff=True)
		self.customer = User.objects.create_user(username='customer2', password='secret123')
		self.order = Order.objects.create(
			customer=self.customer,
			full_name='Queue Customer',
			email='queue@example.com',
			phone_number='09111111111',
			address='Queue Address',
			due_date=date.today(),
			pickup_time=time(10, 0),
			status='accepted',
		)
		self.client.force_authenticate(user=self.admin)

	def test_cannot_mark_ready_when_ingredients_not_deducted(self):
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'status': 'ready'},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('status', response.data)

		self.order.refresh_from_db()
		self.assertEqual(self.order.status, 'accepted')

	def test_can_mark_ready_when_ingredients_already_deducted(self):
		self.order.ingredients_deducted_at = timezone.now()
		self.order.save(update_fields=['ingredients_deducted_at'])

		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'status': 'ready'},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.order.refresh_from_db()
		self.assertEqual(self.order.status, 'ready')
