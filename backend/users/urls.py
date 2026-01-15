# from django.urls import path


# from django.urls import path, include

# urlpatterns = [
#     path('auth/', include('dj_rest_auth.urls')),  # login/logout/password reset API
#     path('auth/registration/', include('dj_rest_auth.registration.urls')),  # signup API
#     path('auth/google/', include('allauth.socialaccount.providers.google.urls')),  # Google OAuth API
#     path('accounts/', include('allauth.urls')),  # ✅ Django web UI for login/signup
# ]


from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView
from . import views

urlpatterns = [
    # JWT endpoints
    path('auth/jwt/create/', views.CustomTokenObtainPairView.as_view(), name='jwt_create'),
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/jwt/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Simple login (alternative)
    path('auth/simple/login/', views.simple_login, name='simple_login'),
    
    # REST Auth endpoints
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Social auth
    path('auth/google/', include('allauth.socialaccount.providers.google.urls')),
    
    # Custom endpoints
    path('auth/user/', views.current_user, name='current_user'),
    path('auth/csrf/', views.get_csrf_token, name='get_csrf_token'),
]