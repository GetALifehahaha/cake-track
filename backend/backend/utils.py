import secrets

from django.utils import timezone


NUMBER_ALPHABET = "0123456789"
SALT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def generate_id(_prefix=None):
    date_part = timezone.localdate().strftime("%Y-%m%d")
    random_digits = "".join(secrets.choice(NUMBER_ALPHABET) for _ in range(4))
    random_salt = "".join(secrets.choice(SALT_ALPHABET) for _ in range(2))

    return f"{date_part}-{random_digits}{random_salt}"
