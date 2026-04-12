from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    middle_name = models.CharField(max_length=150, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    activation_token = models.UUIDField(null=True, blank=True, unique=True)
    deactivated_at = models.DateTimeField(null=True, blank=True, db_index=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp')
    otp = models.IntegerField()
    is_valid = models.BooleanField()
    expires_at = models.DateTimeField()


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')

    street = models.CharField(max_length=100, blank=True, null=True)
    barangay = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    description = models.TextField()