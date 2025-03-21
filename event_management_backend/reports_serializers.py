# reports_serializers.py
from rest_framework import serializers
from events.models import Event, Task
from vendors.models import Vendor

class EventReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'  # Or specify the fields you want in the report

class TaskReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'  # Or specify the fields you want in the report

class VendorReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'  # Or specify the fields you want in the report