"""
Job admin configuration.
"""
from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """Admin configuration for Job model."""
    
    list_display = [
        'title', 'company', 'job_type', 'apply_type', 
        'active', 'featured', 'posted_at', 'applications_count'
    ]
    list_filter = ['job_type', 'apply_type', 'active', 'featured', 'posted_at']
    search_fields = ['title', 'company', 'description', 'skills_required']
    date_hierarchy = 'posted_at'
    ordering = ['-posted_at']
    readonly_fields = ['posted_at', 'updated_at', 'views_count', 'push_sent']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'company', 'description', 'requirements')
        }),
        ('Job Details', {
            'fields': ('location', 'job_type', 'salary_min', 'salary_max', 
                      'experience_required', 'skills_required')
        }),
        ('Application Settings', {
            'fields': ('apply_type', 'apply_target')
        }),
        ('Status & Visibility', {
            'fields': ('active', 'featured', 'deadline', 'push_on_create', 'push_sent')
        }),
        ('Metadata', {
            'fields': ('posted_by', 'posted_at', 'updated_at', 'views_count'),
            'classes': ('collapse',)
        }),
    )
    
    def applications_count(self, obj):
        return obj.applications.count()
    applications_count.short_description = 'Applications'
