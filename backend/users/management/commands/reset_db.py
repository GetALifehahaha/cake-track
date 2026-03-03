from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection

class Command(BaseCommand):
    help = 'Drops all tables and recreates the database'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Drop all tables
            cursor.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
            """)
        self.stdout.write(self.style.SUCCESS('Dropped all tables'))

        # Run migrations
        call_command('migrate', interactive=False)
        self.stdout.write(self.style.SUCCESS('Database reset complete'))