# courses/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    DIFFICULTY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, db_index=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='BEGINNER')
    
    # Link course to an Instructor. If instructor is deleted, their courses remain (SET_NULL)
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_courses')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    # A public test stream URL for development purposes
    video_url = models.URLField(default="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    # Change this field to represent the specific lesson of this row
    last_watched_lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)
    last_timestamp = models.FloatField(default=0.0)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # CRITICAL CHANGE: A user can now have one unique saving row PER LESSON per course!
        unique_together = ('user', 'course', 'last_watched_lesson') 

    def __str__(self):
        return f"{self.user.username} - {self.course.title} - Lesson {self.last_watched_lesson_id}"