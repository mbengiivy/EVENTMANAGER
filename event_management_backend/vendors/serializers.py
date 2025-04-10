from rest_framework import serializers
from .models import Vendor, EventVendor
from events.models import User

class VendorSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True  # ✅ Make optional
    )

    class Meta:
        model = Vendor
        fields = '__all__'

class EventVendorSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)

    class Meta:
        model = EventVendor
        fields = ['id', 'vendor_name', 'field']
