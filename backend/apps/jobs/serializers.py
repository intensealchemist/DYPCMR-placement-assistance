"""
Job serializers.
"""
from rest_framework import serializers
from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    """Serializer for job list (minimal fields)."""

    posted_by_name = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    salary_range = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type',
            'salary_range', 'apply_type', 'posted_at', 'deadline',
            'active', 'featured', 'applications_count', 'posted_by_name',
            'job_type_tags'
        ]

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return obj.posted_by.get_full_name() or obj.posted_by.username
        return 'Placement Team'

    def get_applications_count(self, obj):
        annotated_value = getattr(obj, 'applications_total', None)
        if annotated_value is not None:
            return annotated_value
        return obj.applications.count()


class JobDetailSerializer(serializers.ModelSerializer):
    """Serializer for job detail (all fields)."""

    posted_by_name = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    salary_range = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'description', 'requirements',
            'location', 'job_type', 'salary_min', 'salary_max', 'salary_range',
            'experience_required', 'skills_required', 'apply_type', 'apply_target',
            'posted_by', 'posted_by_name', 'posted_at', 'updated_at', 'deadline',
            'active', 'featured', 'views_count', 'applications_count', 'job_type_tags'
        ]
        read_only_fields = ['posted_by', 'posted_at', 'updated_at', 'views_count', 'push_sent']

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return obj.posted_by.get_full_name() or obj.posted_by.username
        return 'Placement Team'

    def get_applications_count(self, obj):
        annotated_value = getattr(obj, 'applications_total', None)
        if annotated_value is not None:
            return annotated_value
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating jobs (admin only)."""
    
    job_type_tags = serializers.ListField(
        child=serializers.ChoiceField(choices=Job.JOB_TYPE_CHOICES),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Job
        fields = [
            'title', 'company', 'description', 'requirements',
            'location', 'job_type', 'salary_min', 'salary_max',
            'experience_required', 'skills_required', 'apply_type', 'apply_target',
            'deadline', 'active', 'featured', 'push_on_create', 'job_type_tags'
        ]
    
    def to_internal_value(self, data):
        # Ensure empty string from forms converts to empty list
        if 'job_type_tags' in data and data['job_type_tags'] in ('', None):
            mutable = data.copy()
            mutable['job_type_tags'] = []
            data = mutable
        return super().to_internal_value(data)

    def validate_job_type_tags(self, value):
        unique_values = []
        for item in value:
            if item not in unique_values:
                unique_values.append(item)
        return unique_values

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
        
        instance = getattr(self, 'instance', None)
        current_primary = attrs.get('job_type') or (instance.job_type if instance else None)
        has_tags_in_payload = 'job_type_tags' in attrs
        incoming_tags = attrs.get('job_type_tags') if has_tags_in_payload else None

        if incoming_tags is None:
            # Fallback to existing tags or primary type
            if instance and instance.job_type_tags:
                attrs['job_type_tags'] = instance.job_type_tags
            elif current_primary:
                attrs['job_type_tags'] = [current_primary]
            else:
                attrs['job_type_tags'] = [Job.JOB_TYPE_CHOICES[0][0]]
        else:
            if not incoming_tags:
                # Ensure at least one tag is stored
                fallback = current_primary or Job.JOB_TYPE_CHOICES[0][0]
                incoming_tags = [fallback]

            # Keep primary type aligned with first tag
            if current_primary and current_primary not in incoming_tags:
                incoming_tags.insert(0, current_primary)
            elif not current_primary:
                attrs['job_type'] = incoming_tags[0]

            attrs['job_type_tags'] = incoming_tags

        return attrs
