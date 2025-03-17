from rest_framework import viewsets, permissions
from .models import Vendor
from events.models import User
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

def get_queryset(self):
        return Vendor.objects.all()

def perform_create(self, serializer):
    assigned_user_id = self.request.data.get("assigned_to")  
    if isinstance(assigned_user_id, dict):  # Handle nested object case
        assigned_user_id = assigned_user_id.get("id")

    try:
        assigned_user = User.objects.get(id=assigned_user_id)
    except User.DoesNotExist:
        raise serializer.ValidationError({"assigned_to": "Invalid user ID."})

    serializer.save(assigned_to=assigned_user)
