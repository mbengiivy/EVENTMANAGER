# crew_serializers.py
from rest_framework import serializers
from events.models import Task, Event
from vendors.models import Vendor

class CrewTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'description', 'status', 'assigned_to', 'event']  # Include event

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.assigned_to:
            representation['assigned_to'] = {
                'id': instance.assigned_to.id,
                'username': instance.assigned_to.username
            }
        else:
            representation['assigned_to'] = None

        if instance.event:
            representation['event'] = {
                'id': instance.event.id,
                'name': instance.event.name
            }
        else:
            representation['event'] = None

        return representation
    
class CrewEventSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_tasks(self, obj):
        tasks = Task.objects.filter(event=obj)
        return CrewTaskSerializer(tasks, many=True).data
    

class CrewVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name', 'contact_person', 'contact_email', 'contact_phone'] # limited fields
