"""
User views for authentication and profile management.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    FCMTokenSerializer,
)
from .auth_serializers import EmailOrUsernameTokenObtainPairSerializer

User = get_user_model()


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    """
    JWT token view that accepts email or username.
    Explicitly disable authentication to avoid 401s if a bad token is sent.
    """
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    authentication_classes = []


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = []  # Ignore any bad tokens sent by client
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's profile."""
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


class UpdateFCMTokenView(APIView):
    """Update user's FCM token for push notifications."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = FCMTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        request.user.fcm_token = serializer.validated_data['fcm_token']
        request.user.save(update_fields=['fcm_token'])
        
        return Response({'message': 'FCM token updated successfully'})
