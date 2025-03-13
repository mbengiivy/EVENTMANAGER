from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Event, Task
from django.contrib.auth import get_user_model
from vendors.serializers import VendorSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'companycode', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')

class EventSerializer(serializers.ModelSerializer):
    chief_planner = UserSerializer(read_only=True)

    class Meta:
        model = Event
        fields = ('id', 'name', 'date', 'location', 'status', 'chief_planner', 'eventbrite_id', 'companycode')

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    vendors = VendorSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'description', 'status', 'assigned_to', 'event', 'vendors')