# authentication/views.py
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

# 1. Registration Endpoint
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# 2. Custom JWT Login Endpoint
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# 3. NEW: The User Profile Endpoint (Fixes the React 404 Error)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Safely extract the role, defaulting to ADMIN or INSTRUCTOR if undefined
        role = getattr(user, 'role', 'ADMIN' if user.is_superuser else 'INSTRUCTOR')
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        })