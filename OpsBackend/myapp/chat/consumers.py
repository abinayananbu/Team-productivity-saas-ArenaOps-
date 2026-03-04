# chat/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            self.user = self.scope["user"]
            await self.channel_layer.group_add(
                "general_chat",
                self.channel_name
            )
            await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "general_chat",
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")

        await self.channel_layer.group_send(
            "general_chat",
            {
                "type": "chat_message",
                "message": message,
                "user": self.user.email,
            }
        )

    # ✅ Also add the handler that broadcasts to the group
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "user": event["user"],
        }))
