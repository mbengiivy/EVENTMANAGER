import os
import logging
import spacy
from datetime import datetime
from dotenv import load_dotenv

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Event, Task, EventTemplate
from vendors.models import Vendor
from reports_serializers import EventReportSerializer, TaskReportSerializer, VendorReportSerializer
from .serializers import EventSerializer, TaskSerializer, UserSerializer, EventTemplateSerializer,TaskReportSerializer
from rest_framework.authtoken.models import Token
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from crew_serializers import CrewTaskSerializer, CrewVendorSerializer, CrewEventSerializer 
from django.http import JsonResponse

# Load environment variables
load_dotenv()

# Get User model
User = get_user_model()

nlp = spacy.load("en_core_web_sm")

logger = logging.getLogger(__name__)

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

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'crew':
            return Task.objects.filter(assigned_to=user)

        # For captains or any other users, show only tasks from events that match their company code
        return Task.objects.filter(event__companycode=user.companycode)


    def create(self, request, *args, **kwargs):
        logger.info(f"Received data: {request.data}")
        event_id = request.data.get('event')
        logger.info(f"Event ID: {event_id}")

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
            return Response({"detail": "Invalid assigned user ID."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(event_id=event.id, assigned_to=assigned_user)

        # Send notification to assigned user
        channel_layer = get_channel_layer()
        try:
            async_to_sync(channel_layer.group_send)(
                f'user_{assigned_user.id}',
                {
                    'type': 'send_notification',
                    'notification': f'New task assigned: {serializer.data["name"]}',
                }
            )
        except Exception as e:
            logger.error(f"Error sending notification: {e}")

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
        try:
            async_to_sync(channel_layer.group_send)(
                f'user_{instance.assigned_to.id}',
                {
                    'type': 'send_notification',
                    'notification': f'Task updated: {serializer.data["name"]}',
                }
            )
        except Exception as e:
            logger.error(f"Error sending notification: {e}")

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

    @action(detail=False, methods=['get'], url_path='me')
    def get_authenticated_user(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_staff,  # Assuming `is_staff` represents admin status
        })

class EventReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class TaskReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class TaskReportList(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class VendorReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class CrewTaskViewSet(viewsets.ModelViewSet):
    """Handles fetching and updating tasks assigned to crew members."""
    queryset = Task.objects.all()
    serializer_class = CrewTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)

    @action(detail=True, methods=['put'])
    def status(self, request, pk=None):
        """Updates the status of a task."""
        task = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ["Pending", "In Progress", "Completed"]:
            return Response({"error": "Invalid status."}, status=400)

        task.status = new_status
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
    role = request.user.role
    return Response({'role': role})

def generate_nlp_template(event_name):
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
                return Response({"template": [{"label": "Notes", "type": "textarea", "key": "notes"}]})

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
                'start': str(event['date']), # Assuming event_date is a date field
                'end': str(event['date']),   # Adjust if you have an end date
                'allDay': True,  # Adjust if you have time-based events
            })
        return Response(formatted_events)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"User role: {user.role}, Company Code: {user.companycode}")  # Debugging line
        queryset = Event.objects.filter(companycode=user.companycode)
        print(f"Filtered Events: {queryset}")  # Debugging line
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save(chief_planner=request.user) # Set chief_planner automatically
        event_name = event.name.lower()
        print(f"Event Name: {event_name}")  # Debugging line

        # Sample templates
        sample_templates = {
            "meeting": [
                {"label": "Attendees", "type": "textarea", "key": "attendees"},
                {"label": "Minutes", "type": "textarea", "key": "minutes"},
                {"label": "Agenda", "type": "textarea", "key": "agenda"},
                {"label": "Action Items", "type": "textarea", "key": "action_items"},
                {"label": "Location", "type": "text", "key": "location"}
            ],

            "workshop": [
                {"label": "Facilitator", "type": "text", "key": "facilitator"},
                {"label": "Materials", "type": "textarea", "key": "materials"},
                {"label": "Objectives", "type": "textarea", "key": "objectives"},
                {"label": "Schedule", "type": "textarea", "key": "schedule"},
                {"label": "Participants", "type": "textarea", "key": "participants"}
            ],
            "conference": [
                {"label": "Speakers", "type": "textarea", "key": "speakers"},
                {"label": "Agenda", "type": "textarea", "key": "agenda"},
                {"label": "Venue", "type": "text", "key": "venue"},
                {"label": "Sponsors", "type": "textarea", "key": "sponsors"},
                {"label": "Registration", "type": "text", "key": "registration"}
            ],
            "webinar": [
                {"label": "Presenter", "type": "text", "key": "presenter"},
                {"label": "Topic", "type": "text", "key": "topic"},
                {"label": "Platform", "type": "text", "key": "platform"},
                {"label": "Q&A", "type": "textarea", "key": "qa"},
                {"label": "Resources", "type": "textarea", "key": "resources"}
            ],
            "party": [
                {"label": "Theme", "type": "text", "key": "theme"},
                {"label": "Guest List", "type": "textarea", "key": "guest_list"},
                {"label": "Venue", "type": "text", "key": "venue"},
                {"label": "Food", "type": "textarea", "key": "food"},
                {"label": "Entertainment", "type": "textarea", "key": "entertainment"}
            ],
            "training": [
                {"label": "Trainer", "type": "text", "key": "trainer"},
                {"label": "Modules", "type": "textarea", "key": "modules"},
                {"label": "Duration", "type": "text", "key": "duration"},
                {"label": "Assessment", "type": "textarea", "key": "assessment"},
                {"label": "Certification", "type": "text", "key": "certification"}
            ],
            "seminar": [
                {"label": "Speaker", "type": "text", "key": "speaker"},
                {"label": "Topic", "type": "text", "key": "topic"},
                {"label": "Location", "type": "text", "key": "location"},
                {"label": "Abstract", "type": "textarea", "key": "abstract"},
                {"label": "Materials", "type": "textarea", "key": "materials"}
            ],
            "launch": [
                {"label": "Product", "type": "text", "key": "product"},
                {"label": "Date", "type": "text", "key": "date"},
                {"label": "Venue", "type": "text", "key": "venue"},
                {"label": "Marketing", "type": "textarea", "key": "marketing"},
                {"label": "Press Release", "type": "textarea", "key": "press_release"}
            ],
            "exhibition": [
                {"label": "Exhibitors", "type": "textarea", "key": "exhibitors"},
                {"label": "Venue", "type": "text", "key": "venue"},
                {"label": "Dates", "type": "text", "key": "dates"},
                {"label": "Layout", "type": "textarea", "key": "layout"},
                {"label": "Attendance", "type": "textarea", "key": "attendance"}
            ],
            "retreat": [
                {"label": "Location", "type": "text", "key": "location"},
                {"label": "Activities", "type": "textarea", "key": "activities"},
                {"label": "Schedule", "type": "textarea", "key": "schedule"},
                {"label": "Participants", "type": "textarea", "key": "participants"},
                {"label": "Objectives", "type": "textarea", "key": "objectives"}
            ],
            "festival": [
                {"label": "Theme", "type": "text", "key": "theme"},
                {"label": "Performances", "type": "textarea", "key": "performances"},
                {"label": "Vendors", "type": "textarea", "key": "vendors"},
                {"label": "Dates", "type": "text", "key": "dates"},
                {"label": "Location", "type": "text", "key": "location"}
            ],
            "concert": [
                {"label": "Artist", "type": "text", "key": "artist"},
                {"label": "Venue", "type": "text", "key": "venue"},
                {"label": "Setlist", "type": "textarea", "key": "setlist"},
                {"label": "Tickets", "type": "text", "key": "tickets"},
                {"label": "Openers", "type": "textarea", "key": "openers"}
            ],
            "wedding": [
                {"label": "Bride & Groom", "type": "text", "key": "bride_groom"},
                {"label": "Venue", "type": "text", "key": "wedding_venue"},
                {"label": "Guest List", "type": "textarea", "key": "wedding_guest_list"},
                {"label": "Catering", "type": "textarea", "key": "catering"},
                {"label": "Photography", "type": "text", "key": "photography"}
            ],
            "burial": [
                {"label": "Deceased", "type": "text", "key": "deceased"},
                {"label": "Service Location", "type": "text", "key": "service_location"},
                {"label": "Obituary", "type": "textarea", "key": "obituary"},
                {"label": "Attendees", "type": "textarea", "key": "burial_attendees"},
                {"label": "Reception", "type": "text", "key": "reception"}
            ],
            "graduation party": [
                {"label": "Graduate", "type": "text", "key": "graduate"},
                {"label": "Venue", "type": "text", "key": "graduation_venue"},
                {"label": "Guest List", "type": "textarea", "key": "graduation_guest_list"},
                {"label": "Decorations", "type": "textarea", "key": "decorations"},
                {"label": "Entertainment", "type": "text", "key": "graduation_entertainment"}
            ],
            "album launch": [
                {"label": "Artist", "type": "text", "key": "album_artist"},
                {"label": "Album Title", "type": "text", "key": "album_title"},
                {"label": "Venue", "type": "text", "key": "album_venue"},
                {"label": "Guest List", "type": "textarea", "key": "album_guest_list"},
                {"label": "Performances", "type": "textarea", "key": "album_performances"}
            ],
            "musical": [
                {"label": "Title", "type": "text", "key": "musical_title"},
                {"label": "Venue", "type": "text", "key": "musical_venue"},
                {"label": "Cast", "type": "textarea", "key": "musical_cast"},
                {"label": "Director", "type": "text", "key": "musical_director"},
                {"label": "Dates", "type": "text", "key": "musical_dates"}
            ],
            "play": [
                {"label": "Title", "type": "text", "key": "play_title"},
                {"label": "Venue", "type": "text", "key": "play_venue"},
                {"label": "Cast", "type": "textarea", "key": "play_cast"},
                {"label": "Director", "type": "text", "key": "play_director"},
                {"label": "Dates", "type": "text", "key": "play_dates"}
            ]
        }

        # Placeholder function for NLP template generation
        def generate_nlp_template(event_name):
            return [{"label": "Custom Field", "type": "text", "key": "custom_field"}]

        # Assign template based on event name
        if event_name in sample_templates:
            event.template = sample_templates[event_name]
        else:
            event.template = generate_nlp_template(event.name)

        event.save()
        print(f"Assigned Template: {event.template}")
        return Response({**serializer.data, "template": event.template}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data["template"] = instance.template if hasattr(instance, "template") else []  # Ensure template exists
        print("Authorization Header:", request.headers.get('Authorization'))

        if not request.user.is_authenticated:
           return JsonResponse({"error": "Unauthorized"}, status=401)

        # Add dynamic field values to the response
        if instance.template:
            for field in instance.template:
                data[field['key']] = getattr(instance, field['key'], '')

        return Response(data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Save the dynamic field values
        field_values = request.data.get('fieldValues', {})
        for key, value in field_values.items():
            setattr(instance, key, value)
        instance.save()

        return Response(serializer.data)

@api_view(['GET'])
def event_detail(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        serialized_event = EventSerializer(event).data
        # Ensure dynamic fields are included
        serialized_event["template"] = event.template  # Assuming `template` is stored in JSONField

        # Add dynamic field values to the response
        if event.template:
            for field in event.template:
                serialized_event[field['key']] = getattr(event, field['key'], '')

        return Response(serialized_event)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)