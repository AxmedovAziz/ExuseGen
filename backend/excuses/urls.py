from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import *
router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet, basename='feedback')
urlpatterns = [
    path("generate/", generate_excuse_view, name="generate_excuse"),
    path('', include(router.urls)), 
    # path('', feedback_view, name='feedback'),
]