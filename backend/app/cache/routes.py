"""
Cache-Management-Routes für Redis-Caching
"""
from fastapi import APIRouter
from .redis_service import redis_cache
from .decorators import CacheManager

router = APIRouter(prefix="/api/cache", tags=["cache"])

@router.get("/stats")
def get_cache_stats():
    """Hole Redis-Cache-Statistiken für Performance-Monitoring"""
    return redis_cache.get_stats()

@router.delete("/clear")
def clear_cache():
    """Lösche alle Cache-Daten (Admin-Funktion)"""
    success = redis_cache.clear_all()
    return {
        "success": success,
        "message": "Alle Cache-Daten gelöscht" if success else "Fehler beim Löschen der Cache-Daten"
    }

@router.delete("/listings")
def clear_listings_cache():
    """Lösche Listings-Cache (bei Datenänderungen)"""
    deleted = CacheManager.invalidate_listings_cache()
    return {
        "success": True,
        "deleted_entries": deleted,
        "message": f"{deleted} Listings-Cache-Einträge gelöscht"
    }

@router.delete("/users")
def clear_users_cache():
    """Lösche User-Cache (bei Datenänderungen)"""
    deleted = CacheManager.invalidate_user_cache()
    return {
        "success": True,
        "deleted_entries": deleted,
        "message": f"{deleted} User-Cache-Einträge gelöscht"
    }

@router.delete("/categories")
def clear_categories_cache():
    """Lösche Kategorien-Cache (bei Datenänderungen)"""
    deleted = CacheManager.invalidate_category_cache()
    return {
        "success": True,
        "deleted_entries": deleted,
        "message": f"{deleted} Kategorien-Cache-Einträge gelöscht"
    }

@router.delete("/search")
def clear_search_cache():
    """Lösche Such-Cache (bei Datenänderungen)"""
    deleted = CacheManager.invalidate_search_cache()
    return {
        "success": True,
        "deleted_entries": deleted,
        "message": f"{deleted} Such-Cache-Einträge gelöscht"
    }
