from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
import requests
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/auth/google/callback"
    client_class = OAuth2Client
    
    def get_serializer(self, *args, **kwargs):
        # Override to handle the code properly
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        
        # If we're getting a code from the request
        if self.request and 'code' in self.request.data:
            # Exchange code for token
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                'code': self.request.data['code'],
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': self.callback_url,
                'grant_type': 'authorization_code'
            }
            
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                token_data = response.json()
                self.request.data['access_token'] = token_data['access_token']
        
        return serializer_class(*args, **kwargs)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': 'csrf token set'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def simple_login(request):
    from django.contrib.auth import authenticate
    from rest_framework_simplejwt.tokens import RefreshToken
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
@api_view(['GET'])
@permission_classes([AllowAny])
def google_auth_start(request):
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri=http://localhost:5173/auth/google/callback&"
        f"scope=email%20profile%20https://www.googleapis.com/auth/gmail.send&"
        f"access_type=offline&"       # Gets refresh token
        f"prompt=consent"             # Forces Google to return refresh token every time
    )
    return Response({'url': google_auth_url})
@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    
class SimpleGoogleLogin(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        code = request.data.get('code')
        
        if not code:
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': 'http://localhost:5173/auth/google/callback',
            'grant_type': 'authorization_code'
        }
        
        token_response = requests.post(token_url, data=data)
        
        if token_response.status_code != 200:
            return Response({'error': 'Failed to get token'}, status=status.HTTP_400_BAD_REQUEST)
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')  # NEW - save this!
        
        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        
        if user_response.status_code != 200:
            return Response({'error': 'Failed to get user info'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = user_response.json()
        email = user_data.get('email')
        name = user_data.get('name', '')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': name
            }
        )
        
        # Save the Google tokens to the user's profile so we can send emails later
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.google_access_token = access_token
        if refresh_token:  # Google only returns this on first login or after prompt=consent
            profile.google_refresh_token = refresh_token
        profile.save()
        
        # Generate JWT tokens for your app
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
        
        
        















import json
import base64
from email.mime.text import MIMEText
from django.contrib.auth.models import User
from users.models import UserProfile, SentEmail
from base64 import urlsafe_b64encode

class SendGmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("DATA RECEIVED:", request.data) 
        to_email = request.data.get('to')
        subject = request.data.get('subject')
        body = request.data.get('body')

        if not all([to_email, subject, body]):
            return Response({'error': 'to, subject, and body are required'}, status=400)

        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=400)

        # Try to get a valid access token (refresh if needed)
        access_token = self._get_valid_access_token(profile)
        if not access_token:
            # If we still have no token, the user needs to re‑authenticate with Google
            return Response({
                'error': 'No valid Google access token. Please re‑link your Google account.'
            }, status=401)

        # Build the email message
        message = MIMEText(body)
        message['to'] = to_email
        message['subject'] = subject
        raw = urlsafe_b64encode(message.as_bytes()).decode()

        # Send via Gmail API
        gmail_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }

        try:
            response = requests.post(gmail_url, headers=headers, json={'raw': raw})
            response.raise_for_status()
            SentEmail.objects.create(
                user=request.user,
                to=to_email,
                subject=subject,
                body_preview=body[:300]
            )
            all_sent = SentEmail.objects.filter(user=request.user)
            if all_sent.count() > 5:
                oldest_ids = all_sent.values_list('id', flat=True)[5:]
                SentEmail.objects.filter(id__in=list(oldest_ids)).delete()
            return Response({'success': True, 'message': 'Email sent!'}) 
        except requests.exceptions.HTTPError as e:
            # If the token is invalid (e.g., 401), we could try one more refresh here
            # But for simplicity, we return the error
            return Response({
                'error': 'Failed to send email',
                'detail': response.json() if response.content else str(e)
            }, status=response.status_code)
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Network error while contacting Gmail API', 'detail': str(e)}, status=500)

    def _get_valid_access_token(self, profile):
        """
        Returns a valid Google access token for the user.
        Tries the current token; if expired or missing, attempts a refresh.
        """
        # If we have a token, test it
        if profile.google_access_token:
            try:
                test = requests.get(
                    "https://www.googleapis.com/oauth2/v1/tokeninfo",
                    params={'access_token': profile.google_access_token},
                    timeout=5
                )
                if test.status_code == 200:
                    return profile.google_access_token
                # Token is invalid (expired or revoked)
            except requests.exceptions.RequestException:
                # Network error – treat as possibly expired and try to refresh
                pass

        # Token missing or expired – try to refresh using the refresh token
        if not profile.google_refresh_token:
            return None

        try:
            refresh_response = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'refresh_token': profile.google_refresh_token,
                    'grant_type': 'refresh_token',
                },
                timeout=10
            )
            refresh_response.raise_for_status()
            new_token = refresh_response.json().get('access_token')
            if new_token:
                profile.google_access_token = new_token
                profile.save()
                return new_token
        except requests.exceptions.RequestException:
            # Refresh failed – network or OAuth error
            pass

        return None
    
    
class EmailHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        emails = SentEmail.objects.filter(user=request.user)[:5]
        data = [
            {
                'id': e.id,
                'to': e.to,
                'subject': e.subject,
                # "body": e.body,
                'body_preview': e.body_preview,
                'sent_at': e.sent_at.strftime('%b %d, %Y %I:%M %p'),
            }
            for e in emails
        ]
        return Response({'history': data})
    


from .serializers import UserProfileSerializer
from rest_framework import generics, permissions
class MeView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile
    
    
class MeView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    
    
    





class LastSentEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = SentEmail.objects.filter(user=request.user).first()  # first() because ordered by -sent_at
        if not email:
            return Response({'last_email': None})
        return Response({
            'last_email': {
                'id': email.id,
                'to': email.to,
                'subject': email.subject,
                'body_preview': email.body_preview,
                'sent_at': email.sent_at.strftime('%b %d, %Y %I:%M %p'),
            }
        })