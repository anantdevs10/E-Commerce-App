from django.shortcuts import render, get_object_or_404
import re
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Category, Brand, CartItem, Order, OrderItem, Profile, Address, Offer, Wishlist, Notification, get_effective_price
from .serializers import (
    ProductSerializer, CategorySerializer, BrandSerializer,
    RegisterSerializer, CartItemSerializer, OrderSerializer,
    ProfileSerializer, AddressSerializer, OfferSerializer, WishlistSerializer,
    NotificationSerializer
)
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from rest_framework.views import APIView
from .chatbot_functions import get_order_status, check_stock, get_active_offers


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
                    price=get_effective_price(product.price),
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


class OfferListView(generics.ListAPIView):
    serializer_class = OfferSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        now = timezone.now()
        return Offer.objects.filter(start_date__lte=now, end_date__gte=now)

class RecommendationsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.GET.get("product")

        if not product_id:
            return Response({"detail": "product query param is required."}, status=status.HTTP_400_BAD_REQUEST)

        target = get_object_or_404(Product, pk=product_id)

        # All prodcuts which are not stock amount 0
        candidates = Product.objects.exclude(pk=target.id).filter(stock__gt=0)

        target_words = set(target.description.lower().split())
        scored = []

        for candidate in candidates:
            score = 0

            if candidate.category_id == target.category_id:
                score += 3

            if candidate.brand_id == target.brand_id:
                score += 2

            if target.price > 0:
                price_diff_ratio = abs(candidate.price - target.price) / target.price
                if price_diff_ratio <= Decimal("0.2"):  # within 20% of original price
                    score += 1

            candidate_words = set(candidate.description.lower().split())
            if target_words & candidate_words:  # any shared words at all
                score += 1

            if score > 0:
                scored.append((score, candidate))

        scored.sort(key=lambda pair: pair[0], reverse=True) # sroting from top to bottom
        top_products = [product for score, product in scored[:5]] #picked the bets 5

        serializer = ProductSerializer(top_products, many=True) # fetch the object data of the 5 products and convert to JSON
        return Response(serializer.data) #send the data to the frontend

class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WishlistDetailView(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


class NotificationDetailView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").lower()

        # Intent 1: order status — look for "order" followed by a number
        order_match = re.search(r"order\s*#?(\d+)", message)
        if order_match:
            order_id = int(order_match.group(1))
            result = get_order_status(request.user, order_id)  # goes through the controlled function
            if result:
                reply = f"Order #{result['id']} is currently '{result['status']}'."
            else:
                reply = f"I couldn't find order #{order_id} on your account."
            return Response({"reply": reply})

        # Intent 2: stock check
        if "stock" in message or "available" in message:
            candidate_words = [
                w.strip("?.,!") for w in message.split() if len(w.strip("?.,!")) > 3
            ]
            product = None
            for word in candidate_words:
                product = check_stock(word)
                if product:
                    break
            if product:
                reply = (
                    f"{product.name} has {product.stock} in stock."
                    if product.stock > 0 else f"{product.name} is currently out of stock."
                )
            else:
                reply = "Tell me the product name and I'll check stock for you."
            return Response({"reply": reply})

        # Intent 3: offers
        if any(word in message for word in ["offer", "discount", "deal", "sale"]):
            offers = get_active_offers()[:5]
            if offers:
                names = ", ".join(o.product.name for o in offers)
                reply = f"Current offers: {names}."
            else:
                reply = "There are no active offers right now."
            return Response({"reply": reply})

        # Fallback
        reply = "I can help with order status (try 'status of order 12'), stock checks, or current offers."
        return Response({"reply": reply})