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
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Event, Task, EventbriteToken
from .serializers import EventSerializer, TaskSerializer, UserSerializer

User = get_user_model()
load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')
EVENTBRITE_CLIENT_ID = os.getenv('EVENTBRITE_CLIENT_ID')
EVENTBRITE_CLIENT_SECRET = os.getenv('EVENTBRITE_CLIENT_SECRET')
EVENTBRITE_REDIRECT_URI = os.getenv('EVENTBRITE_REDIRECT_URI')
eventbrite_app_token = os.getenv("EVENTBRITE_APP_TOKEN")

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
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    

    def get_queryset(self):
        user = self.request.user
        if user.role == 'captain':
            return Event.objects.filter(companycode=user.companycode)
        elif user.role == 'crew':
            return Event.objects.filter(tasks__assigned_to=user, companycode=user.companycode).distinct()
        return Event.objects.none()
     
    
        if hasattr(user, 'role'):  # Check if 'role' attribute exists
            if user.role == 'captain':
                return Event.objects.filter(captain=user)
            elif user.role == 'team_member':
                return Event.objects.filter(team_members=user)

    # def perform_create(self, serializer):
    #    serializer.save(chief_planner=self.request.user,
    #                    companycode=self.request.user.companycode)
        
    @action(detail=False, methods=['post'])
    def create_with_openai(self, request):
        name = request.data.get('name')
        date_str = request.data.get('date')  # Get the date string from the request
        timezone = "Africa/Nairobi"  # Replace with the correct timezone

        if not name or not date_str:
            return Response({'error': 'Name and date are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            eventbrite_app_token = os.getenv("EVENTBRITE_APP_TOKEN")

            # Convert date string to Eventbrite's expected format
            # Assuming date_str is in a format like "2024-03-15T10:00:00Z"
            # If it's not, you'll need to parse it accordingly
            # This part might need to be adjusted based on your input format
            utc_date_str = date_str

            eventbrite_data = {
                'name': {
                    'html': name
                },
                'start': {
                    'timezone': timezone,
                    'utc': utc_date_str
                },
                'end': {
                    'timezone': timezone,
                    'utc': utc_date_str
                },
                'currency': 'KES'
            }

            # Convert the dictionary to a JSON string
            json_data = json.dumps(eventbrite_data)

            logger.debug(f"Eventbrite data (JSON): {json_data}")

            headers = {
                'Authorization': f'Bearer {eventbrite_app_token}',
                'Content-Type': 'application/json',
            }

            organization_id = "YOUR_ORGANIZATION_ID"  # NEED TO OBTAIN THIS
            eventbrite_response = requests.post(
                f'https://www.eventbriteapi.com/v3/organizations/{organization_id}/events/',
                headers=headers,
                data=json_data,  # Use data=json_data
            )

            eventbrite_response.raise_for_status()
            eventbrite_event = eventbrite_response.json()

            # 5. Create the event in your database
            user = request.user  # Assuming you still want to associate the event with a user
            event_data = {
                'name': name,
                'date': date,
                'chief_planner': user.id,
                'eventbrite_id': eventbrite_event['id'],
                'companycode': user.companycode,
            }

            # Assuming you have a serializer_class defined in your ViewSet
            serializer = self.serializer_class(data=event_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except requests.exceptions.RequestException as e:
            logger.error(f"Eventbrite API error: {e}")
            return Response({'error': f'Eventbrite API error: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return Response({'error': f'An unexpected error occurred: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except openai.AuthenticationError as e:  # Specific OpenAI exceptions
            logger.error(f"OpenAI Authentication error: {e}")
            return Response({'error': f'OpenAI Authentication error: {e}'},
                            status=status.HTTP_401_UNAUTHORIZED)
        except openai.RateLimitError as e:
            logger.error(f"OpenAI Rate Limit error: {e}")
            return Response({'error': f'OpenAI Rate Limit error: {e}'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)
        except openai.APIConnectionError as e:
            logger.error(f"OpenAI API Connection error: {e}")
            return Response({'error': f'OpenAI API Connection error: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            return Response({'error': f'OpenAI API error: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.exceptions.RequestException as e:
            logger.error(f"Eventbrite API error: {e}")
            return Response({'error': f'Eventbrite API error: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return Response({'error': f'An unexpected error occurred: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
def test_create_openai(request):
    return Response({"message": "Test endpoint working!"})
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


