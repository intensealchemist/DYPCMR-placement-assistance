"""
Auth URL configuration (login, register, token refresh).
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, EmailOrUsernameTokenObtainPairView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
