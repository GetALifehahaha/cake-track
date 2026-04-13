from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient

from .models import PasswordResetToken


class ChangePasswordViaTokenTests(APITestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(
			username='reset-user',
			email='reset-user@example.com',
			password='OldPassword123!'
		)

		self.token = PasswordResetToken.objects.create(
			user=self.user,
			token='valid-reset-token',
			expires_at=timezone.now() + timedelta(minutes=5),
			used=False,
		)

	def test_same_password_is_rejected_without_consuming_token(self):
		response = self.client.post(
			'/change-password-token/',
			{
				'email': self.user.email,
				'token': self.token.token,
				'password': 'OldPassword123!',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data.get('label'), 'Same Password Not Allowed')

		self.token.refresh_from_db()
		self.assertFalse(self.token.used)

	def test_different_password_consumes_token(self):
		response = self.client.post(
			'/change-password-token/',
			{
				'email': self.user.email,
				'token': self.token.token,
				'password': 'BrandNewPassword123!'
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)

		self.token.refresh_from_db()
		self.assertTrue(self.token.used)
