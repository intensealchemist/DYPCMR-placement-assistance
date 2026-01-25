"""
Job serializers.
"""
from rest_framework import serializers
from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    """Serializer for job list (minimal fields)."""
    
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    salary_range = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type',
            'salary_range', 'apply_type', 'posted_at', 'deadline',
            'active', 'featured', 'applications_count', 'posted_by_name'
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """Serializer for job detail (all fields)."""
    
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    salary_range = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'description', 'requirements',
            'location', 'job_type', 'salary_min', 'salary_max', 'salary_range',
            'experience_required', 'skills_required', 'apply_type', 'apply_target',
            'posted_by', 'posted_by_name', 'posted_at', 'updated_at', 'deadline',
            'active', 'featured', 'views_count', 'applications_count'
        ]
        read_only_fields = ['posted_by', 'posted_at', 'updated_at', 'views_count', 'push_sent']


class JobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating jobs (admin only)."""
    
    class Meta:
        model = Job
        fields = [
            'title', 'company', 'description', 'requirements',
            'location', 'job_type', 'salary_min', 'salary_max',
            'experience_required', 'skills_required', 'apply_type', 'apply_target',
            'deadline', 'active', 'featured', 'push_on_create'
        ]
    
    def validate(self, attrs):
        apply_type = attrs.get('apply_type')
        apply_target = attrs.get('apply_target', '')
        
        if apply_type == 'email':
            # Validate email format
            if '@' not in apply_target:
                raise serializers.ValidationError({
                    'apply_target': 'Please provide a valid email address for email applications.'
                })
        elif apply_type in ('google_form', 'external'):
            # Validate URL format
            if not apply_target.startswith(('http://', 'https://')):
                raise serializers.ValidationError({
                    'apply_target': 'Please provide a valid URL starting with http:// or https://'
                })
        
        return attrs
