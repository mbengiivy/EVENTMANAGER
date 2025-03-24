import os
import logging
""" import spacy """
from datetime import datetime
from dotenv import load_dotenv
from datetime import datetime

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets,generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Event, Task, EventTemplate
from vendors.models import Vendor
from reports_serializers import EventReportSerializer, TaskReportSerializer, VendorReportSerializer
from .serializers import EventSerializer, TaskSerializer, UserSerializer, EventTemplateSerializer
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

""" nlp = spacy.load("en_core_web_sm") """

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UserLoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "companycode": user.companycode,
                "token": token.key
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class UserLoginView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "companycode": user.companycode,
                "token": token.key
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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

""" def generate_nlp_template(event_name):
    doc = nlp(event_name)
    template_data = []

    if "conference" in event_name.lower():
        template_data.append({"label": "Speakers", "type": "textarea", "key": "speakers"})
        template_data.append({"label": "Agenda", "type": "textarea", "key": "agenda"})

    for ent in doc.ents:
        if ent.label_ == "GPE":
            template_data.append({"label": "Location", "type": "text", "key": "location"})
        if ent.label_ == "ORG":
            template_data.append({"label": "Organizers", "type": "text", "key": "organizers"})

    if not template_data:
        template_data.append({"label": "Notes", "type": "textarea", "key": "notes"})

    return template_data

class EventTemplateView(generics.ListAPIView):
    serializer_class = EventTemplateSerializer

    def get_queryset(self):
        event_type = self.request.query_params.get('event_type', None)
        if event_type is not None:
            return EventTemplate.objects.filter(event_type__icontains=event_type)
        else:
            return EventTemplate.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        event_type = request.query_params.get('event_type', None)

        if not serializer.data and event_type:
            nlp_template = generate_nlp_template(event_type)
            return Response({"template": nlp_template})
        else:
            if serializer.data:
                return Response({"template": serializer.data[0]['template_data']})
            else:
                return Response({"template": [{"label": "Notes", "type": "textarea", "key": "notes"}]}) """


class CalendarEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Adjust this queryset based on user role if needed
        return Event.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        formatted_events = []
        for event in serializer.data:
            formatted_events.append({
                'id': event['id'],
                'title': event['name'],
                'start': event['event_date'], # Assuming event_date is a date field
                'end': event['event_date'],   # Adjust if you have an end date
                'allDay': True,  # Adjust if you have time-based events
            })
        return Response(formatted_events)