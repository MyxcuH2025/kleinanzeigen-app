"""
WebSocket Rate Limiting für Stories-Events
"""
import time
import logging
from typing import Dict, Optional
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@dataclass
class RateLimit:
    """Rate-Limit-Konfiguration"""
    max_requests: int
    window_seconds: int
    message: str

class WebSocketRateLimiter:
    """Rate-Limiter für WebSocket-Events"""
    
    def __init__(self):
        # Rate-Limits für verschiedene Event-Typen
        self.rate_limits = {
            'story_view': RateLimit(
                max_requests=10,  # 10 Views pro Minute
                window_seconds=60,
                message="Zu viele Story-Views. Bitte warten Sie einen Moment."
            ),
            'story_reaction': RateLimit(
                max_requests=20,  # 20 Reactions pro Minute
                window_seconds=60,
                message="Zu viele Reactions. Bitte warten Sie einen Moment."
            ),
            'ping': RateLimit(
                max_requests=120,  # 120 Pings pro Minute (alle 30s)
                window_seconds=60,
                message="Zu viele Ping-Nachrichten."
            )
        }
        
        # Tracking-Datenstrukturen
        self.user_requests: Dict[int, Dict[str, deque]] = defaultdict(lambda: defaultdict(deque))
        self.blocked_users: Dict[int, Dict[str, float]] = defaultdict(dict)
        
        # Cleanup-Intervall
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 Minuten
    
    def is_rate_limited(self, user_id: int, event_type: str) -> tuple[bool, Optional[str]]:
        """
        Prüft ob User für Event-Type rate-limited ist
        
        Returns:
            (is_limited, error_message)
        """
        try:
            # Cleanup alte Daten
            self._cleanup_old_data()
            
            # Rate-Limit für Event-Type prüfen
            if event_type not in self.rate_limits:
                return False, None
            
            rate_limit = self.rate_limits[event_type]
            current_time = time.time()
            
            # Blocked-User prüfen
            if event_type in self.blocked_users[user_id]:
                block_until = self.blocked_users[user_id][event_type]
                if current_time < block_until:
                    remaining_time = int(block_until - current_time)
                    return True, f"Sie sind für {remaining_time} Sekunden blockiert. {rate_limit.message}"
                else:
                    # Block-Zeit abgelaufen
                    del self.blocked_users[user_id][event_type]
            
            # Request-History für User und Event-Type
            user_requests = self.user_requests[user_id][event_type]
            
            # Alte Requests entfernen (außerhalb des Zeitfensters)
            cutoff_time = current_time - rate_limit.window_seconds
            while user_requests and user_requests[0] < cutoff_time:
                user_requests.popleft()
            
            # Rate-Limit prüfen
            if len(user_requests) >= rate_limit.max_requests:
                # User für 2x das Zeitfenster blockieren
                block_duration = rate_limit.window_seconds * 2
                self.blocked_users[user_id][event_type] = current_time + block_duration
                
                logger.warning(f"Rate-Limit für User {user_id} bei {event_type}: {len(user_requests)}/{rate_limit.max_requests}")
                return True, rate_limit.message
            
            # Request hinzufügen
            user_requests.append(current_time)
            return False, None
            
        except Exception as e:
            logger.error(f"Fehler beim Rate-Limiting für User {user_id}, Event {event_type}: {e}")
            return False, None
    
    def get_user_stats(self, user_id: int) -> Dict[str, Dict[str, int]]:
        """User-spezifische Rate-Limit-Statistiken"""
        try:
            stats = {}
            current_time = time.time()
            
            for event_type, rate_limit in self.rate_limits.items():
                user_requests = self.user_requests[user_id][event_type]
                
                # Alte Requests entfernen
                cutoff_time = current_time - rate_limit.window_seconds
                while user_requests and user_requests[0] < cutoff_time:
                    user_requests.popleft()
                
                stats[event_type] = {
                    'current_requests': len(user_requests),
                    'max_requests': rate_limit.max_requests,
                    'window_seconds': rate_limit.window_seconds,
                    'is_blocked': event_type in self.blocked_users[user_id],
                    'blocked_until': self.blocked_users[user_id].get(event_type, 0)
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der User-Stats für {user_id}: {e}")
            return {}
    
    def reset_user_limits(self, user_id: int, event_type: Optional[str] = None):
        """Rate-Limits für User zurücksetzen (Admin-Funktion)"""
        try:
            if event_type:
                # Spezifischen Event-Type zurücksetzen
                if user_id in self.user_requests:
                    self.user_requests[user_id][event_type].clear()
                if event_type in self.blocked_users[user_id]:
                    del self.blocked_users[user_id][event_type]
            else:
                # Alle Rate-Limits für User zurücksetzen
                if user_id in self.user_requests:
                    del self.user_requests[user_id]
                if user_id in self.blocked_users:
                    del self.blocked_users[user_id]
            
            logger.info(f"Rate-Limits für User {user_id} zurückgesetzt (Event: {event_type or 'alle'})")
            
        except Exception as e:
            logger.error(f"Fehler beim Zurücksetzen der Rate-Limits für User {user_id}: {e}")
    
    def get_global_stats(self) -> Dict[str, any]:
        """Globale Rate-Limit-Statistiken"""
        try:
            current_time = time.time()
            
            # Aktive User zählen
            active_users = len(self.user_requests)
            
            # Blocked User zählen
            blocked_users = 0
            for user_blocks in self.blocked_users.values():
                for block_until in user_blocks.values():
                    if current_time < block_until:
                        blocked_users += 1
                        break
            
            # Top Event-Types
            event_counts = defaultdict(int)
            for user_requests in self.user_requests.values():
                for event_type, requests in user_requests.items():
                    # Nur aktuelle Requests zählen
                    cutoff_time = current_time - self.rate_limits[event_type].window_seconds
                    active_requests = sum(1 for req_time in requests if req_time > cutoff_time)
                    event_counts[event_type] += active_requests
            
            return {
                'active_users': active_users,
                'blocked_users': blocked_users,
                'event_counts': dict(event_counts),
                'rate_limit_configs': {
                    event_type: {
                        'max_requests': rate_limit.max_requests,
                        'window_seconds': rate_limit.window_seconds
                    }
                    for event_type, rate_limit in self.rate_limits.items()
                },
                'last_cleanup': self.last_cleanup,
                'next_cleanup_in': self.cleanup_interval - (current_time - self.last_cleanup)
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der globalen Stats: {e}")
            return {}
    
    def _cleanup_old_data(self):
        """Alte Daten bereinigen"""
        try:
            current_time = time.time()
            
            # Cleanup nur alle 5 Minuten
            if current_time - self.last_cleanup < self.cleanup_interval:
                return
            
            # Alte User-Requests bereinigen
            max_age = max(rate_limit.window_seconds for rate_limit in self.rate_limits.values()) * 2
            
            for user_id in list(self.user_requests.keys()):
                for event_type in list(self.user_requests[user_id].keys()):
                    requests = self.user_requests[user_id][event_type]
                    cutoff_time = current_time - max_age
                    
                    # Alte Requests entfernen
                    while requests and requests[0] < cutoff_time:
                        requests.popleft()
                    
                    # Leere Listen entfernen
                    if not requests:
                        del self.user_requests[user_id][event_type]
                
                # Leere User-Einträge entfernen
                if not self.user_requests[user_id]:
                    del self.user_requests[user_id]
            
            # Alte Blocked-User bereinigen
            for user_id in list(self.blocked_users.keys()):
                for event_type in list(self.blocked_users[user_id].keys()):
                    if current_time >= self.blocked_users[user_id][event_type]:
                        del self.blocked_users[user_id][event_type]
                
                if not self.blocked_users[user_id]:
                    del self.blocked_users[user_id]
            
            self.last_cleanup = current_time
            logger.debug(f"Rate-Limiter Cleanup abgeschlossen. Aktive User: {len(self.user_requests)}")
            
        except Exception as e:
            logger.error(f"Fehler beim Cleanup der Rate-Limiter-Daten: {e}")
    
    def update_rate_limits(self, event_type: str, max_requests: int, window_seconds: int, message: str):
        """Rate-Limits zur Laufzeit aktualisieren (Admin-Funktion)"""
        try:
            self.rate_limits[event_type] = RateLimit(
                max_requests=max_requests,
                window_seconds=window_seconds,
                message=message
            )
            logger.info(f"Rate-Limit für {event_type} aktualisiert: {max_requests}/{window_seconds}s")
            
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren der Rate-Limits für {event_type}: {e}")

# Singleton-Instanz
websocket_rate_limiter = WebSocketRateLimiter()
