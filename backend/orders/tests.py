from decimal import Decimal
from datetime import date, time, timedelta

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from orders.models import Order, CakeOrder
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


class AcceptPricingRulesTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(username='admin_accept_price', password='secret123', is_staff=True)
		self.customer = User.objects.create_user(username='customer_accept_price', password='secret123')
		self.order = Order.objects.create(
			customer=self.customer,
			full_name='Pending Customer',
			email='pending-customer@example.com',
			phone_number='09177778888',
			address='Pending Address',
			due_date=date.today(),
			pickup_time=time(13, 0),
			status='pending',
		)

	def test_accept_requires_total_price(self):
		self.client.force_authenticate(user=self.admin)

		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'status': 'accepted'},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('total_price', response.data)

		self.order.refresh_from_db()
		self.assertEqual(self.order.status, 'pending')

	def test_accept_with_total_price_succeeds(self):
		self.client.force_authenticate(user=self.admin)

		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'status': 'accepted', 'total_price': '2450.00'},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.order.refresh_from_db()
		self.assertEqual(self.order.status, 'accepted')
		self.assertEqual(self.order.total_price, Decimal('2450.00'))

	def test_admin_can_edit_total_price_after_acceptance(self):
		self.order.status = 'accepted'
		self.order.total_price = Decimal('2000.00')
		self.order.save(update_fields=['status', 'total_price'])

		self.client.force_authenticate(user=self.admin)
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'total_price': '2350.50'},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.order.refresh_from_db()
		self.assertEqual(self.order.total_price, Decimal('2350.50'))

	def test_customer_cannot_edit_total_price(self):
		self.order.status = 'accepted'
		self.order.total_price = Decimal('2000.00')
		self.order.save(update_fields=['status', 'total_price'])

		self.client.force_authenticate(user=self.customer)
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{'total_price': '2400.00'},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('total_price', response.data)

		self.order.refresh_from_db()
		self.assertEqual(self.order.total_price, Decimal('2000.00'))


class OrderBatchUpdateTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(username='admin_batch', password='secret123', is_staff=True)
		self.customer = User.objects.create_user(username='customer_batch', password='secret123')
		self.client.force_authenticate(user=self.admin)

		self.pending_order = Order.objects.create(
			customer=self.customer,
			full_name='Pending Batch',
			email='pending-batch@example.com',
			phone_number='09123456782',
			address='Pending Address',
			due_date=date.today(),
			pickup_time=time(8, 0),
			status='pending',
		)

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

	def test_batch_update_accept_is_rejected(self):
		response = self.client.post(
			'/orders/orders/batch-update/',
			{
				'order_ids': [self.pending_order.id],
				'status': 'accepted',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('status', response.data)

		self.pending_order.refresh_from_db()
		self.assertEqual(self.pending_order.status, 'pending')


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

	def test_reference_submission_accepts_8_digit_reference(self):
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{
				'status': 'pending',
				'reference_number': '1234 5678',
				'payment_method': 'reference_number',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.order.refresh_from_db()
		self.assertEqual(self.order.reference_number, '12345678')

	def test_reference_submission_rejects_duplicate_reference_number(self):
		Order.objects.create(
			customer=self.customer,
			full_name='Existing Reference Owner',
			email='existing-reference@example.com',
			phone_number='09189998888',
			address='Reference Street 2',
			due_date=date.today(),
			pickup_time=time(9, 30),
			status='pending',
			reference_number='87654321',
		)

		response = self.client.patch(
			f'/orders/orders/{self.order.id}/',
			{
				'status': 'pending',
				'reference_number': '87654321',
				'payment_method': 'reference_number',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('reference_number', response.data)


class OrderCreationRestrictionTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.customer = User.objects.create_user(username='customer_limits', password='secret123')
		self.client.force_authenticate(user=self.customer)

	def _build_payload(self, due_date_value):
		return {
			'full_name': 'Limits Customer',
			'email': 'limits@example.com',
			'phone_number': '09155554444',
			'address': 'Limits Street',
			'due_date': due_date_value.isoformat(),
			'pickup_time': '11:00:00',
			'comments': 'Test order',
			'payment_method': 'reference_number',
			'cake_orders': {
				'occasion': 'birthday',
				'shape': 'round',
				'cake_tier': 1,
				'base_flavor': 'vanilla',
				'filling': 'chocolate',
				'coating_color': 'white',
			},
		}

	def test_due_date_more_than_3_months_is_rejected(self):
		payload = self._build_payload(timezone.localdate() + timedelta(days=130))

		response = self.client.post('/orders/orders/', payload, format='json')

		self.assertEqual(response.status_code, 400)
		self.assertIn('due_date', response.data)

	@override_settings(ALLOW_MULTIPLE_ORDER=False)
	def test_second_order_within_one_hour_is_rejected_when_multiple_disallowed(self):
		Order.objects.create(
			customer=self.customer,
			full_name='Existing Order',
			email='existing@example.com',
			phone_number='09100000000',
			address='Existing Street',
			due_date=timezone.localdate(),
			pickup_time=time(10, 0),
			status='unpaid',
		)

		payload = self._build_payload(timezone.localdate() + timedelta(days=1))
		response = self.client.post('/orders/orders/', payload, format='json')

		self.assertEqual(response.status_code, 400)
		self.assertIn('non_field_errors', response.data)

	@override_settings(ALLOW_MULTIPLE_ORDER=False)
	def test_second_order_after_one_hour_is_allowed_when_multiple_disallowed(self):
		existing_order = Order.objects.create(
			customer=self.customer,
			full_name='Older Existing Order',
			email='older-existing@example.com',
			phone_number='09112223333',
			address='Older Existing Street',
			due_date=timezone.localdate(),
			pickup_time=time(10, 0),
			status='unpaid',
		)
		existing_order.created_at = timezone.now() - timedelta(hours=2)
		existing_order.save(update_fields=['created_at'])

		payload = self._build_payload(timezone.localdate() + timedelta(days=1))
		response = self.client.post('/orders/orders/', payload, format='json')

		self.assertEqual(response.status_code, 201)

	@override_settings(ALLOW_MULTIPLE_ORDER=True)
	def test_second_order_within_one_hour_is_allowed_when_multiple_enabled(self):
		Order.objects.create(
			customer=self.customer,
			full_name='Existing Allowed',
			email='existing-allowed@example.com',
			phone_number='09110000000',
			address='Allowed Street',
			due_date=timezone.localdate(),
			pickup_time=time(10, 0),
			status='unpaid',
		)

		payload = self._build_payload(timezone.localdate() + timedelta(days=1))
		response = self.client.post('/orders/orders/', payload, format='json')

		self.assertEqual(response.status_code, 201)


class CustomerAdjustmentRestrictionTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.customer = User.objects.create_user(username='customer_adjustment', password='secret123')
		self.client.force_authenticate(user=self.customer)
		self.order = Order.objects.create(
			customer=self.customer,
			full_name='Adjustment Customer',
			email='adjustment@example.com',
			phone_number='09122220000',
			address='Adjustment Street',
			due_date=timezone.localdate(),
			pickup_time=time(9, 0),
			status='pending',
		)
		CakeOrder.objects.create(
			order=self.order,
			occasion='birthday',
			shape='round',
			cake_tier=1,
			base_flavor='vanilla',
			filling='chocolate',
			coating_color='white',
		)

	def test_first_adjustment_within_3_days_succeeds_and_locks_future_edits(self):
		response = self.client.patch(
			f'/orders/orders/{self.order.id}/customer-update-details/',
			{'comments': 'Updated details', 'uploaded_images': []},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.order.refresh_from_db()
		self.assertTrue(self.order.customer_adjustment_used)
		self.assertIsNotNone(self.order.customer_adjustment_used_at)

	def test_second_adjustment_is_rejected(self):
		first_response = self.client.patch(
			f'/orders/orders/{self.order.id}/customer-update-details/',
			{'comments': 'First update', 'uploaded_images': []},
			format='json',
		)
		self.assertEqual(first_response.status_code, 200)

		second_response = self.client.patch(
			f'/orders/orders/{self.order.id}/customer-update-details/',
			{'comments': 'Second update', 'uploaded_images': []},
			format='json',
		)

		self.assertEqual(second_response.status_code, 400)
		self.assertIn('error', second_response.data)

	def test_adjustment_after_3_days_is_rejected(self):
		self.order.created_at = timezone.now() - timedelta(days=4)
		self.order.save(update_fields=['created_at'])

		response = self.client.patch(
			f'/orders/orders/{self.order.id}/customer-update-details/',
			{'comments': 'Late update', 'uploaded_images': []},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('error', response.data)


class RefundRequestRequirementTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.customer = User.objects.create_user(username='customer_refund_req', password='secret123')
		self.client.force_authenticate(user=self.customer)
		self.order = Order.objects.create(
			customer=self.customer,
			full_name='Refund Customer',
			email='refund@example.com',
			phone_number='09133330000',
			address='Refund Street',
			due_date=timezone.localdate(),
			pickup_time=time(14, 0),
			status='pending',
			reference_number='1234567890123',
		)

	def test_request_cancellation_requires_gcash_details(self):
		response = self.client.post(f'/orders/orders/{self.order.id}/request-cancellation/', {}, format='json')

		self.assertEqual(response.status_code, 400)
		self.assertIn('error', response.data)

	def test_request_cancellation_persists_gcash_details(self):
		response = self.client.post(
			f'/orders/orders/{self.order.id}/request-cancellation/',
			{
				'refund_account_name': 'Juan Dela Cruz',
				'refund_account_number': '0917 123 4567',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.order.refresh_from_db()
		self.assertTrue(self.order.cancellation_requested)
		self.assertEqual(self.order.refund_account_name, 'Juan Dela Cruz')
		self.assertEqual(self.order.refund_account_number, '09171234567')

	def test_request_cancellation_rejects_invalid_gcash_number_format(self):
		response = self.client.post(
			f'/orders/orders/{self.order.id}/request-cancellation/',
			{
				'refund_account_name': 'Juan Dela Cruz',
				'refund_account_number': '0917 123 45',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('error', response.data)
		self.assertIn('4-3-4', response.data['error'])
