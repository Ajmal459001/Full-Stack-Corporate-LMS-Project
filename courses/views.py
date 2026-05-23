# backend/courses/views.py
from rest_framework import viewsets, filters, status 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

# AUTH & EMAIL IMPORTS (Sprint 3)
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail

# MODELS & SERIALIZERS 
from .models import Course, Enrollment, Certificate, Lesson, UserProfile, Resource, Review, Quiz, Question, Choice, QuizAttempt
from .serializers import CourseSerializer, EnrollmentSerializer, LessonSerializer, ResourceSerializer, ReviewSerializer, QuizSerializer, QuestionSerializer, ChoiceSerializer, QuizAttemptSerializer
from .permissions import IsInstructorOrReadOnly

# ENTERPRISE LOGIC IMPORTS (Stripe & Time)
import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

User = get_user_model()
stripe.api_key = settings.STRIPE_TEST_SECRET_KEY

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]
    
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['id', 'title']
    ordering = ['-id'] 

    def get_queryset(self):
        queryset = Course.objects.all()
        category_param = self.request.query_params.get('category')
        difficulty_param = self.request.query_params.get('difficulty')

        if category_param: queryset = queryset.filter(category__icontains=category_param)
        if difficulty_param: queryset = queryset.filter(difficulty=difficulty_param)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=False, methods=['get'])
    def my_workspace(self, request):
        if request.user.is_superuser or request.user.is_staff:
            role = 'ADMIN'
        else:
            profile = UserProfile.objects.filter(user=request.user).first()
            role = profile.role.upper() if profile else 'EMPLOYEE'

        if role == 'INSTRUCTOR' or role == 'ADMIN':
            queryset = Course.objects.filter(instructor=request.user).order_by('-id')
        else:
            enrolled_course_ids = Enrollment.objects.filter(
                user=request.user, expires_at__gt=timezone.now() 
            ).values_list('course_id', flat=True)
            
            queryset = Course.objects.filter(id__in=enrolled_course_ids).order_by('-id')

        search_param = request.query_params.get('search')
        if search_param: queryset = queryset.filter(title__icontains=search_param)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]
    
    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get('course_id')
        
        if course_id:
            if self.request.user.is_superuser or self.request.user.is_staff:
                role = 'ADMIN'
            else:
                profile = getattr(self.request.user, 'profile', None)
                role = profile.role.upper() if profile else 'EMPLOYEE'

            if role == 'EMPLOYEE':
                has_active_sub = Enrollment.objects.filter(
                    user=self.request.user, course_id=course_id, expires_at__gt=timezone.now()
                ).exists()
                if not has_active_sub: return Lesson.objects.none() 

            queryset = queryset.filter(course_id=course_id)
            
        return queryset


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return Quiz.objects.all()
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.instructor != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("Only the instructor can enable assessments.")
        serializer.save()

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return Question.objects.all()
    def perform_create(self, serializer):
        quiz = serializer.validated_data['quiz']
        if quiz.course.instructor != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("Only the instructor can add questions.")
        serializer.save()

class ChoiceViewSet(viewsets.ModelViewSet):
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return Choice.objects.all()
    def perform_create(self, serializer):
        question = serializer.validated_data['question']
        if question.quiz.course.instructor != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("Only the instructor can add choices.")
        serializer.save()

class SubmitQuizAttemptView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            has_enrollment = Enrollment.objects.filter(user=request.user, course=quiz.course).exists()
            if not has_enrollment and not request.user.is_superuser: return Response({"error": "You must be enrolled to take this assessment."}, status=status.HTTP_403_FORBIDDEN)
            
            answers = request.data.get('answers', {})
            total_questions = quiz.questions.count()
            if total_questions == 0: return Response({"error": "Quiz is empty."}, status=status.HTTP_400_BAD_REQUEST)

            correct_count = sum(1 for q_id, c_id in answers.items() if Choice.objects.filter(id=c_id, question_id=q_id, is_correct=True).exists())
            score = (correct_count / total_questions) * 100
            passed = score >= quiz.passing_score
            
            QuizAttempt.objects.create(quiz=quiz, user=request.user, score=score, passed=passed)
            
            return Response({
                "score": score, "passed": passed, "message": "Assessment Passed!" if passed else "You did not pass. Review the material and try again."
            }, status=status.HTTP_200_OK)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)


