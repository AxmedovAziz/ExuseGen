from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from . import views

urlpatterns = [
    # JWT endpoints
    path('jwt/create/', views.CustomTokenObtainPairView.as_view(), name='jwt_create'),
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('jwt/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Simple login
    path('simple/login/', views.simple_login, name='simple_login'),
    
    # REST Auth
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    
    # Google OAuth - Use the new simple view
    path('google/start/', views.google_auth_start, name='google_auth_start'),
    path('google/callback/', views.SimpleGoogleLogin.as_view(), name='google_callback'),
    
    # User endpoints
    path('user/', views.current_user, name='current_user'),
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
]