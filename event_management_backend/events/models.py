from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from vendors.models import Vendor
from django.db.models import JSONField



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
    chief_planner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events',null=True, blank= True, limit_choices_to={'role': 'captain'})
    companycode = models.CharField(max_length=20) #added company code.
    template = models.JSONField(default=list, blank=True)
    field_values = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    name = models.CharField(max_length=50, default='Assign')
    description = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks', limit_choices_to={'role': 'crew'})
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tasks')
    vendors = models.ManyToManyField(Vendor, related_name="task_vendors", blank=True) 
    due_date = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return self.description
    

class EventTemplate(models.Model):
    event_type = models.CharField(max_length=255, unique=True)
    template_data = JSONField()

    def __str__(self):
        return self.event_type
    