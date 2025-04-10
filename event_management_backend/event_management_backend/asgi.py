import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from event_management_backend.routing import websocket_urlpatterns # Replace your_app_name
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management_backend.settings') # Replace your_project_name

import event_management_backend.routing # Replace your_app_name

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            event_management_backend.routing.websocket_urlpatterns # Replace your_app_name
        )
    ),
})