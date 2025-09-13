"""
Middleware für automatische User-Aktivitäts-Updates
Aktualisiert last_activity bei jeder authentifizierten Anfrage
"""
from fastapi import Request, HTTPException
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlmodel import Session, select
from models import User
from app.dependencies import get_session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ActivityUpdateMiddleware(BaseHTTPMiddleware):
    """Middleware das last_activity bei jeder authentifizierten Anfrage aktualisiert"""
    
    async def dispatch(self, request: Request, call_next):
        # Nur für authentifizierte API-Anfragen
        if request.url.path.startswith("/api/") and "authorization" in request.headers:
            try:
                # Token aus Header extrahieren
                auth_header = request.headers.get("authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    
                    # User aus Token finden und last_activity aktualisieren
                    await self.update_user_activity(token)
                    
            except Exception as e:
                logger.warning(f"Activity update failed: {e}")
        
        # Anfrage weiterleiten
        response = await call_next(request)
        return response
    
    async def update_user_activity(self, token: str):
        """Aktualisiert last_activity für den User"""
        try:
            from jose import jwt, JWTError
            from config import config
            
            # Token dekodieren
            payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
            email = payload.get("sub")
            
            if email:
                # User finden und last_activity aktualisieren
                from sqlmodel import create_engine
                from config import config
                
                engine = create_engine(config.DATABASE_URL)
                with Session(engine) as session:
                    user = session.exec(select(User).where(User.email == email)).first()
                    if user:
                        user.last_activity = datetime.utcnow()
                        session.add(user)
                        session.commit()
                        logger.debug(f"Updated activity for user: {email}")
                        
        except JWTError:
            pass  # Ungültiger Token, ignorieren
        except Exception as e:
            logger.warning(f"Activity update error: {e}")
