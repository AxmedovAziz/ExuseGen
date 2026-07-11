from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

def csrf_exempt_view(view_func):
    """Decorator to make a view CSRF exempt"""
    return csrf_exempt(view_func)