from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User,Event,Task  # Import your custom User model

admin.site.register(User, UserAdmin)  # Register it in the Django Admin
admin.site.register(Event)
admin.site.register(Task)