"""
WebSocket routes für Echtzeit-Benachrichtigungen
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from models import User
from app.dependencies import get_session
from app.websocket.manager import manager
import logging
import json

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

@router.websocket("/notifications")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    """WebSocket-Endpoint für Echtzeit-Benachrichtigungen"""
    
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    # Session für User-Validierung
    from config import config
    from sqlmodel import create_engine
    engine = create_engine(config.DATABASE_URL)
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

@router.websocket("/notifications/{user_id}")
async def websocket_endpoint_with_user(websocket: WebSocket, user_id: int, token: str = Query(None)):
    """Alternative WebSocket-Endpoint mit User-ID im Pfad"""
    
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    # Session für User-Validierung
    from config import config
    from sqlmodel import create_engine
    engine = create_engine(config.DATABASE_URL)
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
