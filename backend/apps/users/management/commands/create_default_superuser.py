"""
Management command to create a default superuser if it doesn't exist.
This is useful for automated deployments.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config


class Command(BaseCommand):
    help = 'Create a default superuser if one does not exist'

    def handle(self, *args, **options):
        User = get_user_model()
        
        email = config('DJANGO_SUPERUSER_EMAIL', default='')
        password = config('DJANGO_SUPERUSER_PASSWORD', default='')
        
        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD not set. Skipping superuser creation.'
            ))
            return
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.SUCCESS(f'Superuser with email {email} already exists.'))
            return
        
        username = email.split('@')[0]
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: (hidden in logs, check DJANGO_SUPERUSER_PASSWORD env var)'))
