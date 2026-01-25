"""
Application admin configuration.
"""
from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for Application model."""
    
    list_display = [
        'name', 'email', 'job', 'source', 'status', 'applied_at'
    ]
    list_filter = ['source', 'status', 'applied_at', 'job__company']
    search_fields = ['name', 'email', 'job__title', 'job__company']
    date_hierarchy = 'applied_at'
    ordering = ['-applied_at']
    readonly_fields = ['applied_at', 'updated_at', 'ip_address']
    raw_id_fields = ['job', 'user']
    
    fieldsets = (
        ('Applicant Info', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Job & User', {
            'fields': ('job', 'user')
        }),
        ('Application Materials', {
            'fields': ('resume_url', 'cover_letter'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('source', 'status', 'notes')
        }),
        ('Metadata', {
            'fields': ('applied_at', 'updated_at', 'ip_address'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_reviewed', 'mark_shortlisted', 'mark_rejected']
    
    def mark_reviewed(self, request, queryset):
        queryset.update(status='reviewed')
    mark_reviewed.short_description = "Mark as Reviewed"
    
    def mark_shortlisted(self, request, queryset):
        queryset.update(status='shortlisted')
    mark_shortlisted.short_description = "Mark as Shortlisted"
    
    def mark_rejected(self, request, queryset):
        queryset.update(status='rejected')
    mark_rejected.short_description = "Mark as Rejected"
