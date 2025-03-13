from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework import viewsets, permissions
from .models import Event, Task
from .serializers import EventSerializer, TaskSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view
import openai
import requests
import os 
import unittest.mock
from dotenv import load_dotenv
import logging
from .models import EventbriteToken
from rest_framework.decorators import api_view
from rest_framework.response import Response

User = get_user_model()
load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')
EVENTBRITE_CLIENT_ID = os.getenv('EVENTBRITE_CLIENT_ID')
EVENTBRITE_CLIENT_SECRET = os.getenv('EVENTBRITE_CLIENT_SECRET')
EVENTBRITE_REDIRECT_URI = os.getenv('EVENTBRITE_REDIRECT_URI')
eventbrite_app_token = os.getenv("EVENTBRITE_APP_TOKEN")

logger = logging.getLogger(__name__)

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
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    

    def get_queryset(self):
        user = self.request.user
        if user.role == 'captain':
            return Event.objects.filter(companycode=user.companycode)
        elif user.role == 'crew':
            return Event.objects.filter(tasks__assigned_to=user, companycode=user.companycode).distinct()
        return Event.objects.none()
    
    

    # def perform_create(self, serializer):
    #    serializer.save(chief_planner=self.request.user,
    #                    companycode=self.request.user.companycode)
        
    @action(detail=False, methods=['post'])
    def create_with_openai(self, request):
        name = request.data.get('name')
        date = request.data.get('date') # Assuming this is a date string like "2024-03-20T10:00:00Z"
        timezone = "Africa/Nairobi" # Replace with the correct timezone for Kenya

        if not name or not date:
            return Response({'error': 'Name and date are required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        with unittest.mock.patch('openai.chat.completions.create') as mock_openai_create:
            # 1. Configure the mock to return a specific response
                mock_response = unittest.mock.Mock()
                mock_message = unittest.mock.Mock()
                mock_message.content = "This is a mock OpenAI response with a detailed event description."  # Your mock content
                mock_response.choices = [unittest.mock.Mock(message=mock_message)]
                mock_openai_create.return_value = mock_response
        try:
            # 1. Get the Eventbrite App Token
            eventbrite_app_token = os.getenv("EVENTBRITE_APP_TOKEN")
            """  # 2. Generate event description with OpenAI
            prompt = (
                f"I have an event named {name} on {date}. "
                "Give me a detailed structure for planning this event, "
                "including a description, agenda, and key tasks."
            )
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
            )
            openai_response = response.choices[0].message['content']
 """
            # 3. Prepare data for Eventbrite API
            eventbrite_data = {
                'event': {
                    'name': {
                        'html': name
                    },
                    'start': {
                        'timezone': timezone,
                        'utc': date  # Use the provided date as the utc
                    },
                    'end': {
                        'timezone': timezone,
                        'utc': date  # Use the provided date as the utc
                    },
                    'currency': 'KES' # using Kenyan Shilling
                }
            }
            logger.debug(f"Eventbrite data: {eventbrite_data}")

            # 4. Call Eventbrite API
            headers = {
                'Authorization': f'Bearer {eventbrite_app_token}',
                'Content-Type': 'application/json',
            }

            eventbrite_response = requests.post(
                'https://www.eventbriteapi.com/v3/events/',
                headers=headers,
                json=eventbrite_data,
            )

            eventbrite_response.raise_for_status()  # Raise HTTPError for bad responses
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


