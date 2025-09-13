"""
Redis Caching Service für Performance-Optimierung
"""
import json
import pickle
import redis
from typing import Any, Optional, Union, Dict, List
from config import config
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RedisCacheService:
    """
    Redis-basierter Caching-Service für maximale Performance
    """
    
    def __init__(self):
        """Initialisiere Redis-Verbindung"""
        try:
            # Redis-Verbindung mit Connection Pool (Version 5.0.1)
            self.redis_client = redis.Redis.from_url(
                config.REDIS_URL,
                password=config.REDIS_PASSWORD,
                max_connections=config.REDIS_MAX_CONNECTIONS,
                socket_timeout=config.REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=config.REDIS_SOCKET_CONNECT_TIMEOUT,
                decode_responses=False,  # Für pickle-Serialisierung
                health_check_interval=30,
                retry_on_timeout=True,
                retry_on_error=[redis.ConnectionError, redis.TimeoutError]
            )
            
            # Test-Verbindung
            self.redis_client.ping()
            logger.info("✅ Redis-Verbindung erfolgreich hergestellt")
            
        except Exception as e:
            logger.error(f"❌ Redis-Verbindungsfehler: {e}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Prüfe ob Redis verfügbar ist"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def _serialize(self, data: Any) -> bytes:
        """Serialisiere Daten für Redis"""
        try:
            # Versuche JSON-Serialisierung zuerst (für einfache Daten)
            if isinstance(data, (dict, list, str, int, float, bool, type(None))):
                return json.dumps(data, ensure_ascii=False).encode('utf-8')
            else:
                # Fallback zu pickle für komplexe Objekte
                return pickle.dumps(data)
        except:
            # Letzter Fallback zu pickle
            return pickle.dumps(data)
    
    def _deserialize(self, data: bytes) -> Any:
        """Deserialisiere Daten aus Redis"""
        try:
            # Versuche JSON-Deserialisierung zuerst
            decoded = data.decode('utf-8')
            return json.loads(decoded)
        except:
            # Fallback zu pickle
            return pickle.loads(data)
    
    def get(self, key: str) -> Optional[Any]:
        """
        Hole Daten aus Cache
        
        Args:
            key: Cache-Schlüssel
            
        Returns:
            Gecachte Daten oder None
        """
        if not self.is_available():
            return None
            
        try:
            data = self.redis_client.get(key)
            if data:
                logger.debug(f"📥 Cache HIT für Schlüssel: {key}")
                return self._deserialize(data)
            else:
                logger.debug(f"📤 Cache MISS für Schlüssel: {key}")
                return None
        except Exception as e:
            logger.error(f"❌ Cache-Fehler beim Abrufen von {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Speichere Daten im Cache
        
        Args:
            key: Cache-Schlüssel
            value: Zu speichernde Daten
            ttl: Time-to-Live in Sekunden
            
        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        if not self.is_available():
            return False
            
        try:
            serialized_data = self._serialize(value)
            result = self.redis_client.set(key, serialized_data, ex=ttl)
            
            if result:
                logger.debug(f"💾 Cache SET für Schlüssel: {key} (TTL: {ttl}s)")
                return True
            else:
                logger.error(f"❌ Cache SET fehlgeschlagen für Schlüssel: {key}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Cache-Fehler beim Speichern von {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Lösche Daten aus Cache
        
        Args:
            key: Cache-Schlüssel
            
        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        if not self.is_available():
            return False
            
        try:
            result = self.redis_client.delete(key)
            if result > 0:
                logger.debug(f"🗑️ Cache DELETE für Schlüssel: {key}")
                return True
            else:
                logger.debug(f"📤 Cache DELETE - Schlüssel nicht gefunden: {key}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Cache-Fehler beim Löschen von {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """
        Lösche alle Cache-Schlüssel die dem Pattern entsprechen
        
        Args:
            pattern: Redis-Pattern (z.B. "listings:*")
            
        Returns:
            Anzahl gelöschter Schlüssel
        """
        if not self.is_available():
            return 0
            
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"🗑️ Cache DELETE PATTERN: {pattern} - {deleted} Schlüssel gelöscht")
                return deleted
            else:
                logger.debug(f"📤 Cache DELETE PATTERN - Keine Schlüssel gefunden: {pattern}")
                return 0
                
        except Exception as e:
            logger.error(f"❌ Cache-Fehler beim Pattern-Löschen {pattern}: {e}")
            return 0
    
    def get_or_set(self, key: str, callback, ttl: Optional[int] = None) -> Any:
        """
        Hole Daten aus Cache oder rufe Callback auf und speichere Ergebnis
        
        Args:
            key: Cache-Schlüssel
            callback: Funktion die aufgerufen wird wenn Cache leer ist
            ttl: Time-to-Live in Sekunden
            
        Returns:
            Daten aus Cache oder Callback-Ergebnis
        """
        # Versuche Cache zu holen
        cached_data = self.get(key)
        if cached_data is not None:
            return cached_data
        
        # Cache leer - rufe Callback auf
        try:
            fresh_data = callback()
            self.set(key, fresh_data, ttl)
            return fresh_data
        except Exception as e:
            logger.error(f"❌ Callback-Fehler für Cache-Schlüssel {key}: {e}")
            raise e
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Hole Redis-Statistiken
        
        Returns:
            Dictionary mit Redis-Statistiken
        """
        if not self.is_available():
            return {"status": "unavailable", "error": "Redis nicht verfügbar"}
            
        try:
            info = self.redis_client.info()
            return {
                "status": "available",
                "version": info.get("redis_version"),
                "connected_clients": info.get("connected_clients"),
                "used_memory_human": info.get("used_memory_human"),
                "total_commands_processed": info.get("total_commands_processed"),
                "keyspace_hits": info.get("keyspace_hits"),
                "keyspace_misses": info.get("keyspace_misses"),
                "hit_rate": self._calculate_hit_rate(info),
                "uptime_in_seconds": info.get("uptime_in_seconds"),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Fehler beim Abrufen der Redis-Statistiken: {e}")
            return {"status": "error", "error": str(e)}
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """Berechne Cache-Hit-Rate"""
        try:
            hits = info.get("keyspace_hits", 0)
            misses = info.get("keyspace_misses", 0)
            total = hits + misses
            return (hits / total * 100) if total > 0 else 0.0
        except:
            return 0.0
    
    def clear_all(self) -> bool:
        """
        Lösche alle Cache-Daten
        
        Returns:
            True wenn erfolgreich
        """
        if not self.is_available():
            return False
            
        try:
            self.redis_client.flushdb()
            logger.info("🗑️ Alle Cache-Daten gelöscht")
            return True
        except Exception as e:
            logger.error(f"❌ Fehler beim Löschen aller Cache-Daten: {e}")
            return False

# Globale Redis-Instanz
redis_cache = RedisCacheService()
