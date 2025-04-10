# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        print(f'Attempting connection for user {self.user_id}') #Add this line
        await self.accept()
        print(f'Connection accepted for user {self.user_id}') #Add this line
        await self.send(text_data=json.dumps({'message': f'Connected to user {self.user_id}'}))

    async def disconnect(self, close_code):
        print(f'Disconnected user {self.user_id}')

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        await self.send(text_data=json.dumps({'message': message}))

    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps({'notification': notification}))