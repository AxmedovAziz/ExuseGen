from rest_framework.permissions import BasePermission
from .models import UserProfile
class IsAdminUserProfile(BasePermission):
    # if UserProfile.is_admin:
    #     print('hello world ')
    def has_permission(self, request, view):
        print("USER:", request.user)
        print("AUTH:", request.user.is_authenticated)
        if hasattr(request.user, 'profile'):
            print("IS ADMIN:", request.user.profile.is_admin)
            return request.user.profile.is_admin

        # if request.user and request.user.is_authenticated:
        #     print("HAS PROFILE:", hasattr(request.user, 'profile'))


        return False
    
class IsProfileAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and hasattr(user, "profile")
            and user.profile.is_admin
        )