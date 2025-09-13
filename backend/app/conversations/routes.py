"""
Conversations and Messages routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import Conversation, Message, User, Listing
from app.dependencies import get_session, get_current_user, get_current_user_optional
from typing import Optional, List
from datetime import datetime
import logging
from app.notifications.service import NotificationService
from models import Notification, NotificationType
from app.websocket.manager import manager as websocket_manager

# Router für Conversations-Endpoints
router = APIRouter(prefix="/api", tags=["conversations"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Konversationen des Benutzers abrufen"""
    
    # Konversationen abrufen, an denen der Benutzer beteiligt ist
    conversations = session.exec(
        select(Conversation)
        .where(
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        )
        .order_by(Conversation.updated_at.desc())
    ).all()
    
    result = []
    for conversation in conversations:
        # Listing-Informationen abrufen
        listing = session.get(Listing, conversation.listing_id)
        
        # Anderen Benutzer identifizieren
        # Wenn current_user der Käufer ist, ist other_user der Verkäufer (seller_id)
        # Wenn current_user der Verkäufer ist, ist other_user der Käufer (buyer_id)
        other_user_id = conversation.buyer_id if conversation.seller_id == current_user.id else conversation.seller_id
        other_user = session.get(User, other_user_id)
        
        # Letzte Nachricht abrufen
        last_message = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        ).first()
        
        # Ungelesene Nachrichten zählen
        unread_count = session.exec(
            select(func.count(Message.id))
            .where(
                Message.conversation_id == conversation.id,
                Message.sender_id != current_user.id,
                Message.is_read == False
            )
        ).first() or 0
        
        result.append({
            "id": conversation.id,
            "listing": {
                "id": listing.id if listing else None,
                "title": listing.title if listing else "Unbekanntes Listing",
                "price": listing.price if listing else 0,
                "images": listing.images if listing else []
            },
            "other_user": {
                "id": other_user.id if other_user else None,
                "name": (f"{other_user.first_name} {other_user.last_name}".strip() if other_user and (other_user.first_name or other_user.last_name) else None) or (other_user.email.split('@')[0] if other_user else "Unbekannt"),
                "email": other_user.email if other_user else None,
                "avatar": other_user.avatar if other_user else None
            },
            "last_message": {
                "content": last_message.content if last_message else "",
                "created_at": last_message.created_at.isoformat() if last_message else None,
                "sender_id": last_message.sender_id if last_message else None
            },
            "unread_count": unread_count,
            "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
            "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None
        })
    
    return {"conversations": result}

@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Nachrichten einer Konversation abrufen"""
    
    # Konversation prüfen
    conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation nicht gefunden")
    
    # Nachrichten abrufen
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    ).all()
    
    result = []
    for message in messages:
        sender = session.get(User, message.sender_id)
        
        result.append({
            "id": message.id,
            "content": message.content,
            "sender_id": message.sender_id,
            "sender": {
                "id": sender.id if sender else None,
                "name": sender.email.split('@')[0] if sender else "Unbekannt",
                "avatar": sender.avatar if sender else None
            },
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat() if message.created_at else None
        })
    
    # Nachrichten als gelesen markieren (nur die vom anderen User)
    unread_messages = session.exec(
        select(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        )
    ).all()
    
    for message in unread_messages:
        message.is_read = True
        session.add(message)
    
    # Entsprechende Benachrichtigungen als gelesen markieren
    if unread_messages:
        # Alle MESSAGE-Benachrichtigungen für diese Conversation als gelesen markieren
        message_notifications = session.exec(
            select(Notification)
            .where(
                Notification.user_id == current_user.id,
                Notification.type == NotificationType.MESSAGE,
                Notification.related_listing_id == conversation.listing_id,
                Notification.is_read == False
            )
        ).all()
        
        for notification in message_notifications:
            notification.is_read = True
            session.add(notification)
    
    session.commit()
    
    return {"messages": result}

@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: int = Path(...),
    message_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Nachricht in Konversation senden"""
    
    content = message_data.get("content", "")
    if not content or len(content.strip()) < 1:
        raise HTTPException(status_code=400, detail="Nachricht darf nicht leer sein")
    
    # Konversation prüfen
    conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation nicht gefunden")
    
    # Neue Nachricht erstellen
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=content.strip(),
        is_read=False
    )
    
    session.add(message)
    
    # Konversation aktualisieren
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    
    session.commit()
    session.refresh(message)
    
    # Benachrichtigung für den Empfänger erstellen
    try:
        notification_service = NotificationService(session)
        notification_service.notify_new_message(message)
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Nachrichten-Benachrichtigung: {e}")
    
    # WebSocket Event gezielt an Konversationsteilnehmer senden
    try:
        payload = {
            "id": message.id,
            "content": message.content,
            "sender_id": message.sender_id,
            "conversation_id": message.conversation_id,
            "created_at": message.created_at.isoformat() if message.created_at else None,
            "message_type": "text",
            "file_url": None
        }

        # Empfänger bestimmen (der andere Teilnehmer der Konversation)
        receiver_id = conversation.seller_id if current_user.id == conversation.buyer_id else conversation.buyer_id

        # An Empfänger senden
        await websocket_manager.send_message_notification(user_id=receiver_id, message_data=payload)

        # Optional: auch an Sender senden (andere Tabs / Geräte updaten)
        await websocket_manager.send_message_notification(user_id=current_user.id, message_data=payload)
    except Exception as e:
        logger.error(f"Fehler beim Senden des WebSocket-Events: {e}")
    
    return {
        "id": message.id,
        "content": message.content,
        "sender_id": message.sender_id,
        "created_at": message.created_at.isoformat() if message.created_at else None
    }

@router.post("/conversations")
def create_conversation(
    listing_id: int = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Konversation erstellen"""
    
    # Listing prüfen
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Prüfen ob Benutzer nicht der Verkäufer ist
    if listing.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Du kannst keine Konversation mit dir selbst starten")
    
    # Prüfen ob bereits eine Konversation existiert
    existing_conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.listing_id == listing_id,
            Conversation.buyer_id == current_user.id
        )
    ).first()
    
    if existing_conversation:
        raise HTTPException(status_code=400, detail="Konversation existiert bereits")
    
    # Neue Konversation erstellen
    conversation = Conversation(
        listing_id=listing_id,
        buyer_id=current_user.id,
        seller_id=listing.user_id
    )
    
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    return {
        "id": conversation.id,
        "listing_id": listing_id,
        "buyer_id": current_user.id,
        "seller_id": listing.user_id,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None
    }

@router.post("/conversations/{conversation_id}/mark-read")
async def mark_conversation_as_read(
    conversation_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Nachrichten in einer Konversation als gelesen markieren"""
    
    # Konversation prüfen
    conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            or_(
                Conversation.buyer_id == current_user.id,
                Conversation.seller_id == current_user.id
            )
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Konversation nicht gefunden")
    
    # Alle ungelesenen Nachrichten des anderen Users als gelesen markieren
    other_user_id = conversation.seller_id if conversation.buyer_id == current_user.id else conversation.buyer_id
    
    unread_messages = session.exec(
        select(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.sender_id == other_user_id,
            Message.is_read == False
        )
    ).all()
    
    for message in unread_messages:
        message.is_read = True
        session.add(message)
    
    session.commit()
    
    return {"message": "Nachrichten als gelesen markiert", "count": len(unread_messages)}