class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]
    def get_queryset(self):
        queryset = Resource.objects.all()
        lesson_id = self.request.query_params.get('lesson_id')
        if lesson_id: queryset = queryset.filter(lesson_id=lesson_id)
        return queryset
    def perform_create(self, serializer):
        lesson = serializer.validated_data['lesson']
        if lesson.course.instructor != self.request.user and not self.request.user.is_superuser: raise PermissionDenied("You can only attach resources to courses you authored.")
        serializer.save()

class SubmitReviewView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            has_enrollment = Enrollment.objects.filter(user=request.user, course=course).exists()
            if not has_enrollment and not request.user.is_superuser: return Response({"error": "You must be enrolled in this course to leave a review."}, status=status.HTTP_403_FORBIDDEN)
            
            rating = request.data.get('rating')
            comment = request.data.get('comment', '')

            if not rating or not str(rating).isdigit() or not (1 <= int(rating) <= 5): return Response({"error": "Please provide a valid rating between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

            review, created = Review.objects.update_or_create(course=course, user=request.user, defaults={'rating': int(rating), 'comment': comment})
            return Response({"message": "Review submitted successfully!", "review_id": review.id}, status=status.HTTP_200_OK)

        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


class TrackProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        lesson_id = request.query_params.get('lesson_id')
        if not lesson_id:
            enrollment = Enrollment.objects.filter(user=request.user, course_id=course_id).order_by('-updated_at').first()
        else:
            enrollment, created = Enrollment.objects.get_or_create(user=request.user, course_id=course_id, last_watched_lesson_id=lesson_id)
        serializer = EnrollmentSerializer(enrollment) if enrollment else None
        return Response(serializer.data if serializer else {"last_timestamp": 0.0}, status=status.HTTP_200_OK)

    def post(self, request, course_id):
        lesson_id = request.data.get('lesson_id')
        timestamp = request.data.get('timestamp', 0.0)
        is_completed = request.data.get('is_completed', False) 

        if not lesson_id: return Response({"error": "Missing lesson_id"}, status=status.HTTP_400_BAD_REQUEST)

        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user, course_id=course_id, last_watched_lesson_id=lesson_id,
            defaults={'last_timestamp': float(timestamp), 'is_completed': is_completed}
        )
        if not created:
            enrollment.last_timestamp = float(timestamp)
            if is_completed: enrollment.is_completed = True
            enrollment.save()
            
        return Response({"message": "Progress saved natively"}, status=status.HTTP_200_OK)

class CourseCompletionStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            total_lessons = course.lessons.count()
            if total_lessons == 0: return Response({"percentage": 0, "completed_lessons": [], "days_remaining": 0}, status=status.HTTP_200_OK)

            enrollments = Enrollment.objects.filter(user=request.user, course_id=course_id)
            completed_lesson_ids = list(set([e.last_watched_lesson.id for e in enrollments if e.is_completed and e.last_watched_lesson]))
            percentage = int((len(completed_lesson_ids) / total_lessons) * 100)

            enrollment = enrollments.first()
            days_remaining = max(0, (enrollment.expires_at - timezone.now()).days) if enrollment and enrollment.expires_at else 0

            quiz_passed = False
            best_score = 0
            if hasattr(course, 'quiz'):
                attempts = QuizAttempt.objects.filter(quiz=course.quiz, user=request.user)
                if attempts.exists():
                    best_score = max(attempts.values_list('score', flat=True))
                    quiz_passed = attempts.filter(passed=True).exists()

            return Response({
                "percentage": percentage, "completed_lessons": completed_lesson_ids, "days_remaining": days_remaining,
                "quiz_passed": quiz_passed, "best_score": best_score
            }, status=status.HTTP_200_OK)
            
        except Course.DoesNotExist:
             return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

class IssueCertificateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            if course.instructor == request.user: return Response({"error": "Instructors cannot claim certificates."}, status=status.HTTP_403_FORBIDDEN)
            
            total_lessons = course.lessons.count()
            if total_lessons == 0: return Response({"error": "Course has no content."}, status=status.HTTP_400_BAD_REQUEST)

            completed_enrollments = Enrollment.objects.filter(user=request.user, course_id=course_id, is_completed=True).values_list('last_watched_lesson_id', flat=True).distinct()
            if len(completed_enrollments) < total_lessons: return Response({"error": "Course not 100% completed yet."}, status=status.HTTP_403_FORBIDDEN)

            certificate, created = Certificate.objects.get_or_create(user=request.user, course=course)
            
            # SPRINT 3: Send Automated Achievement Email
            if created:
                send_mail(
                    subject=f"Achievement Unlocked: {course.title}",
                    message=f"Congratulations {request.user.username}!\n\nYou have officially completed the requirements for '{course.title}' and earned your certificate.\n\nCertificate Verification ID: {certificate.id}\n\nKeep up the great work,\nThe SkillStream Team",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    fail_silently=True,
                )

            return Response({
                "certificate_id": str(certificate.id),
                "issued_at": certificate.issued_at.strftime("%B %d, %Y"),
                "student_name": request.user.username, 
                "course_title": course.title,
                "instructor": course.instructor.username if course.instructor else "SkillStream Academy"
            }, status=status.HTTP_200_OK)

        except Course.DoesNotExist:
             return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

class InstructorAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)
        enrollments = Enrollment.objects.filter(course__in=courses)
        
        total_enrollments = enrollments.count()
        completed_enrollments = enrollments.filter(is_completed=True).count()
        overall_completion_rate = int((completed_enrollments / total_enrollments) * 100) if total_enrollments > 0 else 0

        course_breakdown = []
        total_revenue = 0.0 # SPRINT 3: Revenue Tracking

        for course in courses:
            course_enrollments = enrollments.filter(course=course)
            course_total = course_enrollments.count()
            rate = int((course_enrollments.filter(is_completed=True).count() / course_total) * 100) if course_total > 0 else 0
            
            # Calculate Revenue specific to this track
            revenue = float(course_total * course.price)
            total_revenue += revenue
            
            course_breakdown.append({
                "id": course.id,
                "title": course.title,
                "total_students": course_total,
                "completion_rate": rate,
                "revenue": revenue, # Added to payload
                "category": course.category,
                "reviews": list(course.reviews.values('user__username', 'rating', 'comment', 'created_at'))
            })

        return Response({
            "total_courses": courses.count(),
            "total_students": enrollments.values('user').distinct().count(),
            "overall_completion_rate": overall_completion_rate,
            "total_revenue": total_revenue, # Added to payload
            "course_breakdown": course_breakdown
        }, status=status.HTTP_200_OK)

