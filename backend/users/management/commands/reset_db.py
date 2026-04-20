from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Resets data and reapplies migrations using Django management commands only'

    def handle(self, *args, **options):
        call_command('flush', interactive=False)
        self.stdout.write(self.style.SUCCESS('Flushed all data'))

        call_command('migrate', interactive=False)
        self.stdout.write(self.style.SUCCESS('Database reset complete'))