"""
Job model for placement assistance.
"""
from django.db import models
from django.conf import settings


class Job(models.Model):
    """Job posting model with multiple apply types."""
    
    APPLY_TYPE_CHOICES = (
        ('google_form', 'Google Form'),
        ('email', 'Email'),
        ('in_app', 'In-App Form'),
        ('external', 'External Link'),
    )
    
    JOB_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
        ('remote', 'Remote'),
    )
    
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    experience_required = models.CharField(max_length=100, blank=True)  # e.g., "0-2 years"
    skills_required = models.TextField(blank=True)  # Comma-separated or JSON
    
    # Apply configuration
    apply_type = models.CharField(max_length=20, choices=APPLY_TYPE_CHOICES)
    apply_target = models.TextField(help_text="URL for form/external link, or email address")
    
    # Metadata
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='posted_jobs'
    )
    posted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateTimeField(null=True, blank=True)
    
    # Status
    active = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    push_on_create = models.BooleanField(default=False, help_text="Send push notification on creation")
    push_sent = models.BooleanField(default=False)
    
    # Analytics
    views_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-posted_at']
        indexes = [
            models.Index(fields=['active', '-posted_at']),
            models.Index(fields=['company']),
            models.Index(fields=['job_type']),
        ]
    
    def __str__(self):
        return f"{self.title} at {self.company}"
    
    @property
    def salary_range(self):
        """Return formatted salary range."""
        if self.salary_min and self.salary_max:
            return f"₹{self.salary_min:,.0f} - ₹{self.salary_max:,.0f}"
        elif self.salary_min:
            return f"₹{self.salary_min:,.0f}+"
        elif self.salary_max:
            return f"Up to ₹{self.salary_max:,.0f}"
        return "Not disclosed"
    
    @property
    def applications_count(self):
        """Return total applications for this job."""
        return self.applications.count()
