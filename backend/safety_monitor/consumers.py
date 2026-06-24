import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LiveStreamConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time video frames metadata and bounding box feeds.
    Connects frontend dashboard views with AI service processing loops.
    """
    async def connect(self):
        self.room_group_name = 'live_camera_streams'
        # Join camera stream broadcast group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave camera stream broadcast group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives frame metadata or simulation payloads from AI pipe and broadcasts
        it to all active frontend dashboard viewers.
        """
        data = json.loads(text_data)
        # Broadcast frame coordinates and bounding boxes to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'stream_frame',
                'payload': data
            }
        )

    async def stream_frame(self, event):
        payload = event['payload']
        # Send raw metrics and annotations down to React canvas
        await self.send(text_data=json.dumps(payload))


class AlertsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for instant, high-priority safety alert broadcasts.
    When a violation is recorded by the AI service, an alarm flashes on the dashboard.
    """
    async def connect(self):
        self.room_group_name = 'safety_alerts_broadcast'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Broadcast incoming safety alarm to safety center
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'alert_event',
                'payload': data
            }
        )

    async def alert_event(self, event):
        payload = event['payload']
        await self.send(text_data=json.dumps(payload))
