from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import viewsets
from .models import Feedback
from .serializers import FeedbackSerializer
from .ai import generate_text
from django.views.decorators.http import require_http_methods
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail, BadHeaderError
from .serializers import EmailSerializer
from users.permissions import IsAdminUserProfile,IsProfileAdmin
from users.models import UserProfile, SentEmail

@csrf_exempt
def generate_excuse_view(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)

            result = generate_text(
                reason=body.get("reason"),
                reason_category=body.get("reason_category"),
                target=body.get("target"),
                author_role=body.get("author_role"),
                student_name=body.get("student_name"),
                date=body.get("date"),
                tone=body.get("tone"),
                details=body.get("details"),
            )

            return JsonResponse(result)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST request required"}, status=400)

#///////NOT BEING USED CURRENTLY//////
@login_required  
def feedback_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)
    try:
        data = json.loads(request.body)

        feedbacktype = data.get("feedbacktype")
        feedbacktext = data.get("feedbacktext")
        rating = data.get("rating")
        email = data.get("email")

        
        # Save feedback to the database
        print('Saving feedback to the database...')
        from .models import Feedback
        feedback_entry = Feedback(
            feedbacktype=feedbacktype,
            feedbacktext=feedbacktext,
            rating=rating,
            email=email
        )
        feedback_entry.save()

        return JsonResponse({"message": "Feedback submitted successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
#///////NOT BEING USED CURRENTLY//////

from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, BasePermission

class IsAdminOrReadOnly(BasePermission):
    """Allow anyone to read, but only admins can write."""
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS for anyone
        if request.method in SAFE_METHODS:
            return True
        if request.method == "POST":
            return True
        # For write operations, require admin
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile'):
                return request.user.profile.is_admin
        return False

class FeedbackViewSet(viewsets.ModelViewSet):
    
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [IsAdminOrReadOnly]
    # permission_classes = [ IsProfileAdmin]
    # permission_classes = [ IsAdminUserProfile]
    
