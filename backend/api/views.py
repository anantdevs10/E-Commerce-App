from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Category, Brand, CartItem
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    BrandSerializer,
    RegisterSerializer,
    CartItemSerializer
)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer

    permission_classes = [AllowAny]

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

class CartView(generics.ListCreateAPIView):

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        if not product_id:
            return Response(
                {"detail": "product_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(Product, pk=product_id)

        existing_item = CartItem.objects.filter(
            user=request.user, product=product
        ).first()

        if existing_item:
            new_quantity = existing_item.quantity + quantity

            if new_quantity > product.stock:
                return Response(
                    {"detail": f"Only {product.stock} left in stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            existing_item.quantity = new_quantity
            existing_item.save()
            serializer = self.get_serializer(existing_item)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if quantity > product.stock:
            return Response(
                {"detail": f"Only {product.stock} left in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item = CartItem.objects.create(
            user=request.user, product=product, quantity=quantity
        )
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            user=self.request.user
        )