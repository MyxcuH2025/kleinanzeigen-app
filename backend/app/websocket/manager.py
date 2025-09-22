"""
WebSocket Connection Manager für Echtzeit-Benachrichtigungen
"""
from typing import Dict, List, Set
from fastapi import WebSocket
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manager für WebSocket-Verbindungen"""
    
    def __init__(self):
        # Dictionary: user_id -> Set von WebSocket-Verbindungen
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Dictionary: websocket -> user_id (für schnelle Lookups)
        self.connection_users: Dict[WebSocket, int] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """WebSocket-Verbindung hinzufügen"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        self.connection_users[websocket] = user_id
        
        logger.info(f"WebSocket verbunden für User {user_id}. Aktive Verbindungen: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket):
        """WebSocket-Verbindung entfernen"""
        if websocket in self.connection_users:
            user_id = self.connection_users[websocket]
            
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                
                # Wenn keine Verbindungen mehr für diesen User, entferne den Eintrag
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            del self.connection_users[websocket]
            logger.info(f"WebSocket getrennt für User {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Nachricht an einen spezifischen User senden"""
        if user_id in self.active_connections:
            disconnected_connections = set()
            
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Fehler beim Senden der Nachricht an User {user_id}: {e}")
                    disconnected_connections.add(websocket)
            
            # Entferne getrennte Verbindungen
            for websocket in disconnected_connections:
                self.disconnect(websocket)
    
    async def send_notification(self, user_id: int, notification_data: dict):
        """Benachrichtigung an einen User senden"""
        message = {
            "type": "notification",
            "data": notification_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def send_message_notification(self, user_id: int, message_data: dict):
        """Nachrichten-Benachrichtigung an einen User senden"""
        message = {
            "type": "new_message",
            "data": message_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def send_follow_notification(self, user_id: int, follow_data: dict):
        """Follow-Benachrichtigung an einen User senden"""
        message = {
            "type": "new_follower",
            "data": follow_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def send_listing_update(self, user_id: int, listing_data: dict):
        """Listing-Update an einen User senden"""
        message = {
            "type": "listing_update",
            "data": listing_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def send_favorite_update(self, user_id: int, favorite_data: dict):
        """Favorite-Update an einen User senden"""
        message = {
            "type": "favorite_update",
            "data": favorite_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def send_admin_update(self, admin_user_id: int, admin_data: dict):
        """Admin-Update an Admin-User senden"""
        message = {
            "type": "admin_update",
            "data": admin_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, admin_user_id)
    
    async def send_user_status_update(self, user_id: int, status_data: dict):
        """User-Status-Update senden"""
        message = {
            "type": "user_status_update",
            "data": status_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def broadcast_listing_status_change(self, listing_id: int, status: str, user_id: int = None):
        """Broadcast Listing-Status-Änderung an alle relevanten User"""
        message = {
            "type": "listing_status_changed",
            "data": {
                "listing_id": listing_id,
                "status": status,
                "user_id": user_id
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Sende an alle verbundenen User
        disconnected_connections = set()
        
        for uid, websockets in self.active_connections.items():
            for websocket in websockets:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Fehler beim Senden der Listing-Status-Änderung: {e}")
                    disconnected_connections.add(websocket)
        
        # Entferne defekte Verbindungen
        for websocket in disconnected_connections:
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Broadcast-Nachricht an alle verbundenen Clients"""
        disconnected_connections = set()
        
        for user_id, websockets in self.active_connections.items():
            for websocket in websockets:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Fehler beim Broadcast: {e}")
                    disconnected_connections.add(websocket)
        
        # Entferne defekte Verbindungen
        for websocket in disconnected_connections:
            self.disconnect(websocket)
    
    def get_connected_users(self) -> List[int]:
        """Liste aller verbundenen User-IDs"""
        return list(self.active_connections.keys())
    
    def is_user_connected(self, user_id: int) -> bool:
        """Prüfen ob ein User verbunden ist"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    async def broadcast_message(self, conversation_id: int, message_data: dict):
        """Sende Nachricht an alle Clients in der Konversation"""
        # Für jetzt senden wir an alle verbundenen User
        # In einer echten Implementierung würde man die Konversationsteilnehmer ermitteln
        disconnected_connections = set()
        
        for user_id, websockets in self.active_connections.items():
            for websocket in websockets:
                try:
                    await websocket.send_text(json.dumps({
                        "type": "new_message",
                        "data": message_data
                    }))
                except Exception as e:
                    logger.error(f"Fehler beim Senden der Nachricht: {e}")
                    disconnected_connections.add(websocket)
        
        # Entferne defekte Verbindungen
        for websocket in disconnected_connections:
            self.disconnect(websocket)

# Globale Instanz des Connection Managers
manager = ConnectionManager()
