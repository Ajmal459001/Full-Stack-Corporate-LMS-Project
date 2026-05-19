from rest_framework import viewsets, filters, status 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Course, Enrollment 
from .serializers import CourseSerializer, EnrollmentSerializer 
from .permissions import IsInstructorOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Course.objects.all()
        category_param = self.request.query_params.get('category')
        difficulty_param = self.request.query_params.get('difficulty')

        if category_param:
            queryset = queryset.filter(category__icontains=category_param)
        if difficulty_param:
            queryset = queryset.filter(difficulty=difficulty_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class TrackProgressView(APIView):
    permission_classes = [IsAuthenticated]

    # 1. GET: Fetch progress for a specific lesson
    def get(self, request, course_id):
        # We look for a specific lesson query parameter passed from React
        lesson_id = request.query_params.get('lesson_id')
        
        if not lesson_id:
            # Fallback: if no lesson requested, find the absolute newest record for this course
            enrollment = Enrollment.objects.filter(user=request.user, course_id=course_id).order_by('-enrolled_at').first()
        else:
            enrollment, created = Enrollment.objects.get_or_create(
                user=request.user, 
                course_id=course_id,
                last_watched_lesson_id=lesson_id
            )
            
        serializer = EnrollmentSerializer(enrollment) if enrollment else None
        return Response(serializer.data if serializer else {"last_timestamp": 0.0}, status=status.HTTP_200_OK)

    # 2. POST: Securely update or insert progress per lesson
    def post(self, request, course_id):
        lesson_id = request.data.get('lesson_id')
        timestamp = request.data.get('timestamp', 0.0)

        if not lesson_id:
            return Response({"error": "Missing lesson_id"}, status=status.HTTP_400_BAD_REQUEST)

        # Update or create a unique row for this specific user + course + lesson combo!
        Enrollment.objects.update_or_create(
            user=request.user,
            course_id=course_id,
            last_watched_lesson_id=lesson_id,
            defaults={'last_timestamp': float(timestamp)}
        )
        return Response({"message": "Progress saved natively"}, status=status.HTTP_200_OK)