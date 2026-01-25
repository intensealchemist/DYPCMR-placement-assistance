"""
Custom User model for DYPCMR Placement Assistance.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with role-based access and profile fields."""
    
    ROLE_CHOICES = (
        ('user', 'Job Seeker'),
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True)
    resume_url = models.URLField(blank=True)
    fcm_token = models.CharField(max_length=255, blank=True)
    profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role in ('admin', 'super_admin')
    
    @property
    def is_super_admin(self):
        return self.role == 'super_admin'
