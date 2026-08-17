from rest_framework.routers import DefaultRouter
from .views import RegisterView
from .views import (
    ProductViewSet,
    CategoryViewSet,
    BrandViewSet,
    CartView,
    CartItemDetailView, OrderListCreateView, OrderDetailView, OrderStatusUpdateView, OrderReorderView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
) 
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
]