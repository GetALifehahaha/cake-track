from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
User = get_user_model()

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp')
    otp = models.IntegerField(max_length=6)
    is_valid = models.BooleanField()
    expires_at = models.DateTimeField()
