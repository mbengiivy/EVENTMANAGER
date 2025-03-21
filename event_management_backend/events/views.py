import os
import json
import logging
import requests
import openai
import unittest.mock
from datetime import datetime
from dotenv import load_dotenv

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Event, Task
from vendors.models import Vendor
from reports_serializers import EventReportSerializer, TaskReportSerializer, VendorReportSerializer
from .serializers import EventSerializer, TaskSerializer, UserSerializer
from rest_framework.authtoken.models import Token 
from django.conf import settings
from crew_serializers import CrewTaskSerializer, CrewVendorSerializer, CrewEventSerializer 
from rest_framework.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Load environment variables
load_dotenv()

# Get User model
User = get_user_model()

# Set API keys
openai.api_key = os.getenv('OPENAI_API_KEY')
EVENTBRITE_CLIENT_ID = os.getenv('EVENTBRITE_CLIENT_ID')
EVENTBRITE_CLIENT_SECRET = os.getenv('EVENTBRITE_CLIENT_SECRET')
EVENTBRITE_REDIRECT_URI = os.getenv('EVENTBRITE_REDIRECT_URI')
eventbrite_app_token = os.getenv("EVENTBRITE_APP_TOKEN")

# Set up logging
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)


class UserLoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user:
            # 🔥 Generate or retrieve the token
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                "id": user.id,
                "username": user.username,
                "role": user.role,  # Adjust according to your User model
                "companycode": user.companycode,  # Adjust if necessary
                "token": token.key  # 🔥 Include token in response
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    # Uncomment and adjust based on user roles
    """
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role'):
            if user.role == 'captain':
                return Event.objects.filter(captain=user)
            elif user.role == 'team_member':
                return Event.objects.filter(team_members=user)
        return Event.objects.none()
    """

    @action(detail=False, methods=['post'])
    def create_with_openai(self, request):
        name = request.data.get('name')
        date_str = request.data.get('date')
        timezone = "Africa/Nairobi"

        if not name or not date_str:
            return Response({'error': 'Name and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            eventbrite_data = {
                'name': {'html': name},
                'start': {'timezone': timezone, 'utc': date_str},
                'end': {'timezone': timezone, 'utc': date_str},
                'currency': 'KES'
            }

            json_data = json.dumps(eventbrite_data)
            headers = {
                'Authorization': f'Bearer {eventbrite_app_token}',
                'Content-Type': 'application/json',
            }

            organization_id = "YOUR_ORGANIZATION_ID"
            eventbrite_response = requests.post(
                f'https://www.eventbriteapi.com/v3/organizations/{organization_id}/events/',
                headers=headers,
                data=json_data,
            )

            eventbrite_response.raise_for_status()
            eventbrite_event = eventbrite_response.json()

            user = request.user
            event_data = {
                'name': name,
                'date': date_str,
                'chief_planner': user.id,
                'eventbrite_id': eventbrite_event['id'],
                'companycode': user.companycode,
            }

            serializer = self.serializer_class(data=event_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except requests.exceptions.RequestException as e:
            logger.error(f"Eventbrite API error: {e}")
            return Response({'error': f'Eventbrite API error: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def test_create_openai(request):
    return Response({"message": "Test endpoint working!"})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')

        if not event_id:
            return Response(
                {"detail": "Tasks must be created within the context of an event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response(
                {"detail": "Invalid event ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assigned_user_id = request.data.get("assigned_to")
        assigned_user = User.objects.filter(id=assigned_user_id).first()

        if not assigned_user:
            raise ValidationError({"detail": "Invalid assigned user ID."})

        serializer.save(event=event, assigned_to=assigned_user)

        # Send notification to assigned user
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{assigned_user.id}',
            {
                'type': 'send_notification',
                'notification': f'New task assigned: {serializer.data["name"]}',
            }
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # Send notification for task update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{instance.assigned_to.id}',
            {
                'type': 'send_notification',
                'notification': f'Task updated: {serializer.data["name"]}',
            }
        )

        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        companycode = self.request.user.companycode
        if role:
            queryset = queryset.filter(role=role, companycode=companycode)
        else:
            queryset = queryset.filter(companycode=companycode)
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def import_eventbrite_events(request):
    try:
        eventbrite_service = EventbriteService()
        events = eventbrite_service.get_events()

        if events:
            for event in events:
                EventbriteEvent.objects.update_or_create(
                    eventbrite_id=event['id'],
                    defaults={
                        'name': event['name']['text'],
                        'start_time': event['start']['local'],
                        'end_time': event['end']['local'],
                        'user': request.user,
                    }
                )
            return Response({'message': 'Events imported successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to import events'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class TaskReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class VendorReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class CrewTaskViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CrewTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)

    @action(detail=True, methods=['put'])
    def status(self, request, pk=None):
        task = self.get_object()
        task.status = request.data.get('status')
        task.save()
        return Response(CrewTaskSerializer(task).data)

class CrewEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CrewEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(tasks__assigned_to=self.request.user).distinct()


class CrewVendorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CrewVendorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendors_id = Task.objects.filter(assigned_to=self.request.user).values_list('vendors', flat=True).distinct()
        return Vendor.objects.filter(id__in=vendors_id)
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    # Assuming you have a 'role' field in your User model
    role = request.user.role
    return Response({'role': role})