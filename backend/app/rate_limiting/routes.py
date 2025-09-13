"""
Rate-Limiting Admin Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Dict, Any, Optional
import logging

from app.dependencies import get_session, get_current_user
from models.user import User
from app.rate_limiting.websocket_limiter import websocket_rate_limiter

router = APIRouter(prefix="/api/admin/rate-limiting", tags=["admin-rate-limiting"])
logger = logging.getLogger(__name__)

async def verify_admin_user(current_user: User) -> User:
    """Admin-Berechtigung prüfen"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Admin-Berechtigung erforderlich")
    return current_user

@router.get("/stats")
async def get_rate_limiting_stats(
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Globale Rate-Limiting-Statistiken abrufen"""
    try:
        stats = websocket_rate_limiter.get_global_stats()
        
        return {
            "success": True,
            "stats": stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Rate-Limiting-Stats: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Statistiken")

@router.get("/user/{user_id}")
async def get_user_rate_limiting_stats(
    user_id: int,
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """User-spezifische Rate-Limiting-Statistiken"""
    try:
        user_stats = websocket_rate_limiter.get_user_stats(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "user_stats": user_stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der User-Rate-Limiting-Stats für {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der User-Statistiken")

@router.post("/user/{user_id}/reset")
async def reset_user_rate_limits(
    user_id: int,
    event_type: Optional[str] = Query(None, description="Spezifischer Event-Type oder alle zurücksetzen"),
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Rate-Limits für User zurücksetzen"""
    try:
        websocket_rate_limiter.reset_user_limits(user_id, event_type)
        
        return {
            "success": True,
            "message": f"Rate-Limits für User {user_id} zurückgesetzt",
            "event_type": event_type or "alle",
            "reset_by": current_user.id,
            "reset_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Zurücksetzen der Rate-Limits für User {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Zurücksetzen der Rate-Limits")

@router.put("/config/{event_type}")
async def update_rate_limit_config(
    event_type: str,
    max_requests: int = Query(..., ge=1, le=1000, description="Maximale Requests pro Zeitfenster"),
    window_seconds: int = Query(..., ge=10, le=3600, description="Zeitfenster in Sekunden"),
    message: str = Query(..., description="Fehlermeldung bei Rate-Limit-Überschreitung"),
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Rate-Limit-Konfiguration aktualisieren"""
    try:
        websocket_rate_limiter.update_rate_limits(event_type, max_requests, window_seconds, message)
        
        return {
            "success": True,
            "message": f"Rate-Limit für {event_type} aktualisiert",
            "config": {
                "event_type": event_type,
                "max_requests": max_requests,
                "window_seconds": window_seconds,
                "message": message
            },
            "updated_by": current_user.id,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Rate-Limit-Konfiguration für {event_type}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren der Konfiguration")

@router.get("/config")
async def get_rate_limit_configs(
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Aktuelle Rate-Limit-Konfigurationen abrufen"""
    try:
        global_stats = websocket_rate_limiter.get_global_stats()
        
        return {
            "success": True,
            "configs": global_stats.get("rate_limit_configs", {}),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Rate-Limit-Konfigurationen: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Konfigurationen")

@router.get("/health")
async def get_rate_limiting_health(
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Health-Check für Rate-Limiting-System"""
    try:
        global_stats = websocket_rate_limiter.get_global_stats()
        
        # Health-Status bestimmen
        health_status = "healthy"
        issues = []
        
        # Prüfen ob zu viele User blockiert sind
        active_users = global_stats.get("active_users", 0)
        blocked_users = global_stats.get("blocked_users", 0)
        
        if active_users > 0:
            blocked_percentage = (blocked_users / active_users) * 100
            if blocked_percentage > 10:  # Mehr als 10% blockiert
                health_status = "warning"
                issues.append(f"Hoher Anteil blockierter User: {blocked_percentage:.1f}%")
        
        # Prüfen ob Cleanup funktioniert
        next_cleanup = global_stats.get("next_cleanup_in", 0)
        if next_cleanup < 0:  # Cleanup ist überfällig
            health_status = "warning"
            issues.append("Cleanup ist überfällig")
        
        return {
            "success": True,
            "health": {
                "status": health_status,
                "active_users": active_users,
                "blocked_users": blocked_users,
                "blocked_percentage": round((blocked_users / active_users) * 100, 2) if active_users > 0 else 0,
                "issues": issues,
                "last_cleanup": global_stats.get("last_cleanup", 0),
                "next_cleanup_in": next_cleanup
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Health-Check des Rate-Limiting-Systems: {e}")
        return {
            "success": False,
            "health": {
                "status": "error",
                "error": str(e)
            },
            "generated_at": datetime.utcnow().isoformat()
        }

# Import für datetime
from datetime import datetime