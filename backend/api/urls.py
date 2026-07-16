from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    CategoryViewSet,
    BrandViewSet,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")
router.register("categories", CategoryViewSet)
router.register("brands", BrandViewSet)

urlpatterns = router.urls