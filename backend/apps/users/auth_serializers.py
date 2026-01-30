"""
Custom JWT serializers that support email OR username login.
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that allows authentication with either email or username.
    """
    username_field = 'username'  # Keep this for the field name in the request
    
    def validate(self, attrs):
        # Get the username field value (which could be email or username)
        username_or_email = attrs.get(self.username_field)
        password = attrs.get('password')
        
        # Try to find user by username first
        user = User.objects.filter(username=username_or_email).first()
        
        # If not found, try by email
        if not user:
            user = User.objects.filter(email=username_or_email).first()
        
        # If user found, check password
        if user and user.check_password(password):
            # Manually set the user for the parent class
            attrs[self.username_field] = user.username
            return super().validate(attrs)
        
        # If authentication fails, raise the default error
        from rest_framework_simplejwt.exceptions import AuthenticationFailed
        raise AuthenticationFailed('No active account found with the given credentials')
