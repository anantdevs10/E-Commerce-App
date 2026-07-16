from django.db import models

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