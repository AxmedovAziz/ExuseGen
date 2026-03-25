from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    google_access_token = models.TextField(blank=True, null=True)
    google_refresh_token = models.TextField(blank=True, null=True)  # Long-lived token

    def __str__(self):
        return f"{self.user.email}'s profile"
    


class SentEmail(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_emails')
    to = models.EmailField()
    subject = models.CharField(max_length=255)
    body_preview = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.user.email} → {self.to} ({self.sent_at})"