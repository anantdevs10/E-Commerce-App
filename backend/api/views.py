from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Category, Brand, CartItem, Order, OrderItem, Profile, Address
from .serializers import (
    ProductSerializer, CategorySerializer, BrandSerializer,
    RegisterSerializer, CartItemSerializer, OrderSerializer,
    ProfileSerializer, AddressSerializer,
)
from django.db import transaction


#define API ENDPOINTS IN THE CODE


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

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # "own data only" — a user can only ever see their own orders
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        cart_items = CartItem.objects.filter(user=request.user).select_related("product")

        if not cart_items.exists():
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Everything from here to the end of the "with" block either
        # ALL happens, or NONE of it does. This is Concept 1 in action.
        with transaction.atomic():

            product_ids = [item.product_id for item in cart_items]

            # select_for_update() locks these specific product rows.
            # If another checkout is mid-transaction on the same product
            # right now, this line will WAIT until that transaction
            # finishes before continuing. This is Concept 2 in action.
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # Check stock for EVERY item first, before changing anything.
            # If item 3 of 5 fails, we haven't touched items 1 and 2 yet.
            for item in cart_items:
                product = locked_products[item.product_id]
                if item.quantity > product.stock:
                    return Response(
                        {"detail": f"Not enough stock for {product.name}."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            order = Order.objects.create(user=request.user, status="placed")

            for item in cart_items:
                product = locked_products[item.product_id]

                # Snapshot the name/price NOW, at purchase time
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    price=product.price,
                    quantity=item.quantity,
                )

                product.stock -= item.quantity
                product.save()

            cart_items.delete()  # empty the cart now that it's been "converted" into an order

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Order.objects.all()

    def patch(self, request, *args, **kwargs):
        # The bouncer check — no ID, no entry.
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff can update order status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order = get_object_or_404(Order, pk=kwargs["pk"])
        new_status = request.data.get("status")

        # Look up what THIS order is allowed to move to, given its current status
        allowed = Order.ALLOWED_TRANSITIONS.get(order.status, [])

        if new_status not in allowed:
            return Response(
                {
                    "detail": f"Cannot move order from '{order.status}' to '{new_status}'.",
                    "allowed_next_statuses": allowed,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)

class OrderReorderView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)

        added = []
        skipped = []

        for item in order.items.select_related("product"):
            product = item.product

            if product is None:  # product was deleted since this order was placed
                skipped.append(item.product_name)
                continue

            existing = CartItem.objects.filter(user=request.user, product=product).first()

            if existing:
                new_quantity = min(existing.quantity + item.quantity, product.stock)
                if new_quantity == existing.quantity:
                    skipped.append(product.name)
                    continue
                existing.quantity = new_quantity
                existing.save()
                added.append(product.name)
            else:
                quantity = min(item.quantity, product.stock)
                if quantity == 0:
                    skipped.append(product.name)
                    continue
                CartItem.objects.create(user=request.user, product=product, quantity=quantity)
                added.append(product.name)

        return Response({"added": added, "skipped_out_of_stock": skipped})

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Self-healing: fetch the profile, or silently create a blank
        # one if this user has never had one before.
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Own data only — same pattern as CartView and OrderListCreateView
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)