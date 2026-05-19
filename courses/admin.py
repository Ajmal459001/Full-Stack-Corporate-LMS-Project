# courses/admin.py
from django.contrib import admin
from .models import Course, Lesson, Enrollment

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    # Display the course title and the lesson name in columns
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    ordering = ('course', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'last_watched_lesson', 'last_timestamp', 'enrolled_at')
    list_filter = ('course', 'user')