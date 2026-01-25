"""
Application model for tracking job applications.
"""
from django.db import models
from django.conf import settings


class Application(models.Model):
    """
    Tracks all job applications.
    - in_app: Full application with resume/cover letter
    - external_click: User clicked apply for Google Form/external link
    - mailto_click: User clicked apply for email application
    """
    
    SOURCE_CHOICES = (
        ('in_app', 'In-App Form'),
        ('external_click', 'External Click'),
        ('mailto_click', 'Mailto Click'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    )
    
    job = models.ForeignKey(
        'jobs.Job', 
        on_delete=models.CASCADE, 
        related_name='applications'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='applications'
    )
    
    # Applicant info (can be filled even if user is null)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Application materials (for in_app applications)
    resume_url = models.URLField(blank=True)
    cover_letter = models.TextField(blank=True)
    
    # Metadata
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='in_app')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Admin notes
    notes = models.TextField(blank=True, help_text="Internal notes for admin")
    
    class Meta:
        db_table = 'applications'
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['job', '-applied_at']),
            models.Index(fields=['user', '-applied_at']),
            models.Index(fields=['source']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.job.title} ({self.source})"
