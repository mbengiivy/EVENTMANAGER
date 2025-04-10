from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Event, Task,EventTemplate
from django.contrib.auth import get_user_model
from vendors.serializers import VendorSerializer, EventVendorSerializer

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
        fields = ['id', 'username', 'password', 'role', 'companycode']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')  # Remove password from validated_data
        user = User(**validated_data)  # Create user without setting password
        user.set_password(password)  # Hash the password properly
        user.save()  # Save the user
        return user

class EventSerializer(serializers.ModelSerializer):
    chief_planner = UserSerializer(read_only=True)
    class Meta:
        model = Event
        fields = '__all__'

    def get_template(self, obj):
        # Assuming you have a way to retrieve the template based on the event's name or type
        # For simplicity, let's assume you can generate it using generate_nlp_template
        from .views import generate_nlp_template # import the template generating function.
        return generate_nlp_template(obj.name) # generate the template.


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    vendors = VendorSerializer(many=True, read_only=True)
    event_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ('id', 'description', 'event', 'assigned_to', 'vendors', 'event_name')

    def get_event_name(self, obj):
        try:
            return Event.objects.get(id=obj.event.id).name # access the id attribute of obj.event
        except Event.DoesNotExist:
            return None


class EventTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTemplate
        fields = '__all__'


class ReportSerializer(serializers.ModelSerializer):
    chief_planner = serializers.SerializerMethodField()

    def get_chief_planner(self, obj):
        return str(obj.chief_planner) if obj.chief_planner else ""

    class Meta:
        model = User
        fields = '__all__'

class TaskReportSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ('id', 'description', 'status', 'due_date', 'assigned_to', 'event', 'vendors', 'assigned_to_name') # Ensure 'assigned_to_name' is included

    def get_assigned_to_name(self, obj):
        try:
            # Access the user ID from the user object
            user_id = obj.assigned_to.id
            user = User.objects.get(id=user_id)
            return user.username
        except User.DoesNotExist:
            return None



class CrewTaskSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)  # To display assigned vendor details

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'status', 'assigned_to', 'vendor']