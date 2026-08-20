from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Offer, Wishlist, Notification


@receiver(post_save, sender=Offer)
def notify_wishlist_on_offer(sender, instance, created, **kwargs):
    # "created" is True only the moment the Offer is FIRST saved —
    # this stops us re-notifying every time someone edits an existing offer.
    if not created:
        return

    interested_users = Wishlist.objects.filter(product=instance.product).select_related("user")

    notifications = [
        Notification(
            user=entry.user,
            message=f"{instance.product.name} is now {instance.discount_percentage}% off!",
            product=instance.product,
        )
        for entry in interested_users
    ]

    # bulk_create does ONE database query for all notifications,
    # instead of one query per user — matters once wishlists get big.
    Notification.objects.bulk_create(notifications)