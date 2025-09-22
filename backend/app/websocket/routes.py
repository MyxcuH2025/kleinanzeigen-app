"""
WebSocket routes für Echtzeit-Benachrichtigungen
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from models import User
from app.dependencies import get_session
from app.websocket.manager import manager
from app.dependencies import engine
import logging
import json
import time
from datetime import datetime

# Router für WebSocket-Endpoints
router = APIRouter(prefix="/ws", tags=["websocket"])

# Logging
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

async def get_current_user_from_token(token: str, session: Session) -> User:
    """User aus JWT Token extrahieren"""
    try:
        from jose import jwt, JWTError
        from config import config
        
        # JWT Token verifizieren
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
        user_email = payload.get("sub")
        
        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # User aus E-Mail finden
        user = session.exec(select(User).where(User.email == user_email)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.websocket("/stories")
async def stories_websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    """WebSocket-Endpoint für Echtzeit-Stories-Events"""
    
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    # Session für User-Validierung - Engine aus dependencies.py verwenden
    from app.dependencies import engine
    session = Session(engine)
    
    try:
        # User aus Token validieren
        user = await get_current_user_from_token(token, session)
        
        # WebSocket-Verbindung herstellen
        await manager.connect(websocket, user.id)
        
        # Connection Pool hinzufügen (temporär deaktiviert)
        websocket_id = f"stories_{user.id}_{int(time.time())}"
        # await connection_pool.add_connection(websocket_id, user.id, "stories")
        
        logger.info(f"Stories-WebSocket verbunden für User {user.id} ({user.email})")
        
        # Heartbeat-Nachricht senden
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Stories-WebSocket verbunden",
            "user_id": user.id,
            "websocket_id": websocket_id
        }))
        
        # Auf Nachrichten warten
        while True:
            try:
                # Warten auf Client-Nachrichten
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Aktivität im Connection Pool aktualisieren (temporär deaktiviert)
                # await connection_pool.update_activity(websocket_id)
                
                # Stories-spezifische Nachrichten verarbeiten
                if message.get("type") == "story_view":
        # Rate-Limiting prüfen (temporär deaktiviert)
        # TODO: Rate-Limiting wieder aktivieren
                    
                    # Story-View registrieren
                    story_id = message.get("story_id")
                    if story_id:
                        await _handle_story_view(story_id, user.id, session)
                
                elif message.get("type") == "story_reaction":
                    # Rate-Limiting prüfen (temporär deaktiviert)
                    # TODO: Rate-Limiting wieder aktivieren
                    
                    # Story-Reaction verarbeiten
                    story_id = message.get("story_id")
                    reaction = message.get("reaction")
                    if story_id and reaction:
                        await _handle_story_reaction(story_id, user.id, reaction, session)
                
                elif message.get("type") == "story_reply":
                    # Text-Antwort auf Story
                    story_id = message.get("story_id")
                    text = message.get("text")
                    if story_id and text:
                        await _handle_story_reply(story_id, user.id, text, session)
                
                elif message.get("type") == "ping":
                    # Rate-Limiting für Ping prüfen (temporär deaktiviert)
                    # TODO: Rate-Limiting wieder aktivieren
                    
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }))
                
            except WebSocketDisconnect:
                logger.info(f"Stories-WebSocket getrennt für User {user.id}")
                # Connection Pool bereinigen (temporär deaktiviert)
                # await connection_pool.remove_connection(websocket_id)
                break
            except Exception as e:
                logger.error(f"Stories-WebSocket Fehler für User {user.id}: {e}")
                break
                
    except HTTPException as e:
        logger.error(f"Stories-WebSocket Authentifizierung fehlgeschlagen: {e.detail}")
        await websocket.close(code=1008, reason="Authentication failed")
    except Exception as e:
        logger.error(f"Stories-WebSocket Fehler: {e}")
        await websocket.close(code=1011, reason="Internal server error")
    finally:
        # Verbindung sauber trennen
        manager.disconnect(websocket)
        session.close()

@router.websocket("/notifications")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    """WebSocket-Endpoint für Echtzeit-Benachrichtigungen"""
    
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    # Session für User-Validierung - Engine aus dependencies.py verwenden
    from app.dependencies import engine
    session = Session(engine)
    
    try:
        # User aus Token validieren
        user = await get_current_user_from_token(token, session)
        
        # WebSocket-Verbindung herstellen
        await manager.connect(websocket, user.id)
        
        logger.info(f"WebSocket verbunden für User {user.id} ({user.email})")
        
        # Heartbeat-Nachricht senden
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "WebSocket verbunden",
            "user_id": user.id
        }))
        
        # Auf Nachrichten warten
        while True:
            try:
                # Warten auf Client-Nachrichten (z.B. Ping)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }))
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket getrennt für User {user.id}")
                break
            except Exception as e:
                logger.error(f"WebSocket Fehler für User {user.id}: {e}")
                break
                
    except HTTPException as e:
        logger.error(f"WebSocket Authentifizierung fehlgeschlagen: {e.detail}")
        await websocket.close(code=1008, reason="Authentication failed")
    except Exception as e:
        logger.error(f"WebSocket Fehler: {e}")
        await websocket.close(code=1011, reason="Internal server error")
    finally:
        # Verbindung sauber trennen
        manager.disconnect(websocket)
        session.close()

# Helper-Funktionen für Stories-Events
async def _handle_story_view(story_id: int, user_id: int, session: Session):
    """Story-View registrieren und an Story-Owner senden"""
    try:
        from models.story import StoryView, Story
        from sqlmodel import select
        from datetime import datetime
        
        # Prüfen ob View bereits existiert
        existing_view = session.exec(
            select(StoryView).where(
                StoryView.story_id == story_id,
                StoryView.viewer_id == user_id
            )
        ).first()
        
        if not existing_view:
            # Neuen View erstellen
            story_view = StoryView(
                story_id=story_id,
                viewer_id=user_id,
                viewed_at=datetime.utcnow()
            )
            session.add(story_view)
            session.commit()
            
            # View-Count aktualisieren
            story = session.get(Story, story_id)
            if story:
                story.views_count += 1
                session.add(story)
                session.commit()
                
                # Benachrichtigung an Story-Owner senden
                await _notify_story_owner(story.user_id, {
                    "type": "story_viewed",
                    "story_id": story_id,
                    "viewer_id": user_id,
                    "views_count": story.views_count
                })
                
            logger.info(f"Story {story_id} von User {user_id} angesehen")
            
    except Exception as e:
        logger.error(f"Fehler beim Registrieren von Story-View: {e}")
        session.rollback()

async def _handle_story_reaction(story_id: int, user_id: int, reaction: str, session: Session):
    """Story-Reaction verarbeiten und broadcasten"""
    try:
        from models.story import StoryReaction, Story, StoryReactionType
        from sqlmodel import select
        from datetime import datetime
        
        # Bestehende Reaction prüfen
        existing_reaction = session.exec(
            select(StoryReaction).where(
                StoryReaction.story_id == story_id,
                StoryReaction.user_id == user_id
            )
        ).first()
        
        if existing_reaction:
            # Reaction aktualisieren
            existing_reaction.reaction_type = StoryReactionType(reaction)
            session.add(existing_reaction)
        else:
            # Neue Reaction erstellen
            story_reaction = StoryReaction(
                story_id=story_id,
                user_id=user_id,
                reaction_type=StoryReactionType(reaction),
                created_at=datetime.utcnow()
            )
            session.add(story_reaction)
        
        # Reaction-Count aktualisieren
        story = session.get(Story, story_id)
        if story:
            # Count neu berechnen
            reaction_count = session.exec(
                select(StoryReaction).where(StoryReaction.story_id == story_id)
            ).all()
            story.reactions_count = len(reaction_count)
            session.add(story)
            session.commit()
            
            # Broadcast an alle verbundenen Clients
            await _broadcast_story_reaction(story_id, user_id, reaction, story.reactions_count)
            
        logger.info(f"Story {story_id} Reaction '{reaction}' von User {user_id}")
        
    except Exception as e:
        logger.error(f"Fehler beim Verarbeiten von Story-Reaction: {e}")
        session.rollback()

async def _notify_story_owner(owner_id: int, message: dict):
    """Benachrichtigung an Story-Owner senden"""
    try:
        await manager.send_personal_message(json.dumps(message), owner_id)
    except Exception as e:
        logger.error(f"Fehler beim Senden an Story-Owner {owner_id}: {e}")

async def _broadcast_story_reaction(story_id: int, user_id: int, reaction: str, total_count: int):
    """Story-Reaction an alle verbundenen Clients broadcasten"""
    try:
        message = {
            "type": "story_reaction_update",
            "story_id": story_id,
            "user_id": user_id,
            "reaction": reaction,
            "total_count": total_count
        }
        await manager.broadcast(json.dumps(message))
    except Exception as e:
        logger.error(f"Fehler beim Broadcasten von Story-Reaction: {e}")

async def _handle_story_reply(story_id: int, sender_id: int, text: str, session: Session):
    """Story-Reply verarbeiten: Benachrichtige Story-Owner und broadcast-Event."""
    try:
        from models.story import Story
        from models import Conversation, Message
        from sqlmodel import select, or_, and_
        story = session.get(Story, story_id)
        if not story:
            return
        # DM-Konversation suchen/erstellen (listing_id = None)
        buyer_id = sender_id
        seller_id = story.user_id
        convo = session.exec(
            select(Conversation).where(
                Conversation.listing_id == None,  # noqa: E711
                or_(
                    and_(Conversation.buyer_id == buyer_id, Conversation.seller_id == seller_id),
                    and_(Conversation.buyer_id == seller_id, Conversation.seller_id == buyer_id)
                )
            )
        ).first()
        if not convo:
            convo = Conversation(listing_id=None, buyer_id=buyer_id, seller_id=seller_id)
            session.add(convo)
            session.commit()
            session.refresh(convo)
        # Nachricht speichern (auch bei Selbst-Reply)
        msg = Message(conversation_id=convo.id, sender_id=sender_id, content=text)
        session.add(msg)
        # Konversation nach vorne ziehen
        from datetime import datetime
        convo.updated_at = datetime.utcnow()
        session.commit()
        # Chat-Event an Teilnehmer senden (für ChatPage-Realtime)
        payload = {
            "id": msg.id,
            "content": msg.content,
            "sender_id": msg.sender_id,
            "conversation_id": msg.conversation_id,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
            "message_type": "text",
            "file_url": None
        }
        # Wenn Selbstantwort: nur an Sender
        receiver_id = seller_id if sender_id == buyer_id else buyer_id
        try:
            await manager.send_personal_message(json.dumps({"type": "message", "data": payload}), sender_id)
            if receiver_id != sender_id:
                await manager.send_personal_message(json.dumps({"type": "message", "data": payload}), receiver_id)
        except Exception as _:
            pass
        # An Owner senden
        await manager.send_personal_message(json.dumps({
            "type": "story_reply",
            "story_id": story_id,
            "user_id": sender_id,
            "text": text,
        }), story.user_id)
        # Optional: echo an Sender (andere Tabs)
        await manager.send_personal_message(json.dumps({
            "type": "story_reply",
            "story_id": story_id,
            "user_id": sender_id,
            "text": text,
        }), sender_id)
    except Exception as e:
        logger.error(f"Fehler beim Verarbeiten von Story-Reply: {e}")

@router.websocket("/notifications/{user_id}")
async def websocket_endpoint_with_user(websocket: WebSocket, user_id: int, token: str = Query(None)):
    """Alternative WebSocket-Endpoint mit User-ID im Pfad"""
    
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    # Session für User-Validierung - Engine aus dependencies.py verwenden
    from app.dependencies import engine
    session = Session(engine)
    
    try:
        # User aus Token validieren
        user = await get_current_user_from_token(token, session)
        
        # Prüfen ob User-ID mit Token übereinstimmt
        if user.id != user_id:
            await websocket.close(code=1008, reason="User ID mismatch")
            return
        
        # WebSocket-Verbindung herstellen
        await manager.connect(websocket, user.id)
        
        logger.info(f"WebSocket verbunden für User {user.id} ({user.email})")
        
        # Heartbeat-Nachricht senden
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "WebSocket verbunden",
            "user_id": user.id
        }))
        
        # Auf Nachrichten warten
        while True:
            try:
                # Warten auf Client-Nachrichten (z.B. Ping)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }))
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket getrennt für User {user.id}")
                break
            except Exception as e:
                logger.error(f"WebSocket Fehler für User {user.id}: {e}")
                break
                
    except HTTPException as e:
        logger.error(f"WebSocket Authentifizierung fehlgeschlagen: {e.detail}")
        await websocket.close(code=1008, reason="Authentication failed")
    except Exception as e:
        logger.error(f"WebSocket Fehler: {e}")
        await websocket.close(code=1011, reason="Internal server error")
    finally:
        # Verbindung sauber trennen
        manager.disconnect(websocket)
        session.close()
