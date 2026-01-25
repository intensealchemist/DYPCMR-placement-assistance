"""
User profile URL configuration.
"""
from django.urls import path

from .views import UserProfileView, UpdateFCMTokenView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('me/fcm-token/', UpdateFCMTokenView.as_view(), name='update_fcm_token'),
]
