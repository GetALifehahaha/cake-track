from django.core.management.base import BaseCommand

from users.services import purge_expired_deactivated_accounts


class Command(BaseCommand):
    help = 'Delete accounts that stayed deactivated beyond the retention period.'

    def handle(self, *args, **options):
        deleted_count = purge_expired_deactivated_accounts()
        self.stdout.write(
            self.style.SUCCESS(f'Purged deactivated accounts: {deleted_count}')
        )
