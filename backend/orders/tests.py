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


class OrderBatchUpdateTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(username='admin_batch', password='secret123', is_staff=True)
		self.customer = User.objects.create_user(username='customer_batch', password='secret123')
		self.client.force_authenticate(user=self.admin)

		self.accepted_ready = Order.objects.create(
			customer=self.customer,
			full_name='Accepted Ready',
			email='accepted-ready@example.com',
			phone_number='09123456780',
			address='Accepted Address',
			due_date=date.today(),
			pickup_time=time(10, 0),
			status='accepted',
			ingredients_deducted_at=timezone.now(),
			total_price=Decimal('500.00'),
		)

		self.accepted_not_ready = Order.objects.create(
			customer=self.customer,
			full_name='Accepted Not Ready',
			email='accepted-not-ready@example.com',
			phone_number='09123456781',
			address='Accepted Address 2',
			due_date=date.today(),
			pickup_time=time(11, 0),
			status='accepted',
			total_price=Decimal('600.00'),
		)

	def test_batch_update_ready_requires_ingredients(self):
		response = self.client.post(
			'/orders/orders/batch-update/',
			{
				'order_ids': [self.accepted_ready.id, self.accepted_not_ready.id],
				'status': 'ready',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data.get('updated_count'), 1)
		self.assertTrue(response.data.get('errors'))

		self.accepted_ready.refresh_from_db()
		self.accepted_not_ready.refresh_from_db()

		self.assertEqual(self.accepted_ready.status, 'ready')
		self.assertEqual(self.accepted_not_ready.status, 'accepted')

	def test_batch_update_completed_creates_full_payment_once(self):
		self.accepted_ready.status = 'ready'
		self.accepted_ready.save(update_fields=['status'])

		response = self.client.post(
			'/orders/orders/batch-update/',
			{
				'order_ids': [self.accepted_ready.id],
				'status': 'completed',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data.get('updated_count'), 1)

		self.accepted_ready.refresh_from_db()
		self.assertEqual(self.accepted_ready.status, 'completed')

		payments = Payment.objects.filter(orders=self.accepted_ready, payment_type='full_payment', status='success')
		self.assertEqual(payments.count(), 1)

	def test_batch_update_completed_only_allows_ready_for_pickup(self):
		self.accepted_ready.status = 'ready'
		self.accepted_ready.save(update_fields=['status'])

		response = self.client.post(
			'/orders/orders/batch-update/',
			{
				'order_ids': [self.accepted_ready.id, self.accepted_not_ready.id],
				'status': 'completed',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data.get('updated_count'), 1)
		self.assertTrue(response.data.get('errors'))

		self.accepted_ready.refresh_from_db()
		self.accepted_not_ready.refresh_from_db()

		self.assertEqual(self.accepted_ready.status, 'completed')
		self.assertEqual(self.accepted_not_ready.status, 'accepted')


class ReferenceNumberPaymentTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.customer = User.objects.create_user(username='customer_ref', password='secret123')
		self.client.force_authenticate(user=self.customer)
		self.order = Order.objects.create(
			customer=self.customer,
			full_name='Reference Customer',
			email='reference@example.com',
			phone_number='09122223333',
			address='Reference Street',
			due_date=date.today(),
			pickup_time=time(12, 0),
			status='unpaid',
			total_price=Decimal('1000.00'),
		)

	def test_order_defaults_to_reference_payment_method(self):
		self.assertEqual(self.order.payment_method, 'reference_number')

	def test_reference_submission_creates_downpayment_record(self):
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{
				'status': 'pending',
				'reference_number': '1234 5678 9012 3',
				'payment_method': 'reference_number',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.order.refresh_from_db()
		self.assertEqual(self.order.status, 'pending')
		self.assertEqual(self.order.payment_method, 'reference_number')
		self.assertEqual(self.order.reference_number, '1234567890123')

		payment = Payment.objects.get(orders=self.order, payment_type='downpayment', status='success')
		self.assertEqual(payment.amount, Decimal('150.00'))
		self.assertEqual(payment.gateway_transaction_id, '1234567890123')
