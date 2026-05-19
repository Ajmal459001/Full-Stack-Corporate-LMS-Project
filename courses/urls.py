from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, TrackProgressView

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    path('progress/<int:course_id>/', TrackProgressView.as_view(), name='track_progress'),
    path('', include(router.urls)),
]