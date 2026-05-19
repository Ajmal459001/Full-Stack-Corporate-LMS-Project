from rest_framework import serializers
from .models import Course, Lesson, Enrollment

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'video_url', 'order']

class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.ReadOnlyField(source='instructor.username')
    
    # CRITICAL: This variable name MUST exactly match the related_name='lessons' 
    # defined in your Lesson model ForeignKey!
    lessons = LessonSerializer(many=True, read_only=True) 

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'difficulty', 'instructor', 'instructor_username', 'lessons', 'created_at']
        read_only_fields = ['instructor']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'last_watched_lesson', 'last_timestamp']