"""
Notification models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Index
from typing import Optional, Dict
from datetime import datetime
from .enums import NotificationType

class Notification(SQLModel, table=True):
    """Benachrichtigungen für User"""
    __tablename__ = "notification"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", description="Empfänger der Benachrichtigung")
    type: NotificationType = Field(description="Art der Benachrichtigung")
    title: str = Field(max_length=200, description="Titel der Benachrichtigung")
    message: str = Field(max_length=500, description="Nachricht der Benachrichtigung")
    is_read: bool = Field(default=False, description="Ob die Benachrichtigung gelesen wurde")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Wann erstellt")
    
    # Optional: Referenzen zu anderen Entitäten
    related_user_id: Optional[int] = Field(foreign_key="users.id", default=None, description="Verwandter User (z.B. wer gefolgt hat)")
    related_listing_id: Optional[int] = Field(foreign_key="listing.id", default=None, description="Verwandte Anzeige")
    related_entity_id: Optional[int] = Field(default=None, description="Verwandte Entität (Shop, etc.)")
    
    # Indizes für Performance
    __table_args__ = (
        Index("idx_notification_user", "user_id"),
        Index("idx_notification_read", "is_read"),
        Index("idx_notification_created", "created_at"),
    )

class NotificationCreate(SQLModel):
    """Request-Model für Notification-Erstellung"""
    user_id: int
    type: NotificationType
    title: str
    message: str
    related_user_id: Optional[int] = None
    related_listing_id: Optional[int] = None
    related_entity_id: Optional[int] = None

class NotificationResponse(SQLModel):
    """Response-Model für Notification"""
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime
    related_user_id: Optional[int]
    related_listing_id: Optional[int]
    related_entity_id: Optional[int]

class NotificationStats(SQLModel):
    """Statistiken für Benachrichtigungen"""
    total_notifications: int
    unread_notifications: int
    read_notifications: int
    notifications_by_type: Dict[str, int]

class NotificationPreferences(SQLModel, table=True):
    """Benutzer-Benachrichtigungseinstellungen"""
    __tablename__ = "notification_preferences"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, description="User ID")
    
    # E-Mail Benachrichtigungen
    email_new_listing: bool = Field(default=True, description="E-Mail bei neuen Anzeigen von gefolgten Accounts")
    email_follow: bool = Field(default=True, description="E-Mail bei neuen Followern")
    email_message: bool = Field(default=True, description="E-Mail bei neuen Nachrichten")
    email_favorite: bool = Field(default=True, description="E-Mail bei Favoriten")
    email_system: bool = Field(default=True, description="E-Mail bei System-Benachrichtigungen")
    
    # Push Benachrichtigungen
    push_new_listing: bool = Field(default=True, description="Push bei neuen Anzeigen")
    push_follow: bool = Field(default=True, description="Push bei neuen Followern")
    push_message: bool = Field(default=True, description="Push bei neuen Nachrichten")
    push_favorite: bool = Field(default=True, description="Push bei Favoriten")
    push_system: bool = Field(default=False, description="Push bei System-Benachrichtigungen")
    
    # In-App Benachrichtigungen
    inapp_new_listing: bool = Field(default=True, description="In-App bei neuen Anzeigen")
    inapp_follow: bool = Field(default=True, description="In-App bei neuen Followern")
    inapp_message: bool = Field(default=True, description="In-App bei neuen Nachrichten")
    inapp_favorite: bool = Field(default=True, description="In-App bei Favoriten")
    inapp_system: bool = Field(default=True, description="In-App bei System-Benachrichtigungen")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationPreferencesUpdate(SQLModel):
    """Update-Model für Benachrichtigungseinstellungen"""
    email_new_listing: Optional[bool] = None
    email_follow: Optional[bool] = None
    email_message: Optional[bool] = None
    email_favorite: Optional[bool] = None
    email_system: Optional[bool] = None
    push_new_listing: Optional[bool] = None
    push_follow: Optional[bool] = None
    push_message: Optional[bool] = None
    push_favorite: Optional[bool] = None
    push_system: Optional[bool] = None
    inapp_new_listing: Optional[bool] = None
    inapp_follow: Optional[bool] = None
    inapp_message: Optional[bool] = None
    inapp_favorite: Optional[bool] = None
    inapp_system: Optional[bool] = None
