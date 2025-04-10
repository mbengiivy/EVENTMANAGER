from rest_framework import viewsets, permissions
from .models import Vendor, EventVendor
from events.models import User,Task
from .serializers import VendorSerializer, EventVendorSerializer
from events.serializers import CrewTaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets, serializers


class VendorViewSet(viewsets.ModelViewSet):
    """Handles retrieving and assigning vendors."""
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        assigned_to_id = self.request.data.get('assigned_to')
        if assigned_to_id:
            try:
                user = User.objects.get(pk=assigned_to_id)
                serializer.save(assigned_to=user)
            except User.DoesNotExist:
                raise serializers.ValidationError({"assigned_to": "Invalid user ID."})
        else:
            serializer.save() 

class AssignVendorToTaskViewSet(viewsets.ViewSet):
    """Assigns a vendor to a task."""

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def assign_vendor(self, request):
        task_id = request.data.get("task_id")
        vendor_id = request.data.get("vendor_id")

        try:
            task = Task.objects.get(id=task_id, assigned_to=request.user)
            vendor = Vendor.objects.get(id=vendor_id)
            task.vendor = vendor
            task.save()
            return Response({"message": "Vendor assigned successfully.", "task": CrewTaskSerializer(task).data})
        except Task.DoesNotExist:
            return Response({"error": "Task not found or unauthorized."}, status=403)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found."}, status=404)





"""class EventVendorViewSet(viewsets.ModelViewSet):
    queryset = EventVendor.objects.all()
    serializer_class = EventVendorSerializer

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')
        vendor_id = request.data.get('vendor')
        field = request.data.get('field')

        if not event_id or not vendor_id or not field:
            return Response({"detail": "Event, Vendor, and Field are required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
  """