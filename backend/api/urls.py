from rest_framework.routers import DefaultRouter
from .views import RegisterView
from .views import (
    ProductViewSet,
    CategoryViewSet,
    BrandViewSet,
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
]