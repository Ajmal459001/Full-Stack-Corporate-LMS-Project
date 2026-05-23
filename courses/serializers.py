# backend/courses/serializers.py
from rest_framework import serializers
from .models import Course, Lesson, Enrollment, Resource, Review, Quiz, Question, Choice, QuizAttempt

# --- SPRINT 2: QUIZ SERIALIZERS ---

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'question', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'order', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'passing_score', 'questions']

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'user', 'score', 'passed', 'attempted_at']
        read_only_fields = ['user']


# --- EXISTING SERIALIZERS ---

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'lesson', 'title', 'file_url']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Review
        fields = ['id', 'course', 'user', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

class LessonSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'video_url', 'order', 'resources']

class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.ReadOnlyField(source='instructor.username')
    lessons = LessonSerializer(many=True, read_only=True) 
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    
    # Expose the quiz summary so the frontend knows if an exam exists
    quiz = QuizSerializer(read_only=True)

    thumbnail = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'category', 
            'difficulty', 'instructor', 'instructor_username', 'created_at', 
            'lessons', 'price', 'validity_days', 'average_rating', 'reviews', 'quiz'
        ]
        read_only_fields = ['instructor']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'last_watched_lesson', 'last_timestamp', 'is_completed']