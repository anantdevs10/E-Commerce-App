# backend/api/urls.py — full replacement
from rest_framework.routers import DefaultRouter
from .views import RegisterView
from .views import (
    ProductViewSet, CategoryViewSet, BrandViewSet,
    CartView, CartItemDetailView,
    OrderListCreateView, OrderDetailView, OrderStatusUpdateView, OrderReorderView,
    ProfileView, AddressListCreateView, AddressDetailView, OfferListView, RecommendationsView, WishlistView, WishlistDetailView,
    NotificationListView, NotificationDetailView, ChatView
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
from django.urls import path


router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")
router.register("categories", CategoryViewSet)
router.register("brands", BrandViewSet)

urlpatterns = router.urls
urlpatterns += [
    path("register/", RegisterView.as_view()),
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("cart/", CartView.as_view()),
    path("cart/items/<int:pk>/", CartItemDetailView.as_view()),
    path("orders/", OrderListCreateView.as_view()),
    path("orders/<int:pk>/", OrderDetailView.as_view()),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view()),
    path("orders/<int:pk>/reorder/", OrderReorderView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("addresses/", AddressListCreateView.as_view()),
    path("addresses/<int:pk>/", AddressDetailView.as_view()),
    path("offers/", OfferListView.as_view()),
    path("recommendations/", RecommendationsView.as_view()),
    path("wishlist/", WishlistView.as_view()),
    path("wishlist/<int:pk>/", WishlistDetailView.as_view()),
    path("notifications/", NotificationListView.as_view()),
    path("notifications/<int:pk>/", NotificationDetailView.as_view()),
    path("chat/", ChatView.as_view()),
]