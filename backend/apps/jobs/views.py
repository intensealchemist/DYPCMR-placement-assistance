"""
Job views for CRUD and apply operations.
"""
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .models import Job
from .serializers import JobListSerializer, JobDetailSerializer, JobCreateSerializer
from .permissions import IsAdminOrReadOnly, IsAdminUser
from services.fcm import send_job_notification


class JobListCreateView(generics.ListCreateAPIView):
    """List all active jobs or create a new job (admin only)."""
    
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['company', 'job_type', 'apply_type', 'active', 'featured']
    search_fields = ['title', 'company', 'description', 'skills_required']
    ordering_fields = ['posted_at', 'deadline', 'salary_min']
    ordering = ['-posted_at']
    
    def get_queryset(self):
        queryset = Job.objects.annotate(applications_count=Count('applications'))
        
        # Non-admin users only see active jobs
        if not self.request.user.is_admin:
            queryset = queryset.filter(active=True)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobListSerializer
    
    def perform_create(self, serializer):
        job = serializer.save(posted_by=self.request.user)
        
        # Send push notification if enabled
        if job.push_on_create and not job.push_sent:
            send_job_notification(job)
            job.push_sent = True
            job.save(update_fields=['push_sent'])


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a job."""
    
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        return Job.objects.annotate(applications_count=Count('applications'))
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateSerializer
        return JobDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count for non-admin users
        if not request.user.is_admin:
            instance.views_count += 1
            instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ApplyToJobView(APIView):
    """
    Apply to a job or record an external click.
    
    For in_app jobs: creates a full application.
    For google_form/email/external: records the click and returns redirect info.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        from apps.applications.models import Application
        from apps.applications.serializers import ApplicationCreateSerializer
        
        try:
            job = Job.objects.get(pk=pk, active=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found or no longer active'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        if job.apply_type == 'in_app':
            # Handle in-app application with full form data
            serializer = ApplicationCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Check for duplicate application
            existing = Application.objects.filter(
                job=job, user=user, source='in_app'
            ).exists()
            
            if existing:
                return Response(
                    {'error': 'You have already applied to this job'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            application = serializer.save(
                job=job,
                user=user,
                source='in_app',
                ip_address=self.get_client_ip(request)
            )
            
            return Response({
                'status': 'applied',
                'application_id': application.id,
                'message': 'Application submitted successfully'
            }, status=status.HTTP_201_CREATED)
        
        else:
            # For external types, record the click
            source = 'mailto_click' if job.apply_type == 'email' else 'external_click'
            
            # Check for recent duplicate click (within last hour)
            from django.utils import timezone
            from datetime import timedelta
            
            recent_click = Application.objects.filter(
                job=job,
                user=user,
                source=source,
                applied_at__gte=timezone.now() - timedelta(hours=1)
            ).exists()
            
            if not recent_click:
                application = Application.objects.create(
                    job=job,
                    user=user,
                    name=user.get_full_name() or user.username,
                    email=user.email,
                    source=source,
                    ip_address=self.get_client_ip(request)
                )
            else:
                application = Application.objects.filter(
                    job=job, user=user, source=source
                ).latest('applied_at')
            
            # Build redirect URL
            redirect_url = job.apply_target
            if job.apply_type == 'email':
                # Build mailto link with prefilled data
                subject = f"Application for {job.title} at {job.company}"
                body = f"Hi,\n\nI am interested in the {job.title} position.\n\nRegards,\n{user.get_full_name() or user.username}"
                redirect_url = f"mailto:{job.apply_target}?subject={subject}&body={body}"
            
            return Response({
                'status': 'recorded',
                'application_id': application.id,
                'apply_type': job.apply_type,
                'redirect_url': redirect_url,
                'message': 'Click recorded, opening external application'
            })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
