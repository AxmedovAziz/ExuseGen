from django.db import models

# Create your models here.
class Feedback(models.Model):
    feedbacktype = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    feedbacktext = models.TextField()
    rating = models.IntegerField()
    email = models.EmailField()

    def __str__(self):
        return f"{self.feedbacktype} - {self.email}"