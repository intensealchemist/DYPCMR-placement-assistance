"""
Application views for admin operations.
"""
import csv
from django.http import HttpResponse
from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Application
from .serializers import (
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationStatusUpdateSerializer,
)
from apps.jobs.permissions import IsAdminUser


class ApplicationListView(generics.ListAPIView):
    """List all applications (admin only)."""
    
    permission_classes = [IsAdminUser]
    serializer_class = ApplicationListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job', 'source', 'status', 'user']
    search_fields = ['name', 'email', 'job__title', 'job__company']
    ordering_fields = ['applied_at', 'status']
    ordering = ['-applied_at']
    
    def get_queryset(self):
        return Application.objects.select_related('job', 'user').all()


class JobApplicationsView(generics.ListAPIView):
    """List applications for a specific job (admin only)."""
    
    permission_classes = [IsAdminUser]
    serializer_class = ApplicationListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source', 'status']
    search_fields = ['name', 'email']
    ordering = ['-applied_at']
    
    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return Application.objects.filter(job_id=job_id).select_related('job', 'user')


class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    """Get or update a specific application (admin only)."""
    
    permission_classes = [IsAdminUser]
    queryset = Application.objects.select_related('job', 'user').all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ApplicationStatusUpdateSerializer
        return ApplicationDetailSerializer


class ExportApplicationsCSVView(APIView):
    """Export applications to CSV (admin only)."""
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        job_id = request.query_params.get('job_id')
        
        applications = Application.objects.select_related('job', 'user')
        if job_id:
            applications = applications.filter(job_id=job_id)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applications.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Job Title', 'Company', 'Applicant Name', 'Email', 'Phone',
            'Source', 'Status', 'Applied At', 'Resume URL'
        ])
        
        for app in applications:
            writer.writerow([
                app.id,
                app.job.title,
                app.job.company,
                app.name,
                app.email,
                app.phone,
                app.get_source_display(),
                app.get_status_display(),
                app.applied_at.strftime('%Y-%m-%d %H:%M'),
                app.resume_url,
            ])
        
        return response


class UploadResumeView(APIView):
    """
    Upload a resume file and return its URL.
    """
    from rest_framework.parsers import MultiPartParser, FormParser
    
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        if 'resume' not in request.data:
            return Response({'error': 'No resume file provided'}, status=400)
            
        resume_file = request.data['resume']
        
        # Validate file type (PDF/Doc)
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if resume_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type. Only PDF and Word documents are allowed.'}, status=400)
            
        # Save file
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        import os
        
        # Create a unique filename
        filename = f"resumes/{request.user.id}_{resume_file.name}"
        path = default_storage.save(filename, ContentFile(resume_file.read()))
        
        # Get URL
        # If using stats/media locally, we need the full URL
        url = request.build_absolute_uri(default_storage.url(path))
        
        return Response({
            'url': url,
            'filename': resume_file.name,
            'size': resume_file.size
        })