class RegisterUserView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny] 

    def post(self, request):
        username, email, password, role = request.data.get('username'), request.data.get('email'), request.data.get('password'), request.data.get('role', 'EMPLOYEE') 
        if not username or not password: return Response({"error": "Required fields missing."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists(): return Response({"error": "Username taken."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            UserProfile.objects.create(user=user, role=role.upper())
            
            # SPRINT 3: Send Welcome Email Pipeline
            send_mail(
                subject="Welcome to SkillStream Workspace",
                message=f"Hi {username},\n\nYour account has been successfully initialized. You can now log in and access your corporate learning workspace.\n\nAssigned Role: {role}\n\nBest,\nThe SkillStream Architecture Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )

            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateStripeCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': { 'currency': 'usd', 'product_data': { 'name': course.title }, 'unit_amount': int(course.price * 100) },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"https://full-stack-corporate-lms-project.vercel.app/success?course_id={course.id}",
                cancel_url="https://full-stack-corporate-lms-project.vercel.app/catalog",
                client_reference_id=str(request.user.id) 
            )
            return Response({"checkout_url": session.url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeSuccessEnrollmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        if not course_id: return Response({"error": "Missing ID"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id)
            expiration_date = timezone.now() + timedelta(days=course.validity_days)
            enrollments = Enrollment.objects.filter(user=request.user, course_id=course_id)
            
            if enrollments.exists():
                enrollment = enrollments.first()
                if enrollment.expires_at is None or enrollment.expires_at < timezone.now():
                    enrollment.expires_at = expiration_date
                    enrollment.save()
            else:
                Enrollment.objects.create(user=request.user, course_id=course_id, expires_at=expiration_date)
                
                # SPRINT 3: Dispatch Automated Purchase Receipt
                send_mail(
                    subject=f"Enrollment Confirmed: {course.title}",
                    message=f"Hi {request.user.username},\n\nYour payment transaction was successful. You now have full access to {course.title} for the next {course.validity_days} days.\n\nLog in to your workspace to start upskilling immediately.\n\nThank you,\nSkillStream",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    fail_silently=True,
                )
            
            return Response({"message": "Successfully enrolled!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)