from django.utils import timezone
from .models import Order, Product, Offer


def get_order_status(user, order_id):
    try:
        order = Order.objects.get(pk=order_id, user=user)
    except Order.DoesNotExist:
        return None
    return {"id": order.id, "status": order.status}


def check_stock(product_name_fragment):
    if not product_name_fragment:
        return None
    return Product.objects.filter(name__icontains=product_name_fragment).first()


def get_active_offers():
    now = timezone.now()
    return Offer.objects.filter(start_date__lte=now, end_date__gte=now).select_related("product")