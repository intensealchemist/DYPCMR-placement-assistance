"""
Application serializers.
"""
from rest_framework import serializers
from .models import Application


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating in-app applications."""
    
    class Meta:
        model = Application
        fields = ['name', 'email', 'phone', 'resume_url', 'cover_letter']
        extra_kwargs = {
            'name': {'required': True},
            'email': {'required': True},
        }


class ApplicationListSerializer(serializers.ModelSerializer):
    """Serializer for listing applications (admin view)."""
    
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'job_company', 'user', 'username',
            'name', 'email', 'phone', 'source', 'status', 'submission_status',
            'applied_at', 'updated_at', 'resume_url'
        ]


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Serializer for application detail (admin view)."""
    
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_title', 'job_company', 'user', 'username',
            'name', 'email', 'phone', 'resume_url', 'cover_letter',
            'source', 'status', 'submission_status', 'applied_at', 'updated_at', 'ip_address', 'notes'
        ]
        read_only_fields = ['id', 'job', 'user', 'source', 'applied_at', 'ip_address']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status."""
    
    class Meta:
        model = Application
        fields = ['status', 'notes']


class ApplicationConfirmationSerializer(serializers.ModelSerializer):
    """Serializer for confirming external application submission."""

    class Meta:
        model = Application
        fields = ['submission_status']
