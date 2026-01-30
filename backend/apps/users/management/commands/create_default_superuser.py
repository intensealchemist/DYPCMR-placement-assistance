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
        username = email.split('@')[0] if email else ''

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD not set. Skipping superuser creation.'
            ))
            if username:
                self.stdout.write(self.style.WARNING(f'Expected admin username: {username}'))
            return

        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            self.stdout.write(self.style.SUCCESS(f'User with email {email} already exists.'))
            self.stdout.write(self.style.SUCCESS(f'Existing username: {existing_user.username}'))
            self.stdout.write(self.style.SUCCESS(
                f'is_staff: {existing_user.is_staff}, is_superuser: {existing_user.is_superuser}'
            ))
            return

        existing_username = User.objects.filter(username=username).first()
        if existing_username:
            self.stdout.write(self.style.WARNING(
                f'Username {username} already exists with email {existing_username.email}.'
            ))
            self.stdout.write(self.style.WARNING(
                'Update DJANGO_SUPERUSER_EMAIL or delete the existing user.'
            ))
            return
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
