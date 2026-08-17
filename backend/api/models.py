from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name

#presents one item in one users cart
class CartItem(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class Order(models.Model):

    STATUS_CHOICES = [
        ("placed", "Placed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
    ]

    # The state machine: each status can only move to the ones listed.
    # "delivered" has an empty list — it's a dead end, nothing comes after it.
    ALLOWED_TRANSITIONS = {
        "placed": ["processing"],
        "processing": ["shipped"],
        "shipped": ["delivered"],
        "delivered": [],
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="placed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")

    # SET_NULL (not CASCADE): if a product is deleted later, keep the
    # order history intact — just lose the live link to the product.
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)

    # Snapshots taken at purchase time — these never change afterward,
    # even if the live product's name or price changes.
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"

