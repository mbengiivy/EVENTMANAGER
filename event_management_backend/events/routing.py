# routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from . import consumers # Replace your_app_name

websocket_urlpatterns = [
    path('ws/notifications/<int:user_id>/', consumers.NotificationConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})