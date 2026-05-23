# backend/courses/models.py
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()

class Course(models.Model):
    DIFFICULTY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    category = models.CharField(max_length=100, db_index=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='BEGINNER')
    
    price = models.DecimalField(max_digits=7, decimal_places=2, default=49.99)
    validity_days = models.PositiveIntegerField(default=30, help_text="Days until access expires")
    
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def average_rating(self):
        avg = self.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def __str__(self):
        return self.title

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField(default="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Resource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255, help_text="e.g., Starter Code.zip or Slide Deck.pdf")
    file_url = models.URLField(help_text="URL to the hosted file (S3, Cloud Storage, etc.)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resource: {self.title} for {self.lesson.title}"

class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews')
    rating = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'user') 

    def __str__(self):
        return f"{self.rating} Stars - {self.course.title} by {self.user.username}"


# --- SPRINT 2: ASSESSMENTS & QUIZZES ---

class Quiz(models.Model):
    """The final assessment attached to a course."""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255, default="Final Course Assessment")
    passing_score = models.PositiveIntegerField(default=80, help_text="Percentage required to pass (e.g., 80)")
    
    def __str__(self):
        return f"Quiz for {self.course.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Incorrect'})"

class QuizAttempt(models.Model):
    """Tracks a student's performance on a quiz."""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.FloatField(help_text="Percentage scored")
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.course.title} - {self.score}%"


# --- EXISTING ENTERPRISE MODELS ---

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    last_watched_lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)
    last_timestamp = models.FloatField(default=0.0)
    is_completed = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True) 

    class Meta:
        unique_together = ('user', 'course', 'last_watched_lesson') 

    def __str__(self):
        return f"{self.user.username} - {self.course.title} - Lesson {self.last_watched_lesson_id}"

class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='issued_certificates')
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course') 

    def __str__(self):
        return f"Certificate {self.id} - {self.user.username} - {self.course.title}"

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('EMPLOYEE', 'Employee'),
        ('INSTRUCTOR', 'Instructor'),
        ('ADMIN', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')

    def __str__(self):
        return f"{self.user.username} - {self.role}"