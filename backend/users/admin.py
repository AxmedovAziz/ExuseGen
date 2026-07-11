from django.contrib import admin
from django.apps import apps
from django.db import models

# Register your models here.

for model in apps.get_app_config('users').get_models():
    admin.site.register(model)