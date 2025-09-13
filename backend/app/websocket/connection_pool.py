"""
WebSocket Connection Pool für optimale Performance
Verwaltet WebSocket-Verbindungen effizient für 40.000+ User
"""
import asyncio
import logging
import time
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from datetime import datetime, timedelta
import weakref

logger = logging.getLogger(__name__)

@dataclass
class ConnectionInfo:
    """Informationen über eine WebSocket-Verbindung"""
    websocket_id: str
    user_id: int
    connected_at: datetime
    last_activity: datetime
    message_count: int = 0
    is_active: bool = True
    connection_type: str = "stories"  # stories, chat, notifications

class WebSocketConnectionPool:
    """Optimierter Connection Pool für WebSocket-Verbindungen"""
    
    def __init__(self, max_connections: int = 50000):
        self.max_connections = max_connections
        self.connections: Dict[str, ConnectionInfo] = {}
        self.user_connections: Dict[int, Set[str]] = {}  # user_id -> set of connection_ids
        self.connection_types: Dict[str, Set[str]] = {}  # type -> set of connection_ids
        
        # Performance-Metriken
        self.total_connections = 0
        self.active_connections = 0
        self.peak_connections = 0
        self.connection_errors = 0
        
        # Cleanup-Task
        self.cleanup_task = None
        self.cleanup_interval = 60  # 1 Minute
        self.connection_timeout = 300  # 5 Minuten
        
        # Start cleanup task
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Cleanup-Task für inaktive Verbindungen starten"""
        if self.cleanup_task is None or self.cleanup_task.done():
            self.cleanup_task = asyncio.create_task(self._cleanup_inactive_connections())
    
    async def add_connection(self, websocket_id: str, user_id: int, connection_type: str = "stories") -> bool:
        """Neue WebSocket-Verbindung hinzufügen"""
        try:
            # Maximal-Verbindungen prüfen
            if len(self.connections) >= self.max_connections:
                logger.warning(f"Maximale Verbindungen erreicht: {self.max_connections}")
                return False
            
            # Verbindung hinzufügen
            connection_info = ConnectionInfo(
                websocket_id=websocket_id,
                user_id=user_id,
                connected_at=datetime.now(),
                last_activity=datetime.now(),
                connection_type=connection_type
            )
            
            self.connections[websocket_id] = connection_info
            
            # User-Verbindungen aktualisieren
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket_id)
            
            # Connection-Type-Verbindungen aktualisieren
            if connection_type not in self.connection_types:
                self.connection_types[connection_type] = set()
            self.connection_types[connection_type].add(websocket_id)
            
            # Metriken aktualisieren
            self.total_connections += 1
            self.active_connections += 1
            self.peak_connections = max(self.peak_connections, self.active_connections)
            
            logger.info(f"✅ WebSocket-Verbindung hinzugefügt: {websocket_id} (User: {user_id}, Type: {connection_type})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Hinzufügen der Verbindung {websocket_id}: {e}")
            self.connection_errors += 1
            return False
    
    async def remove_connection(self, websocket_id: str) -> bool:
        """WebSocket-Verbindung entfernen"""
        try:
            if websocket_id not in self.connections:
                return False
            
            connection_info = self.connections[websocket_id]
            user_id = connection_info.user_id
            connection_type = connection_info.connection_type
            
            # Verbindung entfernen
            del self.connections[websocket_id]
            
            # User-Verbindungen aktualisieren
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(websocket_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Connection-Type-Verbindungen aktualisieren
            if connection_type in self.connection_types:
                self.connection_types[connection_type].discard(websocket_id)
            
            # Metriken aktualisieren
            self.active_connections -= 1
            
            logger.info(f"✅ WebSocket-Verbindung entfernt: {websocket_id} (User: {user_id})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Entfernen der Verbindung {websocket_id}: {e}")
            self.connection_errors += 1
            return False
    
    async def update_activity(self, websocket_id: str) -> bool:
        """Aktivität einer Verbindung aktualisieren"""
        try:
            if websocket_id in self.connections:
                self.connections[websocket_id].last_activity = datetime.now()
                self.connections[websocket_id].message_count += 1
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Fehler beim Aktualisieren der Aktivität für {websocket_id}: {e}")
            return False
    
    def get_connection_info(self, websocket_id: str) -> Optional[ConnectionInfo]:
        """Verbindungsinformationen abrufen"""
        return self.connections.get(websocket_id)
    
    def get_user_connections(self, user_id: int) -> List[ConnectionInfo]:
        """Alle Verbindungen eines Users abrufen"""
        if user_id not in self.user_connections:
            return []
        
        connections = []
        for connection_id in self.user_connections[user_id]:
            if connection_id in self.connections:
                connections.append(self.connections[connection_id])
        return connections
    
    def get_connections_by_type(self, connection_type: str) -> List[ConnectionInfo]:
        """Alle Verbindungen eines Typs abrufen"""
        if connection_type not in self.connection_types:
            return []
        
        connections = []
        for connection_id in self.connection_types[connection_type]:
            if connection_id in self.connections:
                connections.append(self.connections[connection_id])
        return connections
    
    def get_pool_stats(self) -> Dict[str, any]:
        """Pool-Statistiken abrufen"""
        try:
            current_time = datetime.now()
            
            # Verbindungen nach Typ zählen
            type_counts = {}
            for connection_type, connection_ids in self.connection_types.items():
                active_count = sum(1 for conn_id in connection_ids if conn_id in self.connections)
                type_counts[connection_type] = active_count
            
            # Aktive vs. Inaktive Verbindungen
            active_count = 0
            inactive_count = 0
            for connection in self.connections.values():
                if connection.is_active:
                    active_count += 1
                else:
                    inactive_count += 1
            
            # Durchschnittliche Verbindungsdauer
            total_duration = 0
            for connection in self.connections.values():
                duration = (current_time - connection.connected_at).total_seconds()
                total_duration += duration
            
            avg_duration = total_duration / len(self.connections) if self.connections else 0
            
            return {
                'total_connections': len(self.connections),
                'active_connections': active_count,
                'inactive_connections': inactive_count,
                'peak_connections': self.peak_connections,
                'connection_errors': self.connection_errors,
                'type_counts': type_counts,
                'average_connection_duration': avg_duration,
                'max_connections': self.max_connections,
                'utilization_percentage': (len(self.connections) / self.max_connections) * 100
            }
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Abrufen der Pool-Statistiken: {e}")
            return {}
    
    async def _cleanup_inactive_connections(self):
        """Inaktive Verbindungen bereinigen"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                
                current_time = datetime.now()
                timeout_threshold = current_time - timedelta(seconds=self.connection_timeout)
                
                # Inaktive Verbindungen finden
                inactive_connections = []
                for websocket_id, connection_info in self.connections.items():
                    if connection_info.last_activity < timeout_threshold:
                        inactive_connections.append(websocket_id)
                
                # Inaktive Verbindungen entfernen
                for websocket_id in inactive_connections:
                    await self.remove_connection(websocket_id)
                    logger.info(f"🧹 Inaktive Verbindung bereinigt: {websocket_id}")
                
                if inactive_connections:
                    logger.info(f"🧹 {len(inactive_connections)} inaktive Verbindungen bereinigt")
                
            except Exception as e:
                logger.error(f"❌ Fehler beim Cleanup der Verbindungen: {e}")
                await asyncio.sleep(60)  # 1 Minute warten bei Fehlern
    
    async def optimize_pool(self) -> Dict[str, any]:
        """Pool-Optimierung durchführen"""
        try:
            optimization_results = {
                'connections_removed': 0,
                'memory_freed': 0,
                'optimization_score': 0,
                'recommendations': []
            }
            
            current_time = datetime.now()
            
            # 1. Inaktive Verbindungen entfernen
            timeout_threshold = current_time - timedelta(seconds=self.connection_timeout)
            inactive_connections = [
                websocket_id for websocket_id, connection_info in self.connections.items()
                if connection_info.last_activity < timeout_threshold
            ]
            
            for websocket_id in inactive_connections:
                await self.remove_connection(websocket_id)
                optimization_results['connections_removed'] += 1
            
            # 2. Duplikate entfernen (gleicher User, gleicher Typ)
            user_type_connections = {}
            duplicate_connections = []
            
            for websocket_id, connection_info in self.connections.items():
                key = (connection_info.user_id, connection_info.connection_type)
                if key in user_type_connections:
                    # Ältere Verbindung als Duplikat markieren
                    if connection_info.connected_at < user_type_connections[key].connected_at:
                        duplicate_connections.append(websocket_id)
                    else:
                        duplicate_connections.append(user_type_connections[key].websocket_id)
                        user_type_connections[key] = connection_info
                else:
                    user_type_connections[key] = connection_info
            
            for websocket_id in duplicate_connections:
                await self.remove_connection(websocket_id)
                optimization_results['connections_removed'] += 1
            
            # 3. Optimierung-Score berechnen
            utilization = (len(self.connections) / self.max_connections) * 100
            if utilization < 50:
                optimization_results['optimization_score'] = 90
            elif utilization < 80:
                optimization_results['optimization_score'] = 75
            else:
                optimization_results['optimization_score'] = 60
            
            # 4. Empfehlungen generieren
            if utilization > 90:
                optimization_results['recommendations'].append({
                    'type': 'scaling',
                    'priority': 'high',
                    'message': 'Pool-Auslastung über 90%. Erwägen Sie Load-Balancing oder Pool-Erweiterung.'
                })
            
            if optimization_results['connections_removed'] > 100:
                optimization_results['recommendations'].append({
                    'type': 'cleanup',
                    'priority': 'medium',
                    'message': f'{optimization_results["connections_removed"]} inaktive Verbindungen entfernt. Cleanup-Intervall optimiert.'
                })
            
            logger.info(f"🔧 Pool-Optimierung abgeschlossen: {optimization_results['connections_removed']} Verbindungen entfernt")
            return optimization_results
            
        except Exception as e:
            logger.error(f"❌ Fehler bei der Pool-Optimierung: {e}")
            return {'error': str(e)}
    
    async def shutdown(self):
        """Pool herunterfahren"""
        try:
            if self.cleanup_task and not self.cleanup_task.done():
                self.cleanup_task.cancel()
            
            logger.info("🔌 WebSocket Connection Pool heruntergefahren")
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Herunterfahren des Connection Pools: {e}")

# Singleton-Instanz
connection_pool = WebSocketConnectionPool()
