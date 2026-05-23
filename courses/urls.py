# backend/courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, TrackProgressView, CourseCompletionStatsView, 
    IssueCertificateView, LessonViewSet, InstructorAnalyticsView, 
    RegisterUserView, CreateStripeCheckoutSessionView, StripeSuccessEnrollmentView,
    ResourceViewSet, SubmitReviewView,
    QuizViewSet, QuestionViewSet, ChoiceViewSet, SubmitQuizAttemptView # NEW SPRINT 2 IMPORTS
)

router = DefaultRouter()

# SPRINT 2 ROUTERS
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', ChoiceViewSet, basename='choice')

# SPRINT 1 ROUTER
router.register(r'resources', ResourceViewSet, basename='resource') 

# CORE ROUTER
router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('progress/<int:course_id>/', TrackProgressView.as_view(), name='track_progress'),
    path('stats/<int:course_id>/', CourseCompletionStatsView.as_view(), name='course_stats'),
    path('certificate/<int:course_id>/', IssueCertificateView.as_view(), name='issue_certificate'),
    
    # SPRINT 2: Submit Quiz Attempt Endpoint
    path('quiz/<int:quiz_id>/submit/', SubmitQuizAttemptView.as_view(), name='submit_quiz'),
    
    # SPRINT 1: Course Review Endpoint
    path('course/<int:course_id>/review/', SubmitReviewView.as_view(), name='submit_review'),
    
    path('analytics/', InstructorAnalyticsView.as_view(), name='instructor_analytics'),
    
    path('lessons/', LessonViewSet.as_view({'get': 'list', 'post': 'create'}), name='lesson-list'),
    path('lessons/<int:pk>/', LessonViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='lesson-detail'),
    
    path('', include(router.urls)),
    
    # --- STRIPE ROUTES ---
    path('checkout/create-session/<int:course_id>/', CreateStripeCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('checkout/success/', StripeSuccessEnrollmentView.as_view(), name='checkout-success'),
]