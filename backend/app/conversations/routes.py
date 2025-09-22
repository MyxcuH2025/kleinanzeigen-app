"""
Conversations and Messages routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from sqlalchemy import text
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
logger.setLevel(logging.INFO)

@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Konversationen des Benutzers abrufen"""
    logger.info(f"🔍 GET /api/conversations - User: {current_user.id}")
    try:
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
            # Null-Check für conversation
            if not conversation:
                continue
                
            # Listing-Informationen abrufen
            listing = session.get(Listing, conversation.listing_id) if conversation.listing_id else None
            
            # Anderen Benutzer identifizieren
            # Wenn current_user der Käufer ist, ist other_user der Verkäufer (seller_id)
            # Wenn current_user der Verkäufer ist, ist other_user der Käufer (buyer_id)
            other_user_id = conversation.buyer_id if conversation.seller_id == current_user.id else conversation.seller_id
            other_user = session.get(User, other_user_id) if other_user_id else None
            
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
                    "images": listing.images if listing and listing.images and listing.images != "Array[]" else "[]"
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
    
    except Exception as e:
        logger.error(f"Fehler beim Laden der Conversations: {e}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500, 
            detail="Fehler beim Laden der Conversations",
            headers={"Access-Control-Allow-Origin": "*"}
        )

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
    
    logger.info(f"🔍 send_message aufgerufen: conversation_id={conversation_id}, user_id={current_user.id}")
    
    content = message_data.get("content", "")
    if not content or len(content.strip()) < 1:
        raise HTTPException(status_code=400, detail="Nachricht darf nicht leer sein")
    
    # Konversation prüfen
    logger.info(f"🔍 Suche Conversation {conversation_id} für User {current_user.id}")
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
        logger.error(f"❌ Conversation {conversation_id} nicht gefunden für User {current_user.id}")
        raise HTTPException(status_code=404, detail="Konversation nicht gefunden")
    
    logger.info(f"✅ Conversation {conversation_id} gefunden: buyer_id={conversation.buyer_id}, seller_id={conversation.seller_id}")
    
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
    listing_id_body = Body(...),
    seller_id: int = Query(None, description="Seller ID für direkten User-Chat"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Konversation erstellen (idempotent):
    - akzeptiert Zahl, String oder null im Body
    - für Listing-Chats: listing_id wird verwendet
    - für direkte User-Chats: null wird verwendet, seller_id muss in Query-Parameter
    - gibt bestehende Konversation mit 200 zurück
    - liefert bei allen Fehlern CORS-Header
    """
    logger.info(f"🔍 create_conversation aufgerufen: listing_id_body={listing_id_body}, user_id={current_user.id}")
    logger.info(f"🔍 ROUTE WIRD AUSGEFÜHRT - POST /api/conversations")
    logger.info(f"🔍 ROUTE PARAMETER: listing_id_body={listing_id_body}, user_id={current_user.id}")
    try:
        logger.info(f"🔍 STARTE CONVERSATION-ERSTELLUNG")
        
        # Body-Parameter tolerant parsen
        listing_id = None
        if listing_id_body is not None:
            if isinstance(listing_id_body, str):
                listing_id = int(listing_id_body)
            elif isinstance(listing_id_body, (int, float)):
                listing_id = int(listing_id_body)
            else:
                raise HTTPException(status_code=422, detail="Ungültiger Body: Listing-ID oder null erwartet")
        
        logger.info(f"🔍 LISTING-ID PARSED: {listing_id}")

        if listing_id is not None:
            # Listing-Chat: Bestehende Logik
            # Listing prüfen
            listing = session.get(Listing, listing_id)
            if not listing:
                raise HTTPException(status_code=404, detail="Listing nicht gefunden")

            # Selbst-Chat verhindern
            if listing.user_id == current_user.id:
                return {
                    "id": None,
                    "message": "Selbst-Nachrichten sind nicht erlaubt"
                }
            
            seller_id = listing.user_id
        else:
            # Direkter User-Chat: seller_id aus Query-Parameter verwenden
            if not seller_id:
                raise HTTPException(status_code=400, detail="seller_id Query-Parameter erforderlich für direkten User-Chat")
            
            # Selbst-Chat verhindern
            if seller_id == current_user.id:
                return {
                    "id": None,
                    "message": "Selbst-Nachrichten sind nicht erlaubt"
                }
            
            logger.info(f"🔍 DIREKTER USER-CHAT: seller_id={seller_id}")

        # Bestehend? - Prüfung mit besserer SQLite-Kompatibilität
        if listing_id is not None:
            # Listing-Chat: Suche nach listing_id
            existing_conversation = session.exec(
                select(Conversation)
                .where(
                    Conversation.listing_id == listing_id,
                    Conversation.buyer_id == current_user.id
                )
            ).first()
        else:
            # Direkter User-Chat: Suche nach seller_id ohne listing_id
            existing_conversation = session.exec(
                select(Conversation)
                .where(
                    Conversation.listing_id.is_(None),
                    Conversation.buyer_id == current_user.id,
                    Conversation.seller_id == seller_id
                )
            ).first()

        if existing_conversation:
            return {
                "id": existing_conversation.id,
                "listing_id": listing_id,
                "buyer_id": existing_conversation.buyer_id,
                "seller_id": existing_conversation.seller_id,
                "created_at": existing_conversation.created_at.isoformat() if existing_conversation.created_at else None
            }

        # Neu anlegen – SQLModel-Ansatz mit expliziter Session-Behandlung
        now = datetime.utcnow()
        conversation = Conversation(
            listing_id=listing_id,
            buyer_id=current_user.id,
            seller_id=listing.user_id,
            created_at=now,
            updated_at=now
        )
        
        session.add(conversation)
        session.flush()  # Flush um ID zu erhalten, ohne zu committen
        
        # ID direkt aus dem Objekt holen (nach flush verfügbar)
        conversation_id = conversation.id
        logger.info(f"✅ Conversation erstellt: ID={conversation_id}, listing_id={listing_id}")
        
        # WICHTIG: Alle benötigten Werte vor session.close() holen
        seller_id = listing.user_id
        created_at_iso = now.isoformat()
        
        session.commit()
        logger.info(f"✅ Session committed für Conversation {conversation_id}")
        
        # Standard SQLAlchemy Session-Management beibehalten
        # Die Session wird automatisch durch FastAPI's Depends(get_session) geschlossen
        logger.info(f"✅ Conversation {conversation_id} erfolgreich erstellt und committed (Standard-Session-Management)")

        return {
            "id": conversation_id,
            "listing_id": listing_id,
            "buyer_id": current_user.id,
            "seller_id": seller_id,
            "created_at": created_at_iso
        }
        
    except HTTPException as e:
        # CORS-Header ergänzen
        raise HTTPException(status_code=e.status_code, detail=e.detail, headers={"Access-Control-Allow-Origin": "*"})
    except ValueError as ve:
        logger.error(f"ValueError bei create_conversation: {ve}")
        raise HTTPException(status_code=422, detail="Listing-ID muss Zahl sein", headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        logger.error(f"Fehler bei create_conversation: {type(e).__name__}: {e}")
        session.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Fehler beim Erstellen der Konversation", 
            headers={"Access-Control-Allow-Origin": "*"}
        )

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