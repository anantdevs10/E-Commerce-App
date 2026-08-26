from rest_framework import serializers
from .models import Product, Category, Brand, CartItem, Order, OrderItem, Profile, Address, Offer, Wishlist, Notification, get_active_offer, get_effective_price
from django.contrib.auth.models import User


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"

    def get_effective_price(self, obj):
        return get_effective_price(obj)

    def get_active_discount_percentage(self, obj):
        offer = get_active_offer(obj)
        return offer.discount_percentage if offer else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:

        model = User

        fields = (
            "username",
            "email",
            "password",
        )

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
    )

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "price", "quantity"]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "status", "created_at", "updated_at", "items"]
        read_only_fields = ["id", "status", "created_at", "updated_at", "items"]

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "line1", "line2", "city", "postcode", "country", "is_default"]

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True) #one to one relationship
    email = serializers.CharField(source="user.email", read_only=True)

    # nested serializer
    # embedded inside the Profile response. read_only because addresses
    # are created/edited through their own dedicated endpoint, not through profile.
    addresses = AddressSerializer(source="user.addresses", many=True, read_only=True)

    class Meta:
        model = Profile
        fields = ["username", "email", "phone_number", "bio", "addresses"]


class OfferSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only = True)
    discounted_price = serializers.ReadOnlyField()

    class Meta:
        model = Offer
        fields = ["id", "product", "discount_percentage", "discounted_price", "start_date", "end_date"]

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ["id", "product", "product_id", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "product", "is_read", "created_at"]
        read_only_fields = ["id", "message", "product", "created_at"]