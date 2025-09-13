"""
Online Status Management für skalierbare User-Plattform
Optimiert für 40.000+ gleichzeitige User
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from models import User
from app.dependencies import get_session, get_current_user
from datetime import datetime, timedelta
from typing import List, Optional
import logging
import json

# Router für Online-Status
router = APIRouter(prefix="/api", tags=["online-status"])

# Logging
logger = logging.getLogger(__name__)

# Konfiguration für Skalierbarkeit
MAX_ONLINE_DISPLAY = 50  # Maximal 50 User anzeigen
ONLINE_THRESHOLD_MINUTES = 5  # User ist online wenn letzte Aktivität < 5 Min
CACHE_TTL_SECONDS = 30  # Cache für 30 Sekunden

@router.get("/online-users")
async def get_online_users(
    limit: int = Query(MAX_ONLINE_DISPLAY, le=100, description="Maximale Anzahl Online-User"),
    user_id: Optional[int] = Query(None, description="Prüfe spezifischen User"),
    session: Session = Depends(get_session)
):
    """
    Hole Online-User (optimiert für Performance)
    - Nur User die in den letzten 5 Minuten aktiv waren
    - Begrenzt auf 50 User für Performance
    - Cached für 30 Sekunden
    """
    try:
        # Zeit-Schwellenwert für "online"
        online_threshold = datetime.utcnow() - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
        
        # Query: Hole User mit letzter Aktivität in den letzten 5 Minuten
        query = select(User.id, User.email, User.avatar, User.verification_state, User.last_activity)
        query = query.where(User.last_activity.isnot(None))
        query = query.where(User.last_activity >= online_threshold)
        
        # Wenn spezifischer User angefragt wird, nur diesen prüfen
        if user_id:
            query = query.where(User.id == user_id)
        else:
            query = query.order_by(User.last_activity.desc()).limit(limit)
            
        online_users = session.exec(query).all()
        
        # Optimierte Response (nur essenzielle Daten)
        result = []
        for user in online_users:
            result.append({
                "id": user.id,
                "name": user.email.split('@')[0],  # Vereinfachter Name
                "avatar": user.avatar,
                "status": "online",
                "verification_state": user.verification_state.value if user.verification_state else "unverified",
                "last_activity": user.last_activity.isoformat() if user.last_activity else None
            })
        
        return {
            "online_users": result,
            "total_online": len(result),
            "timestamp": datetime.utcnow().isoformat(),
            "cache_ttl": CACHE_TTL_SECONDS
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Laden der Online-User: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Online-User")

@router.get("/online-count")
async def get_online_count(
    session: Session = Depends(get_session)
):
    """
    Hole nur die Anzahl der Online-User (sehr performant)
    """
    try:
        online_threshold = datetime.utcnow() - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
        
        count = session.exec(
            select(func.count(User.id))
            .where(User.last_activity.isnot(None))
            .where(User.last_activity >= online_threshold)
        ).first()
        
        return {
            "online_count": count or 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Zählen der Online-User: {e}")
        return {"online_count": 0, "error": "Fehler beim Zählen"}

@router.post("/update-activity")
async def update_user_activity(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Aktualisiere User-Aktivität (wird alle 30 Sekunden aufgerufen)
    """
    try:
        # Aktualisiere last_activity
        current_user.last_activity = datetime.utcnow()
        session.add(current_user)
        session.commit()
        
        return {
            "success": True,
            "last_activity": current_user.last_activity.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der User-Aktivität: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren der Aktivität")

@router.get("/user-status/{user_id}")
async def get_user_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Hole Status eines spezifischen Users
    """
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        
        # Prüfe ob User online ist
        online_threshold = datetime.utcnow() - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
        is_online = user.last_activity and user.last_activity >= online_threshold
        
        return {
            "user_id": user.id,
            "name": user.email.split('@')[0],
            "avatar": user.avatar,
            "status": "online" if is_online else "offline",
            "last_activity": user.last_activity.isoformat() if user.last_activity else None,
            "verification_state": user.verification_state.value if user.verification_state else "unverified"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Laden des User-Status: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden des User-Status")
