"""
Jobs URL configuration.
"""
from django.urls import path
from .views import JobListCreateView, JobDetailView, ApplyToJobView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job_list_create'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),
    path('<int:pk>/apply/', ApplyToJobView.as_view(), name='apply_to_job'),
]
