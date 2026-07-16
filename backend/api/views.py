from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import Product, Category, Brand
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    BrandSerializer,
    RegisterSerializer,
)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()

        category = self.request.GET.get("category")
        brand = self.request.GET.get("brand")
        min_price = self.request.GET.get("min_price")
        max_price = self.request.GET.get("max_price")

        if category:
            queryset = queryset.filter(category_id=category)

        if brand:
            queryset = queryset.filter(brand_id=brand)

        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer