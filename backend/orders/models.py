from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")


class CakeOrder(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="cake_order")
    flavor = models.CharField(max_length=10)
    finish = models.CharField(max_length=10)
    shape = models.CharField(max_length=10)
    inscription = models.CharField(max_length=10)
    message = models.CharField(max_length=10)
    tier = models.IntegerField()


class CupcakeOrder(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="cupcake_order")
    amount = models.IntegerField()
    flavor = models.CharField(max_length=10)
    finish = models.CharField(max_length=10)
