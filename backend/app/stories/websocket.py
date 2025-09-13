"""
WebSocket-Events für Stories-Echtzeit-Features
"""
import logging
from typing import List, Dict, Any
from datetime import datetime
from app.websocket.manager import manager

logger = logging.getLogger(__name__)

class StoriesWebSocket:
    """WebSocket-Handler für Stories-Echtzeit-Events"""
    
    @staticmethod
    async def broadcast_new_story(story_data: Dict[str, Any], followers: List[int]):
        """Neue Story an Follower senden"""
        try:
            message = {
                "type": "new_story",
                "data": {
                    "story_id": story_data["id"],
                    "user_id": story_data["user_id"],
                    "media_url": story_data["media_url"],
                    "media_type": story_data["media_type"],
                    "thumbnail_url": story_data.get("thumbnail_url"),
                    "caption": story_data.get("caption"),
                    "duration": story_data.get("duration", 15),
                    "created_at": story_data["created_at"],
                    "expires_at": story_data["expires_at"],
                    "user_name": story_data.get("user_name"),
                    "user_avatar": story_data.get("user_avatar")
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # An alle Follower senden
            for follower_id in followers:
                await manager.send_personal_message(message, follower_id)
            
            logger.info(f"Neue Story {story_data['id']} an {len(followers)} Follower gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der neuen Story: {e}")
    
    @staticmethod
    async def broadcast_story_view(story_id: int, viewer_id: int, story_owner_id: int):
        """Story-View an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_viewed",
                "data": {
                    "story_id": story_id,
                    "viewer_id": viewer_id,
                    "viewed_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Nur an Story-Ersteller senden (nicht an Viewer selbst)
            if viewer_id != story_owner_id:
                await manager.send_personal_message(message, story_owner_id)
            
            logger.debug(f"Story-View {story_id} von User {viewer_id} an Owner {story_owner_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-View-Benachrichtigung: {e}")
    
    @staticmethod
    async def broadcast_story_reaction(
        story_id: int, 
        reactor_id: int, 
        reaction_type: str, 
        story_owner_id: int
    ):
        """Story-Reaktion an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_reaction",
                "data": {
                    "story_id": story_id,
                    "reactor_id": reactor_id,
                    "reaction_type": reaction_type,
                    "reacted_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Nur an Story-Ersteller senden (nicht an Reagierenden selbst)
            if reactor_id != story_owner_id:
                await manager.send_personal_message(message, story_owner_id)
            
            logger.debug(f"Story-Reaktion {reaction_type} auf Story {story_id} von User {reactor_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-Reaktions-Benachrichtigung: {e}")
    
    @staticmethod
    async def broadcast_story_comment(
        story_id: int, 
        commenter_id: int, 
        comment: str, 
        story_owner_id: int
    ):
        """Story-Kommentar an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_comment",
                "data": {
                    "story_id": story_id,
                    "commenter_id": commenter_id,
                    "comment": comment,
                    "commented_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Nur an Story-Ersteller senden (nicht an Kommentierenden selbst)
            if commenter_id != story_owner_id:
                await manager.send_personal_message(message, story_owner_id)
            
            logger.debug(f"Story-Kommentar auf Story {story_id} von User {commenter_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-Kommentar-Benachrichtigung: {e}")
    
    @staticmethod
    async def broadcast_story_expired(story_id: int, story_owner_id: int):
        """Story-Ablauf an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_expired",
                "data": {
                    "story_id": story_id,
                    "expired_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.send_personal_message(message, story_owner_id)
            
            logger.info(f"Story-Ablauf {story_id} an Owner {story_owner_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-Ablauf-Benachrichtigung: {e}")
    
    @staticmethod
    async def broadcast_story_deleted(story_id: int, story_owner_id: int):
        """Story-Löschung an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_deleted",
                "data": {
                    "story_id": story_id,
                    "deleted_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.send_personal_message(message, story_owner_id)
            
            logger.info(f"Story-Löschung {story_id} an Owner {story_owner_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-Löschungs-Benachrichtigung: {e}")
    
    @staticmethod
    async def send_story_analytics(story_id: int, analytics_data: Dict[str, Any], story_owner_id: int):
        """Story-Analytics an Story-Ersteller senden"""
        try:
            message = {
                "type": "story_analytics",
                "data": {
                    "story_id": story_id,
                    "analytics": analytics_data,
                    "generated_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.send_personal_message(message, story_owner_id)
            
            logger.debug(f"Story-Analytics {story_id} an Owner {story_owner_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Story-Analytics: {e}")
    
    @staticmethod
    async def broadcast_feed_update(user_id: int, new_stories_count: int):
        """Feed-Update an User senden"""
        try:
            message = {
                "type": "feed_update",
                "data": {
                    "new_stories_count": new_stories_count,
                    "updated_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.send_personal_message(message, user_id)
            
            logger.debug(f"Feed-Update mit {new_stories_count} neuen Stories an User {user_id} gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden des Feed-Updates: {e}")
    
    @staticmethod
    async def broadcast_stories_cleanup(cleaned_count: int):
        """Stories-Cleanup-Info an alle verbundenen User senden"""
        try:
            message = {
                "type": "stories_cleanup",
                "data": {
                    "cleaned_stories_count": cleaned_count,
                    "cleaned_at": datetime.utcnow().isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # An alle verbundenen User senden
            connected_users = manager.get_connected_users()
            for user_id in connected_users:
                await manager.send_personal_message(message, user_id)
            
            logger.info(f"Stories-Cleanup-Info an {len(connected_users)} User gesendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der Stories-Cleanup-Info: {e}")
