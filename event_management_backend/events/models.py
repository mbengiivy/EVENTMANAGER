from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from vendors.models import Vendor


class User(AbstractUser):
    role = models.CharField(max_length=10, choices=[('captain', 'Captain'), ('crew', 'Crew')])
    companycode = models.CharField(max_length=20)

    def __str__(self):
        return self.username
    
User = get_user_model()

class Event(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True) #Added this field.
    status = models.CharField(max_length=50, default='Pending')
    chief_planner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events', limit_choices_to={'role': 'captain'})
    eventbrite_id = models.CharField(max_length=255, blank=True, null=True)
    companycode = models.CharField(max_length=20) #added company code.

    def __str__(self):
        return self.name

class Task(models.Model):
    description = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks', limit_choices_to={'role': 'crew'})
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tasks')
    vendors = models.ManyToManyField(Vendor, related_name="task_vendors", blank=True) #added vendor relationship.
    def __str__(self):
        return self.description
    

class EventbriteToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.TextField()
    # Add other fields as needed (e.g., refresh_token, expires_at)

    def __str__(self):
        return f"Eventbrite Token for {self.user.username}"