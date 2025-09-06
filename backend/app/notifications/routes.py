"""
Notifications routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    Notification, NotificationCreate, NotificationResponse, NotificationStats, NotificationType,
    NotificationPreferences, NotificationPreferencesUpdate,
    User, Listing, Follow, Favorite
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

# Router für Notifications-Endpoints
router = APIRouter(prefix="/api", tags=["notifications"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    unread_only: bool = Query(False, description="Nur ungelesene Benachrichtigungen"),
    limit: int = Query(20, description="Anzahl der Benachrichtigungen pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    session: Session = Depends(get_session)
):
    """Benachrichtigungen des Benutzers abrufen"""
    
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    notifications = session.exec(
        query.order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    result = []
    for notification in notifications:
        # Zusätzliche Informationen basierend auf Typ abrufen
        extra_data = {}
        
        if notification.type == NotificationType.LISTING_FAVORITE and notification.related_listing_id:
            listing = session.get(Listing, notification.related_listing_id)
            if listing:
                extra_data["listing"] = {
                    "id": listing.id,
                    "title": listing.title,
                    "price": listing.price
                }
        
        elif notification.type == NotificationType.FOLLOW and notification.related_user_id:
            user = session.get(User, notification.related_user_id)
            if user:
                extra_data["user"] = {
                    "id": user.id,
                    "name": user.email.split('@')[0],
                    "avatar": user.avatar
                }
        
        result.append({
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "related_user_id": notification.related_user_id,
            "related_listing_id": notification.related_listing_id,
            "related_entity_id": notification.related_entity_id,
            "extra_data": extra_data,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        })
    
    return result

@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigung als gelesen markieren"""
    
    notification = session.exec(
        select(Notification)
        .where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Benachrichtigung nicht gefunden")
    
    notification.is_read = True
    session.add(notification)
    session.commit()
    
    return {"message": "Benachrichtigung als gelesen markiert"}

@router.post("/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Benachrichtigungen als gelesen markieren"""
    
    notifications = session.exec(
        select(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).all()
    
    for notification in notifications:
        notification.is_read = True
        session.add(notification)
    
    session.commit()
    
    return {"message": f"{len(notifications)} Benachrichtigungen als gelesen markiert"}

@router.post("/notifications")
def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigung erstellen (für Tests)"""
    
    # Neue Benachrichtigung erstellen
    notification = Notification(
        user_id=notification_data.user_id,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        related_user_id=notification_data.related_user_id,
        related_listing_id=notification_data.related_listing_id,
        related_entity_id=notification_data.related_entity_id
    )
    
    session.add(notification)
    session.commit()
    session.refresh(notification)
    
    return {
        "id": notification.id,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None
    }

@router.get("/notifications/preferences")
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigungseinstellungen abrufen"""
    
    preferences = session.exec(
        select(NotificationPreferences).where(NotificationPreferences.user_id == current_user.id)
    ).first()
    
    if not preferences:
        # Standard-Einstellungen erstellen
        preferences = NotificationPreferences(user_id=current_user.id)
        session.add(preferences)
        session.commit()
        session.refresh(preferences)
    
    return preferences

@router.put("/notifications/preferences")
def update_notification_preferences(
    preferences_update: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigungseinstellungen aktualisieren"""
    
    preferences = session.exec(
        select(NotificationPreferences).where(NotificationPreferences.user_id == current_user.id)
    ).first()
    
    if not preferences:
        preferences = NotificationPreferences(user_id=current_user.id)
        session.add(preferences)
    
    # Nur gesetzte Felder aktualisieren
    update_data = preferences_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)
    
    preferences.updated_at = datetime.utcnow()
    session.add(preferences)
    session.commit()
    session.refresh(preferences)
    
    return preferences

@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigung löschen"""
    
    notification = session.exec(
        select(Notification)
        .where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Benachrichtigung nicht gefunden")
    
    session.delete(notification)
    session.commit()
    
    return {"message": "Benachrichtigung gelöscht"}

@router.post("/notifications/cleanup")
def cleanup_old_notifications(
    days: int = Query(30, description="Anzahl der Tage für Cleanup"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alte Benachrichtigungen löschen (Admin-Funktion)"""
    
    # Nur Admins können Cleanup durchführen
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Cleanup durchführen")
    
    from app.notifications.service import NotificationService
    notification_service = NotificationService(session)
    
    deleted_count = notification_service.cleanup_old_notifications(days)
    
    return {"message": f"{deleted_count} alte Benachrichtigungen gelöscht"}

@router.post("/notifications/bulk-system")
def send_bulk_system_notification(
    title: str = Body(..., description="Titel der Benachrichtigung"),
    message: str = Body(..., description="Nachricht der Benachrichtigung"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """System-Benachrichtigung an alle User senden (Admin-Funktion)"""
    
    # Nur Admins können Bulk-Benachrichtigungen senden
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Bulk-Benachrichtigungen senden")
    
    from app.notifications.service import NotificationService
    notification_service = NotificationService(session)
    
    notification_service.notify_all_users_system(title, message)
    
    return {"message": "System-Benachrichtigung an alle User gesendet"}

@router.get("/notifications/stats")
def get_notification_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benachrichtigungsstatistiken abrufen"""
    
    # Gesamtanzahl der Benachrichtigungen
    total_notifications = session.exec(
        select(func.count(Notification.id))
        .where(Notification.user_id == current_user.id)
    ).first() or 0
    
    # Ungelesene Benachrichtigungen
    unread_notifications = session.exec(
        select(func.count(Notification.id))
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).first() or 0
    
    # Benachrichtigungen nach Typ
    notifications_by_type = session.exec(
        select(Notification.type, func.count(Notification.id))
        .where(Notification.user_id == current_user.id)
        .group_by(Notification.type)
    ).all()
    
    type_stats = {}
    for notification_type, count in notifications_by_type:
        type_stats[notification_type.value] = count
    
    return {
        "total_notifications": total_notifications,
        "unread_notifications": unread_notifications,
        "read_notifications": total_notifications - unread_notifications,
        "notifications_by_type": type_stats
    }
