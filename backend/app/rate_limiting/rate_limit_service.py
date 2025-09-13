"""
Rate Limiting Service für API-Schutz
Verwendet Redis für verteiltes Rate Limiting
"""
import time
import json
from typing import Optional, Dict, Any
from app.cache.redis_service import redis_cache
from config import config
import logging

logger = logging.getLogger(__name__)

class RateLimitService:
    """Service für API Rate Limiting mit Redis-Backend"""
    
    def __init__(self):
        self.enabled = config.RATE_LIMIT_ENABLED
        self.default_limit = config.RATE_LIMIT_REQUESTS_PER_MINUTE
        self.burst_size = config.RATE_LIMIT_BURST_SIZE
        self.window_size = config.RATE_LIMIT_WINDOW_SIZE
        self.search_limit = config.RATE_LIMIT_SEARCH_REQUESTS_PER_MINUTE
        
    def _get_client_key(self, client_id: str, endpoint: str = "general") -> str:
        """Generiere Redis-Schlüssel für Client-Rate-Limiting"""
        current_minute = int(time.time() // 60)
        return f"rate_limit:{client_id}:{endpoint}:{current_minute}"
    
    def _get_burst_key(self, client_id: str) -> str:
        """Generiere Redis-Schlüssel für Burst-Rate-Limiting"""
        return f"rate_limit:burst:{client_id}"
    
    def check_rate_limit(self, client_id: str, endpoint: str = "general", 
                        custom_limit: Optional[int] = None) -> Dict[str, Any]:
        """
        Prüfe Rate Limit für einen Client
        
        Args:
            client_id: Eindeutige Client-ID (IP, User-ID, etc.)
            endpoint: API-Endpoint-Typ ("search", "general", etc.)
            custom_limit: Custom Rate Limit (optional)
            
        Returns:
            Dict mit Rate Limit Status und Metriken
        """
        if not self.enabled:
            return {
                "allowed": True,
                "limit": custom_limit or self.default_limit,
                "remaining": custom_limit or self.default_limit,
                "reset_time": int(time.time()) + self.window_size,
                "reason": "Rate limiting disabled"
            }
        
        if not redis_cache.is_available():
            logger.warning("Redis nicht verfügbar - Rate Limiting deaktiviert")
            return {
                "allowed": True,
                "limit": custom_limit or self.default_limit,
                "remaining": custom_limit or self.default_limit,
                "reset_time": int(time.time()) + self.window_size,
                "reason": "Redis unavailable"
            }
        
        # Bestimme Limit basierend auf Endpoint
        if endpoint == "search":
            limit = custom_limit or self.search_limit
        else:
            limit = custom_limit or self.default_limit
        
        # Prüfe Burst-Rate-Limiting (Token Bucket)
        burst_key = self._get_burst_key(client_id)
        burst_data = redis_cache.get(burst_key)
        
        if burst_data is None:
            # Initialisiere Burst-Bucket
            burst_data = {"tokens": self.burst_size, "last_update": time.time()}
        else:
            burst_data = json.loads(burst_data) if isinstance(burst_data, str) else burst_data
        
        # Token Bucket Algorithmus
        current_time = time.time()
        time_passed = current_time - burst_data["last_update"]
        
        # Tokens regenerieren (1 Token pro Sekunde)
        new_tokens = min(self.burst_size, burst_data["tokens"] + time_passed)
        burst_data["tokens"] = new_tokens
        burst_data["last_update"] = current_time
        
        # Prüfe ob genug Tokens vorhanden
        if burst_data["tokens"] >= 1:
            burst_data["tokens"] -= 1
            redis_cache.set(burst_key, json.dumps(burst_data), 300)  # 5 Minuten TTL
            burst_allowed = True
        else:
            burst_allowed = False
        
        # Prüfe Minute-basiertes Rate Limiting
        minute_key = self._get_client_key(client_id, endpoint)
        current_count = redis_cache.get(minute_key)
        
        if current_count is None:
            current_count = 0
        else:
            current_count = int(current_count) if isinstance(current_count, str) else current_count
        
        # Prüfe Limit
        if current_count >= limit:
            return {
                "allowed": False,
                "limit": limit,
                "remaining": 0,
                "reset_time": int(time.time()) + self.window_size,
                "reason": f"Rate limit exceeded: {current_count}/{limit} requests per minute",
                "burst_allowed": burst_allowed
            }
        
        # Erhöhe Counter
        new_count = current_count + 1
        redis_cache.set(minute_key, str(new_count), self.window_size)
        
        return {
            "allowed": True,
            "limit": limit,
            "remaining": limit - new_count,
            "reset_time": int(time.time()) + self.window_size,
            "current_count": new_count,
            "burst_allowed": burst_allowed,
            "reason": "Request allowed"
        }
    
    def get_rate_limit_stats(self, client_id: str) -> Dict[str, Any]:
        """Hole Rate Limit Statistiken für einen Client"""
        stats = {}
        
        for endpoint in ["general", "search"]:
            minute_key = self._get_client_key(client_id, endpoint)
            current_count = redis_cache.get(minute_key)
            
            if current_count is not None:
                current_count = int(current_count) if isinstance(current_count, str) else current_count
                limit = self.search_limit if endpoint == "search" else self.default_limit
                
                stats[endpoint] = {
                    "current_count": current_count,
                    "limit": limit,
                    "remaining": limit - current_count,
                    "percentage_used": (current_count / limit) * 100
                }
        
        return stats
    
    def reset_rate_limit(self, client_id: str, endpoint: str = "general") -> bool:
        """Reset Rate Limit für einen Client"""
        try:
            minute_key = self._get_client_key(client_id, endpoint)
            burst_key = self._get_burst_key(client_id)
            
            redis_cache.delete(minute_key)
            redis_cache.delete(burst_key)
            
            logger.info(f"Rate limit reset für Client {client_id}, Endpoint {endpoint}")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Reset Rate Limit: {e}")
            return False

# Singleton Instance
rate_limit_service = RateLimitService()
