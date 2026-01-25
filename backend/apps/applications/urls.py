"""
Applications URL configuration.
"""
from django.urls import path
from .views import (
    ApplicationListView,
    JobApplicationsView,
    ApplicationDetailView,
    ExportApplicationsCSVView,
    UploadResumeView,
)

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application_list'),
    path('job/<int:job_id>/', JobApplicationsView.as_view(), name='job_applications'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('export/', ExportApplicationsCSVView.as_view(), name='export_applications'),
    path('upload/', UploadResumeView.as_view(), name='upload_resume'),
]
