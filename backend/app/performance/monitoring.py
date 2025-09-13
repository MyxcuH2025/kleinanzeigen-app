"""
Performance Monitoring für Kleinanzeigen API
Überwacht Datenbank-Performance, Response-Zeiten und System-Ressourcen
"""
import time
import psutil
import logging
from typing import Dict, Any, Optional
from contextlib import contextmanager
from sqlalchemy import text
from sqlmodel import Session

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """Überwacht Performance-Metriken der Anwendung"""
    
    def __init__(self):
        self.metrics: Dict[str, Any] = {
            'request_count': 0,
            'total_response_time': 0,
            'avg_response_time': 0,
            'db_query_count': 0,
            'db_query_time': 0,
            'memory_usage': 0,
            'cpu_usage': 0,
            'active_connections': 0
        }
    
    @contextmanager
    def measure_request_time(self, endpoint: str):
        """Misst die Response-Zeit für einen Endpoint"""
        start_time = time.time()
        try:
            yield
        finally:
            end_time = time.time()
            response_time = end_time - start_time
            
            self.metrics['request_count'] += 1
            self.metrics['total_response_time'] += response_time
            self.metrics['avg_response_time'] = (
                self.metrics['total_response_time'] / self.metrics['request_count']
            )
            
            logger.info(f"Endpoint {endpoint} took {response_time:.3f}s")
    
    @contextmanager
    def measure_db_query(self, query_name: str):
        """Misst die Ausführungszeit einer Datenbankabfrage"""
        start_time = time.time()
        try:
            yield
        finally:
            end_time = time.time()
            query_time = end_time - start_time
            
            self.metrics['db_query_count'] += 1
            self.metrics['db_query_time'] += query_time
            
            if query_time > 1.0:  # Log langsame Queries
                logger.warning(f"Slow query {query_name}: {query_time:.3f}s")
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Sammelt aktuelle System-Metriken"""
        try:
            # Memory usage
            memory = psutil.virtual_memory()
            self.metrics['memory_usage'] = memory.percent
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            self.metrics['cpu_usage'] = cpu_percent
            
            return {
                'memory_usage_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'cpu_usage_percent': cpu_percent,
                'cpu_count': psutil.cpu_count(),
                'disk_usage_percent': psutil.disk_usage('/').percent
            }
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return {}
    
    def get_db_metrics(self, session: Session) -> Dict[str, Any]:
        """Sammelt Datenbank-Performance-Metriken"""
        try:
            # SQLite-spezifische Metriken
            result = session.exec(text("PRAGMA compile_options")).fetchall()
            
            # Connection Pool Metriken (falls verfügbar)
            pool_metrics = {}
            if hasattr(session.bind, 'pool'):
                pool = session.bind.pool
                pool_metrics = {
                    'pool_size': pool.size(),
                    'checked_in': pool.checkedin(),
                    'checked_out': pool.checkedout(),
                    'overflow': pool.overflow(),
                    'invalid': pool.invalid()
                }
            
            return {
                'sqlite_version': result[0][0] if result else 'unknown',
                'pool_metrics': pool_metrics,
                'total_queries': self.metrics['db_query_count'],
                'avg_query_time': (
                    self.metrics['db_query_time'] / self.metrics['db_query_count']
                    if self.metrics['db_query_count'] > 0 else 0
                )
            }
        except Exception as e:
            logger.error(f"Error collecting DB metrics: {e}")
            return {}
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Gibt eine Zusammenfassung aller Performance-Metriken zurück"""
        system_metrics = self.get_system_metrics()
        
        return {
            'api_metrics': {
                'total_requests': self.metrics['request_count'],
                'avg_response_time_ms': round(self.metrics['avg_response_time'] * 1000, 2),
                'total_db_queries': self.metrics['db_query_count'],
                'avg_db_query_time_ms': round(
                    (self.metrics['db_query_time'] / self.metrics['db_query_count'] * 1000)
                    if self.metrics['db_query_count'] > 0 else 0, 2
                )
            },
            'system_metrics': system_metrics,
            'recommendations': self._get_recommendations()
        }
    
    def _get_recommendations(self) -> list:
        """Gibt Performance-Empfehlungen basierend auf den Metriken zurück"""
        recommendations = []
        
        # Response Time Empfehlungen
        if self.metrics['avg_response_time'] > 2.0:
            recommendations.append({
                'type': 'warning',
                'message': 'Hohe Response-Zeit erkannt. Prüfen Sie Datenbank-Indizes und Query-Optimierung.'
            })
        
        # Memory Empfehlungen
        if self.metrics['memory_usage'] > 80:
            recommendations.append({
                'type': 'critical',
                'message': 'Hoher Speicherverbrauch. Prüfen Sie Memory Leaks und optimieren Sie große Queries.'
            })
        
        # CPU Empfehlungen
        if self.metrics['cpu_usage'] > 90:
            recommendations.append({
                'type': 'warning',
                'message': 'Hohe CPU-Auslastung. Prüfen Sie CPU-intensive Operationen.'
            })
        
        # DB Query Empfehlungen
        avg_query_time = (
            self.metrics['db_query_time'] / self.metrics['db_query_count']
            if self.metrics['db_query_count'] > 0 else 0
        )
        if avg_query_time > 0.5:
            recommendations.append({
                'type': 'info',
                'message': 'Durchschnittliche Query-Zeit ist hoch. Prüfen Sie Indizes und Query-Struktur.'
            })
        
        return recommendations

# Globale Instanz
performance_monitor = PerformanceMonitor()
