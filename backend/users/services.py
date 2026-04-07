from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone

from .models import UserProfile

DEACTIVATED_ACCOUNT_RETENTION_DAYS = 60


def get_deletion_due_date(profile):
    if not profile.deactivated_at:
        return None
    return profile.deactivated_at + timedelta(days=DEACTIVATED_ACCOUNT_RETENTION_DAYS)


def get_days_until_deletion(profile):
    deletion_due = get_deletion_due_date(profile)
    if not deletion_due:
        return None

    remaining_seconds = (deletion_due - timezone.now()).total_seconds()
    if remaining_seconds <= 0:
        return 0

    # Round up partial days so users see how many full/partial days remain.
    return int((remaining_seconds + 86399) // 86400)


def purge_expired_deactivated_accounts():
    cutoff = timezone.now() - timedelta(days=DEACTIVATED_ACCOUNT_RETENTION_DAYS)
    profiles = UserProfile.objects.filter(
        user__is_active=False,
        deactivated_at__isnull=False,
        deactivated_at__lte=cutoff,
    ).select_related('user')

    deleted_count = 0
    user_ids = [profile.user_id for profile in profiles if profile.user_id]
    if user_ids:
        deleted_count, _ = User.objects.filter(id__in=user_ids).delete()

    return deleted_count
