"""
Rate Limiting API Routes für Admin und Monitoring
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any
import logging
from .rate_limit_service import rate_limit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rate-limit", tags=["rate-limit"])

@router.get("/stats")
def get_rate_limit_stats(request: Request):
    """Hole Rate Limit Statistiken für aktuellen Client"""
    try:
        # Extrahiere Client-ID aus Request
        client_id = _get_client_id_from_request(request)
        
        stats = rate_limit_service.get_rate_limit_stats(client_id)
        
        return {
            "client_id": client_id,
            "stats": stats,
            "service_enabled": rate_limit_service.enabled,
            "default_limits": {
                "general": rate_limit_service.default_limit,
                "search": rate_limit_service.search_limit,
                "burst_size": rate_limit_service.burst_size,
                "window_size": rate_limit_service.window_size
            }
        }
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Rate Limit Stats: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Statistiken")

@router.post("/reset/{client_id}")
def reset_rate_limit(client_id: str, endpoint: str = "general"):
    """Reset Rate Limit für spezifischen Client (Admin-Funktion)"""
    try:
        success = rate_limit_service.reset_rate_limit(client_id, endpoint)
        
        if success:
            return {
                "success": True,
                "message": f"Rate limit für Client {client_id} (Endpoint: {endpoint}) zurückgesetzt"
            }
        else:
            raise HTTPException(status_code=500, detail="Fehler beim Zurücksetzen des Rate Limits")
            
    except Exception as e:
        logger.error(f"Fehler beim Reset Rate Limit: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Zurücksetzen")

@router.get("/config")
def get_rate_limit_config():
    """Hole aktuelle Rate Limiting Konfiguration"""
    return {
        "enabled": rate_limit_service.enabled,
        "limits": {
            "general_requests_per_minute": rate_limit_service.default_limit,
            "search_requests_per_minute": rate_limit_service.search_limit,
            "burst_size": rate_limit_service.burst_size,
            "window_size": rate_limit_service.window_size
        },
        "redis_available": True  # Vereinfacht für jetzt
    }

def _get_client_id_from_request(request: Request) -> str:
    """Hilfsfunktion zur Client-ID Extraktion"""
    # X-Forwarded-For Header
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
        return f"ip:{client_ip}"
    
    # X-Real-IP Header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return f"ip:{real_ip}"
    
    # Client IP direkt
    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"
