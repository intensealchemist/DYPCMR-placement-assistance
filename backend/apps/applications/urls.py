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
    ApplicationConfirmationView,
)

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application_list'),
    path('job/<int:job_id>/', JobApplicationsView.as_view(), name='job_applications'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('<int:pk>/confirm/', ApplicationConfirmationView.as_view(), name='application_confirm'),
    path('export/', ExportApplicationsCSVView.as_view(), name='export_applications'),
    path('upload/', UploadResumeView.as_view(), name='upload_resume'),
]
