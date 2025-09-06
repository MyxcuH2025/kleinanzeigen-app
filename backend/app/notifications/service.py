"""
Notification Service für automatische Benachrichtigungen
"""
from sqlmodel import Session, select
from models import (
    Notification, NotificationType, NotificationPreferences,
    User, Listing, Follow, Favorite, Message, Conversation
)
from typing import Optional, Dict, Any
import logging
from datetime import datetime
from app.websocket.manager import manager

logger = logging.getLogger(__name__)

class NotificationService:
    """Service für automatische Benachrichtigungen"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_notification(
        self,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        related_user_id: Optional[int] = None,
        related_listing_id: Optional[int] = None,
        related_entity_id: Optional[int] = None
    ) -> Optional[Notification]:
        """Benachrichtigung erstellen"""
        try:
            # Benachrichtigungseinstellungen prüfen
            if not self._should_send_notification(user_id, notification_type):
                return None
            
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                related_user_id=related_user_id,
                related_listing_id=related_listing_id,
                related_entity_id=related_entity_id
            )
            
            self.session.add(notification)
            self.session.commit()
            self.session.refresh(notification)
            
            logger.info(f"Benachrichtigung erstellt: {notification_type} für User {user_id}")
            
            # WebSocket-Benachrichtigung senden (als Background Task)
            try:
                import asyncio
                asyncio.create_task(self._send_websocket_notification(notification))
            except Exception as e:
                logger.error(f"Fehler beim Senden der WebSocket-Benachrichtigung: {e}")
            
            return notification
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Benachrichtigung: {e}")
            self.session.rollback()
            return None
    
    async def _send_websocket_notification(self, notification: Notification):
        """WebSocket-Benachrichtigung senden"""
        try:
            # Zusätzliche Daten für die Benachrichtigung sammeln
            notification_data = {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat() if notification.created_at else None,
                "related_user_id": notification.related_user_id,
                "related_listing_id": notification.related_listing_id,
                "related_entity_id": notification.related_entity_id
            }
            
            # WebSocket-Benachrichtigung senden
            await manager.send_notification(notification.user_id, notification_data)
            
        except Exception as e:
            logger.error(f"Fehler beim Senden der WebSocket-Benachrichtigung: {e}")
    
    def _should_send_notification(self, user_id: int, notification_type: NotificationType) -> bool:
        """Prüfen ob Benachrichtigung gesendet werden soll basierend auf Einstellungen"""
        try:
            preferences = self.session.exec(
                select(NotificationPreferences).where(NotificationPreferences.user_id == user_id)
            ).first()
            
            if not preferences:
                # Standard-Einstellungen verwenden
                return True
            
            # Mapping von NotificationType zu Preference-Feld
            type_mapping = {
                NotificationType.NEW_LISTING: preferences.inapp_new_listing,
                NotificationType.FOLLOW: preferences.inapp_follow,
                NotificationType.MESSAGE: preferences.inapp_message,
                NotificationType.LISTING_FAVORITE: preferences.inapp_favorite,
                NotificationType.SYSTEM: preferences.inapp_system,
                NotificationType.LISTING_SOLD: preferences.inapp_new_listing,
                NotificationType.LISTING_EXPIRED: preferences.inapp_system,
                NotificationType.LISTING_REPORTED: preferences.inapp_system,
                NotificationType.USER_VERIFIED: preferences.inapp_system,
                NotificationType.PAYMENT_RECEIVED: preferences.inapp_system,
                NotificationType.REVIEW_RECEIVED: preferences.inapp_favorite,
                NotificationType.OFFER_RECEIVED: preferences.inapp_message,
                NotificationType.OFFER_ACCEPTED: preferences.inapp_message,
                NotificationType.OFFER_DECLINED: preferences.inapp_message,
            }
            
            return type_mapping.get(notification_type, True)
            
        except Exception as e:
            logger.error(f"Fehler beim Prüfen der Benachrichtigungseinstellungen: {e}")
            return True
    
    # ============================================================================
    # AUTOMATISCHE TRIGGER
    # ============================================================================
    
    def notify_new_listing(self, listing: Listing) -> None:
        """Benachrichtigung für neue Anzeige von gefolgten Accounts"""
        try:
            # Alle Follower des Users finden
            followers = self.session.exec(
                select(Follow).where(Follow.following_id == listing.user_id)
            ).all()
            
            for follow in followers:
                self.create_notification(
                    user_id=follow.follower_id,
                    notification_type=NotificationType.NEW_LISTING,
                    title="Neue Anzeige von gefolgtem Account",
                    message=f"{listing.title} wurde von einem gefolgten Account erstellt",
                    related_user_id=listing.user_id,
                    related_listing_id=listing.id
                )
                
        except Exception as e:
            logger.error(f"Fehler bei new_listing Benachrichtigung: {e}")
    
    def notify_follow(self, follower_id: int, following_id: int) -> None:
        """Benachrichtigung für neuen Follower"""
        try:
            follower = self.session.get(User, follower_id)
            if not follower:
                return
                
            self.create_notification(
                user_id=following_id,
                notification_type=NotificationType.FOLLOW,
                title="Neuer Follower",
                message=f"{follower.email.split('@')[0]} folgt dir jetzt!",
                related_user_id=follower_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei follow Benachrichtigung: {e}")
    
    def notify_listing_favorite(self, listing_id: int, user_id: int) -> None:
        """Benachrichtigung für favorisierte Anzeige"""
        try:
            listing = self.session.get(Listing, listing_id)
            if not listing:
                return
                
            user = self.session.get(User, user_id)
            if not user:
                return
                
            self.create_notification(
                user_id=listing.user_id,
                notification_type=NotificationType.LISTING_FAVORITE,
                title="Anzeige favorisiert",
                message=f"Deine Anzeige '{listing.title}' wurde zu den Favoriten hinzugefügt",
                related_user_id=user_id,
                related_listing_id=listing_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei listing_favorite Benachrichtigung: {e}")
    
    def notify_new_message(self, message: Message) -> None:
        """Benachrichtigung für neue Nachricht"""
        try:
            # Conversation finden
            conversation = self.session.get(Conversation, message.conversation_id)
            if not conversation:
                return
                
            # Empfänger ist der andere User in der Conversation
            recipient_id = conversation.buyer_id if conversation.buyer_id != message.sender_id else conversation.seller_id
            
            sender = self.session.get(User, message.sender_id)
            if not sender:
                return
                
            self.create_notification(
                user_id=recipient_id,
                notification_type=NotificationType.MESSAGE,
                title="Neue Nachricht",
                message=f"Du hast eine neue Nachricht von {sender.email.split('@')[0]} erhalten",
                related_user_id=message.sender_id,
                related_listing_id=conversation.listing_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei new_message Benachrichtigung: {e}")
    
    def notify_listing_sold(self, listing_id: int) -> None:
        """Benachrichtigung für verkaufte Anzeige"""
        try:
            listing = self.session.get(Listing, listing_id)
            if not listing:
                return
                
            self.create_notification(
                user_id=listing.user_id,
                notification_type=NotificationType.LISTING_SOLD,
                title="Anzeige verkauft",
                message=f"Deine Anzeige '{listing.title}' wurde erfolgreich verkauft!",
                related_listing_id=listing_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei listing_sold Benachrichtigung: {e}")
    
    def notify_listing_expired(self, listing_id: int) -> None:
        """Benachrichtigung für abgelaufene Anzeige"""
        try:
            listing = self.session.get(Listing, listing_id)
            if not listing:
                return
                
            self.create_notification(
                user_id=listing.user_id,
                notification_type=NotificationType.LISTING_EXPIRED,
                title="Anzeige abgelaufen",
                message=f"Deine Anzeige '{listing.title}' ist abgelaufen und wurde deaktiviert",
                related_listing_id=listing_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei listing_expired Benachrichtigung: {e}")
    
    def notify_user_verified(self, user_id: int) -> None:
        """Benachrichtigung für verifizierten User"""
        try:
            self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.USER_VERIFIED,
                title="Account verifiziert",
                message="Dein Account wurde erfolgreich verifiziert! Du kannst jetzt alle Funktionen nutzen.",
                related_user_id=user_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei user_verified Benachrichtigung: {e}")
    
    def notify_review_received(self, listing_id: int, reviewer_id: int) -> None:
        """Benachrichtigung für erhaltene Bewertung"""
        try:
            listing = self.session.get(Listing, listing_id)
            if not listing:
                return
                
            reviewer = self.session.get(User, reviewer_id)
            if not reviewer:
                return
                
            self.create_notification(
                user_id=listing.user_id,
                notification_type=NotificationType.REVIEW_RECEIVED,
                title="Neue Bewertung erhalten",
                message=f"Du hast eine neue Bewertung für deine Anzeige '{listing.title}' erhalten",
                related_user_id=reviewer_id,
                related_listing_id=listing_id
            )
            
        except Exception as e:
            logger.error(f"Fehler bei review_received Benachrichtigung: {e}")
    
    def notify_system_message(self, user_id: int, title: str, message: str) -> None:
        """System-Benachrichtigung"""
        try:
            self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.SYSTEM,
                title=title,
                message=message
            )
            
        except Exception as e:
            logger.error(f"Fehler bei system_message Benachrichtigung: {e}")
    
    # ============================================================================
    # BULK OPERATIONS
    # ============================================================================
    
    def notify_all_users_system(self, title: str, message: str) -> None:
        """System-Benachrichtigung an alle User"""
        try:
            users = self.session.exec(select(User)).all()
            
            for user in users:
                self.create_notification(
                    user_id=user.id,
                    notification_type=NotificationType.SYSTEM,
                    title=title,
                    message=message
                )
                
        except Exception as e:
            logger.error(f"Fehler bei bulk system notification: {e}")
    
    def cleanup_old_notifications(self, days: int = 30) -> int:
        """Alte Benachrichtigungen löschen"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            old_notifications = self.session.exec(
                select(Notification).where(
                    Notification.created_at < cutoff_date,
                    Notification.is_read == True
                )
            ).all()
            
            count = len(old_notifications)
            for notification in old_notifications:
                self.session.delete(notification)
            
            self.session.commit()
            logger.info(f"{count} alte Benachrichtigungen gelöscht")
            return count
            
        except Exception as e:
            logger.error(f"Fehler beim Löschen alter Benachrichtigungen: {e}")
            return 0
