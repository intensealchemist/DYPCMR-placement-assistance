"""
Management command to ensure migrations are run.
This can be triggered via an API endpoint or run manually.
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Run migrations to ensure database is up to date'

    def handle(self, *args, **options):
        self.stdout.write('Running migrations...')
        call_command('migrate', '--noinput')
        self.stdout.write(self.style.SUCCESS('Migrations completed successfully'))
