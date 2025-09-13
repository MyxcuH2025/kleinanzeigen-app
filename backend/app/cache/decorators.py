"""
Cache-Decorators für einfache Anwendung von Redis-Caching
"""
import functools
import hashlib
from typing import Any, Callable, Optional, Union
from .redis_service import redis_cache
import logging

logger = logging.getLogger(__name__)

def cached(
    ttl: Optional[int] = None,
    key_prefix: str = "",
    cache_condition: Optional[Callable] = None
):
    """
    Decorator für automatisches Caching von Funktionen
    
    Args:
        ttl: Time-to-Live in Sekunden
        key_prefix: Prefix für Cache-Schlüssel
        cache_condition: Funktion die bestimmt ob gecacht werden soll
    
    Usage:
        @cached(ttl=300, key_prefix="listings")
        def get_listings(category: str):
            # Expensive database operation
            return database_query(category)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Prüfe ob Cache verfügbar ist
            if not redis_cache.is_available():
                logger.debug(f"Cache nicht verfügbar, rufe {func.__name__} direkt auf")
                return func(*args, **kwargs)
            
            # Prüfe Cache-Condition
            if cache_condition and not cache_condition(*args, **kwargs):
                logger.debug(f"Cache-Condition nicht erfüllt für {func.__name__}")
                return func(*args, **kwargs)
            
            # Generiere Cache-Schlüssel
            cache_key = _generate_cache_key(func.__name__, key_prefix, *args, **kwargs)
            
            # Versuche aus Cache zu holen
            try:
                cached_result = redis_cache.get(cache_key)
                if cached_result is not None:
                    logger.debug(f"📥 Cache HIT für {func.__name__}: {cache_key}")
                    return cached_result
                
                # Cache MISS - rufe Funktion auf
                logger.debug(f"📤 Cache MISS für {func.__name__}: {cache_key}")
                result = func(*args, **kwargs)
                
                # Speichere Ergebnis im Cache
                redis_cache.set(cache_key, result, ttl)
                logger.debug(f"💾 Cache SET für {func.__name__}: {cache_key}")
                
                return result
                
            except Exception as e:
                logger.error(f"❌ Cache-Fehler in {func.__name__}: {e}")
                # Bei Cache-Fehler: rufe Funktion direkt auf
                return func(*args, **kwargs)
        
        # Cache-Invalidation-Methode hinzufügen
        def invalidate_cache(*args, **kwargs):
            """Invalidiere Cache für diese Funktion"""
            cache_key = _generate_cache_key(func.__name__, key_prefix, *args, **kwargs)
            redis_cache.delete(cache_key)
            logger.info(f"🗑️ Cache invalidiert für {func.__name__}: {cache_key}")
        
        def invalidate_pattern(pattern: str = "*"):
            """Invalidiere alle Cache-Einträge für diese Funktion"""
            full_pattern = f"{key_prefix}:{func.__name__}:{pattern}"
            deleted = redis_cache.delete_pattern(full_pattern)
            logger.info(f"🗑️ Cache-Pattern invalidiert für {func.__name__}: {full_pattern} ({deleted} Einträge)")
        
        # Füge Invalidation-Methoden hinzu
        wrapper.invalidate = invalidate_cache
        wrapper.invalidate_pattern = invalidate_pattern
        
        return wrapper
    return decorator

def cache_listings(ttl: int = 300):
    """Spezieller Decorator für Listings mit Standard-TTL"""
    return cached(ttl=ttl, key_prefix="listings")

def cache_categories(ttl: int = 1800):
    """Spezieller Decorator für Kategorien mit Standard-TTL"""
    return cached(ttl=ttl, key_prefix="categories")

def cache_users(ttl: int = 600):
    """Spezieller Decorator für User-Daten mit Standard-TTL"""
    return cached(ttl=ttl, key_prefix="users")

def cache_search_results(ttl: int = 180):
    """Spezieller Decorator für Suchergebnisse mit Standard-TTL"""
    return cached(ttl=ttl, key_prefix="search")

def _generate_cache_key(func_name: str, prefix: str, *args, **kwargs) -> str:
    """
    Generiere eindeutigen Cache-Schlüssel aus Funktionsname und Parametern
    
    Args:
        func_name: Name der Funktion
        prefix: Prefix für den Schlüssel
        *args: Positionsargumente
        **kwargs: Keyword-Argumente
    
    Returns:
        Eindeutiger Cache-Schlüssel
    """
    # Erstelle String aus allen Parametern
    key_parts = [func_name]
    
    # Füge Positionsargumente hinzu
    for arg in args:
        if isinstance(arg, (str, int, float, bool)):
            key_parts.append(str(arg))
        elif hasattr(arg, 'id'):
            key_parts.append(str(arg.id))
        else:
            key_parts.append(str(type(arg).__name__))
    
    # Füge Keyword-Argumente hinzu (sortiert für Konsistenz)
    for key, value in sorted(kwargs.items()):
        if isinstance(value, (str, int, float, bool)):
            key_parts.append(f"{key}:{value}")
        elif hasattr(value, 'id'):
            key_parts.append(f"{key}:{value.id}")
        else:
            key_parts.append(f"{key}:{type(value).__name__}")
    
    # Erstelle Hash für sehr lange Schlüssel
    key_string = ":".join(key_parts)
    if len(key_string) > 200:
        key_string = hashlib.md5(key_string.encode()).hexdigest()
    
    # Füge Prefix hinzu
    if prefix:
        return f"{prefix}:{key_string}"
    else:
        return key_string

class CacheManager:
    """
    Manager-Klasse für Cache-Operationen
    """
    
    @staticmethod
    def invalidate_listings_cache():
        """Invalidiere alle Listings-Cache-Einträge"""
        deleted = redis_cache.delete_pattern("listings:*")
        logger.info(f"🗑️ Listings-Cache invalidiert: {deleted} Einträge")
        return deleted
    
    @staticmethod
    def invalidate_user_cache(user_id: Optional[int] = None):
        """Invalidiere User-Cache-Einträge"""
        if user_id:
            pattern = f"users:*:{user_id}*"
        else:
            pattern = "users:*"
        deleted = redis_cache.delete_pattern(pattern)
        logger.info(f"🗑️ User-Cache invalidiert: {deleted} Einträge")
        return deleted
    
    @staticmethod
    def invalidate_category_cache():
        """Invalidiere Kategorien-Cache-Einträge"""
        deleted = redis_cache.delete_pattern("categories:*")
        logger.info(f"🗑️ Kategorien-Cache invalidiert: {deleted} Einträge")
        return deleted
    
    @staticmethod
    def invalidate_search_cache():
        """Invalidiere Such-Cache-Einträge"""
        deleted = redis_cache.delete_pattern("search:*")
        logger.info(f"🗑️ Such-Cache invalidiert: {deleted} Einträge")
        return deleted
    
    @staticmethod
    def get_cache_stats():
        """Hole Cache-Statistiken"""
        return redis_cache.get_stats()
    
    @staticmethod
    def clear_all_cache():
        """Lösche alle Cache-Daten"""
        return redis_cache.clear_all()
