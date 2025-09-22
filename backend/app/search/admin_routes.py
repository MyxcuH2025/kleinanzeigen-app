"""
Admin-Routes für Search-Management
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session
from typing import Dict, Any
import logging

from app.dependencies import get_session, get_current_user
from models.user import User
from app.search.indexing_service import indexing_service
from app.search.elasticsearch_service import elasticsearch_service

logger = logging.getLogger(__name__)

# Router für Admin Search-Endpoints
router = APIRouter(prefix="/api/admin/search", tags=["admin-search"])

async def verify_admin_user(current_user: User) -> User:
    """Admin-Berechtigung prüfen"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Admin-Berechtigung erforderlich")
    return current_user

@router.get("/stats")
async def get_search_stats(
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Search-Engine-Statistiken für Admins"""
    try:
        stats = {
            "elasticsearch": elasticsearch_service.get_stats(),
            "indexing_service": indexing_service.get_indexing_stats(),
            "config": {
                "elasticsearch_enabled": elasticsearch_service.is_available,
                "fallback_enabled": True  # Immer aktiviert
            }
        }
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Search-Stats: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Statistiken")

@router.post("/reindex/listings")
async def reindex_all_listings(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Alle Listings neu indexieren"""
    try:
        if not elasticsearch_service.is_available:
            raise HTTPException(status_code=503, detail="Elasticsearch nicht verfügbar")
        
        # Starte Re-Indexierung im Hintergrund
        background_tasks.add_task(
            _background_reindex_listings,
            session
        )
        
        return {
            "success": True,
            "message": "Re-Indexierung aller Listings gestartet",
            "status": "running"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Starten der Listing-Re-Indexierung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Starten der Re-Indexierung")

@router.post("/reindex/users")
async def reindex_all_users(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Alle Users neu indexieren"""
    try:
        if not elasticsearch_service.is_available:
            raise HTTPException(status_code=503, detail="Elasticsearch nicht verfügbar")
        
        # Starte Re-Indexierung im Hintergrund
        background_tasks.add_task(
            _background_reindex_users,
            session
        )
        
        return {
            "success": True,
            "message": "Re-Indexierung aller Users gestartet",
            "status": "running"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Starten der User-Re-Indexierung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Starten der Re-Indexierung")

@router.post("/reindex/all")
async def reindex_all(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_admin_user),
    session: Session = Depends(get_session)
):
    """Alle Daten neu indexieren (Listings + Users)"""
    try:
        if not elasticsearch_service.is_available:
            raise HTTPException(status_code=503, detail="Elasticsearch nicht verfügbar")
        
        # Starte vollständige Re-Indexierung im Hintergrund
        background_tasks.add_task(
            _background_reindex_all,
            session
        )
        
        return {
            "success": True,
            "message": "Vollständige Re-Indexierung gestartet",
            "status": "running"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Starten der vollständigen Re-Indexierung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Starten der Re-Indexierung")

@router.delete("/clear/listings")
async def clear_listings_index(
    current_user: User = Depends(verify_admin_user)
):
    """Listings-Index komplett löschen"""
    try:
        if not elasticsearch_service.is_available:
            raise HTTPException(status_code=503, detail="Elasticsearch nicht verfügbar")
        
        # Index löschen
        from config import config
        elasticsearch_service.client.indices.delete(
            index=config.ELASTICSEARCH_INDEX_LISTINGS,
            ignore=[404]  # Ignoriere 404-Fehler wenn Index nicht existiert
        )
        
        # Index neu erstellen
        elasticsearch_service._create_listings_index()
        
        logger.info("Listings-Index gelöscht und neu erstellt")
        
        return {
            "success": True,
            "message": "Listings-Index gelöscht und neu erstellt"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Listings-Index: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen des Index")

@router.delete("/clear/users")
async def clear_users_index(
    current_user: User = Depends(verify_admin_user)
):
    """Users-Index komplett löschen"""
    try:
        if not elasticsearch_service.is_available:
            raise HTTPException(status_code=503, detail="Elasticsearch nicht verfügbar")
        
        # Index löschen
        from config import config
        elasticsearch_service.client.indices.delete(
            index=config.ELASTICSEARCH_INDEX_USERS,
            ignore=[404]  # Ignoriere 404-Fehler wenn Index nicht existiert
        )
        
        # Index neu erstellen
        elasticsearch_service._create_users_index()
        
        logger.info("Users-Index gelöscht und neu erstellt")
        
        return {
            "success": True,
            "message": "Users-Index gelöscht und neu erstellt"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Löschen des Users-Index: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen des Index")

@router.get("/health")
async def search_health_check():
    """Search-Engine Health Check"""
    try:
        health_status = {
            "elasticsearch": {
                "available": elasticsearch_service.is_available,
                "stats": elasticsearch_service.get_stats() if elasticsearch_service.is_available else None
            },
            "indexing_service": {
                "status": "active" if elasticsearch_service.is_available else "inactive"
            },
            "overall_status": "healthy" if elasticsearch_service.is_available else "degraded"
        }
        
        return {
            "success": True,
            "health": health_status
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Health Check: {e}")
        return {
            "success": False,
            "health": {
                "overall_status": "error",
                "error": str(e)
            }
        }

def _background_reindex_listings(session: Session):
    """Hintergrund-Task für Listing-Re-Indexierung"""
    try:
        result = indexing_service.reindex_all_listings(session)
        logger.info(f"Listing-Re-Indexierung abgeschlossen: {result}")
    except Exception as e:
        logger.error(f"Fehler bei Listing-Re-Indexierung: {e}")

def _background_reindex_users(session: Session):
    """Hintergrund-Task für User-Re-Indexierung"""
    try:
        result = indexing_service.reindex_all_users(session)
        logger.info(f"User-Re-Indexierung abgeschlossen: {result}")
    except Exception as e:
        logger.error(f"Fehler bei User-Re-Indexierung: {e}")

def _background_reindex_all(session: Session):
    """Hintergrund-Task für vollständige Re-Indexierung"""
    try:
        # Listings zuerst
        listings_result = indexing_service.reindex_all_listings(session)
        logger.info(f"Listing-Re-Indexierung: {listings_result}")
        
        # Dann Users
        users_result = indexing_service.reindex_all_users(session)
        logger.info(f"User-Re-Indexierung: {users_result}")
        
        logger.info("Vollständige Re-Indexierung abgeschlossen")
    except Exception as e:
        logger.error(f"Fehler bei vollständiger Re-Indexierung: {e}")
