"""
Metrics Collector für System-Überwachung
"""
import time
import psutil
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading
import json

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System-Metriken"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_usage_percent: float
    disk_free_gb: float
    load_average: List[float]
    network_io: Dict[str, int]
    process_count: int
    uptime_seconds: float

@dataclass
class ApplicationMetrics:
    """Anwendungs-Metriken"""
    timestamp: str
    active_connections: int
    total_requests: int
    requests_per_minute: float
    average_response_time_ms: float
    error_rate_percent: float
    cache_hit_rate_percent: float
    database_connections: int
    redis_connections: int
    elasticsearch_status: str

@dataclass
class BusinessMetrics:
    """Business-Metriken"""
    timestamp: str
    active_users: int
    total_listings: int
    new_listings_today: int
    total_conversations: int
    active_conversations: int
    stories_created_today: int
    search_queries_per_minute: float
    revenue_today: float

@dataclass
class Alert:
    """Alert-Definition"""
    id: str
    type: str  # "system", "application", "business"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    timestamp: str
    resolved: bool = False
    resolved_at: Optional[str] = None

class MetricsCollector:
    """
    Zentrale Metriken-Sammlung für System-Überwachung
    """
    
    def __init__(self, retention_hours: int = 24):
        self.retention_hours = retention_hours
        self.start_time = time.time()
        
        # Metriken-Storage
        self.system_metrics: deque = deque(maxlen=retention_hours * 60)  # 1-Minute-Intervalle
        self.application_metrics: deque = deque(maxlen=retention_hours * 60)
        self.business_metrics: deque = deque(maxlen=retention_hours * 60)
        
        # Request-Tracking
        self.request_times: deque = deque(maxlen=1000)
        self.request_counts: defaultdict = defaultdict(int)
        self.error_counts: defaultdict = defaultdict(int)
        
        # Thread-Safety
        self._lock = threading.Lock()
        
        # Alerting
        self.alerts: List[Alert] = []
        self.alert_thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_usage_percent": 90.0,
            "error_rate_percent": 5.0,
            "response_time_ms": 2000.0,
            "cache_hit_rate_percent": 50.0
        }
        
        logger.info("MetricsCollector initialisiert")
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Sammle System-Metriken"""
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_available_mb = memory.available / (1024 * 1024)
            
            # Disk
            disk = psutil.disk_usage('/')
            disk_usage_percent = (disk.used / disk.total) * 100
            disk_free_gb = disk.free / (1024 * 1024 * 1024)
            
            # Load Average (Unix/Linux only)
            try:
                load_average = list(psutil.getloadavg())
            except AttributeError:
                load_average = [0.0, 0.0, 0.0]  # Windows fallback
            
            # Network I/O
            network = psutil.net_io_counters()
            network_io = {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv
            }
            
            # Process count
            process_count = len(psutil.pids())
            
            # Uptime
            uptime_seconds = time.time() - self.start_time
            
            metrics = SystemMetrics(
                timestamp=datetime.utcnow().isoformat(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_mb=memory_used_mb,
                memory_available_mb=memory_available_mb,
                disk_usage_percent=disk_usage_percent,
                disk_free_gb=disk_free_gb,
                load_average=load_average,
                network_io=network_io,
                process_count=process_count,
                uptime_seconds=uptime_seconds
            )
            
            with self._lock:
                self.system_metrics.append(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Fehler beim Sammeln der System-Metriken: {e}")
            raise
    
    def collect_application_metrics(self, 
                                  active_connections: int = 0,
                                  database_connections: int = 0,
                                  redis_connections: int = 0,
                                  elasticsearch_status: str = "unknown") -> ApplicationMetrics:
        """Sammle Anwendungs-Metriken"""
        try:
            # Request-Metriken berechnen
            current_time = time.time()
            minute_ago = current_time - 60
            
            # Requests in der letzten Minute
            recent_requests = sum(1 for req_time in self.request_times if req_time > minute_ago)
            requests_per_minute = recent_requests
            
            # Durchschnittliche Response-Zeit
            if self.request_times:
                recent_response_times = [req_time for req_time in self.request_times if req_time > minute_ago]
                if recent_response_times:
                    average_response_time_ms = sum(recent_response_times) / len(recent_response_times) * 1000
                else:
                    average_response_time_ms = 0.0
            else:
                average_response_time_ms = 0.0
            
            # Error Rate berechnen
            total_requests = sum(self.request_counts.values())
            total_errors = sum(self.error_counts.values())
            error_rate_percent = (total_errors / total_requests * 100) if total_requests > 0 else 0.0
            
            # Cache Hit Rate (wird von Cache-Service bereitgestellt)
            cache_hit_rate_percent = 75.0  # Placeholder - sollte von Redis-Service kommen
            
            metrics = ApplicationMetrics(
                timestamp=datetime.utcnow().isoformat(),
                active_connections=active_connections,
                total_requests=total_requests,
                requests_per_minute=requests_per_minute,
                average_response_time_ms=average_response_time_ms,
                error_rate_percent=error_rate_percent,
                cache_hit_rate_percent=cache_hit_rate_percent,
                database_connections=database_connections,
                redis_connections=redis_connections,
                elasticsearch_status=elasticsearch_status
            )
            
            with self._lock:
                self.application_metrics.append(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Fehler beim Sammeln der Anwendungs-Metriken: {e}")
            raise
    
    def collect_business_metrics(self,
                               active_users: int = 0,
                               total_listings: int = 0,
                               new_listings_today: int = 0,
                               total_conversations: int = 0,
                               active_conversations: int = 0,
                               stories_created_today: int = 0,
                               search_queries_per_minute: float = 0.0,
                               revenue_today: float = 0.0) -> BusinessMetrics:
        """Sammle Business-Metriken"""
        try:
            metrics = BusinessMetrics(
                timestamp=datetime.utcnow().isoformat(),
                active_users=active_users,
                total_listings=total_listings,
                new_listings_today=new_listings_today,
                total_conversations=total_conversations,
                active_conversations=active_conversations,
                stories_created_today=stories_created_today,
                search_queries_per_minute=search_queries_per_minute,
                revenue_today=revenue_today
            )
            
            with self._lock:
                self.business_metrics.append(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Fehler beim Sammeln der Business-Metriken: {e}")
            raise
    
    def track_request(self, response_time: float, status_code: int):
        """Tracke eine HTTP-Request"""
        with self._lock:
            self.request_times.append(time.time())
            self.request_counts[status_code] += 1
            
            if status_code >= 400:
                self.error_counts[status_code] += 1
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Erhalte Metriken-Zusammenfassung"""
        with self._lock:
            current_time = datetime.utcnow()
            
            # Neueste Metriken
            latest_system = self.system_metrics[-1] if self.system_metrics else None
            latest_application = self.application_metrics[-1] if self.application_metrics else None
            latest_business = self.business_metrics[-1] if self.business_metrics else None
            
            # Trends berechnen (letzte Stunde vs. vorherige Stunde)
            hour_ago = current_time - timedelta(hours=1)
            two_hours_ago = current_time - timedelta(hours=2)
            
            return {
                "timestamp": current_time.isoformat(),
                "system": asdict(latest_system) if latest_system else None,
                "application": asdict(latest_application) if latest_application else None,
                "business": asdict(latest_business) if latest_business else None,
                "alerts": {
                    "total": len(self.alerts),
                    "unresolved": len([a for a in self.alerts if not a.resolved]),
                    "critical": len([a for a in self.alerts if a.severity == "critical" and not a.resolved])
                },
                "collection_stats": {
                    "system_metrics_count": len(self.system_metrics),
                    "application_metrics_count": len(self.application_metrics),
                    "business_metrics_count": len(self.business_metrics),
                    "uptime_hours": (time.time() - self.start_time) / 3600
                }
            }
    
    def get_historical_metrics(self, hours: int = 1) -> Dict[str, List[Dict]]:
        """Erhalte historische Metriken"""
        with self._lock:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Filtere Metriken basierend auf Zeitstempel
            system_historical = [
                asdict(m) for m in self.system_metrics 
                if datetime.fromisoformat(m.timestamp) > cutoff_time
            ]
            
            application_historical = [
                asdict(m) for m in self.application_metrics 
                if datetime.fromisoformat(m.timestamp) > cutoff_time
            ]
            
            business_historical = [
                asdict(m) for m in self.business_metrics 
                if datetime.fromisoformat(m.timestamp) > cutoff_time
            ]
            
            return {
                "system": system_historical,
                "application": application_historical,
                "business": business_historical
            }
    
    def check_alerts(self) -> List[Alert]:
        """Prüfe auf neue Alerts basierend auf aktuellen Metriken"""
        new_alerts = []
        
        try:
            # System-Alerts
            if self.system_metrics:
                latest_system = self.system_metrics[-1]
                
                # CPU-Alert
                if latest_system.cpu_percent > self.alert_thresholds["cpu_percent"]:
                    new_alerts.append(Alert(
                        id=f"cpu_high_{int(time.time())}",
                        type="system",
                        severity="high",
                        message=f"CPU-Auslastung zu hoch: {latest_system.cpu_percent:.1f}%",
                        timestamp=datetime.utcnow().isoformat()
                    ))
                
                # Memory-Alert
                if latest_system.memory_percent > self.alert_thresholds["memory_percent"]:
                    new_alerts.append(Alert(
                        id=f"memory_high_{int(time.time())}",
                        type="system",
                        severity="high",
                        message=f"Speicher-Auslastung zu hoch: {latest_system.memory_percent:.1f}%",
                        timestamp=datetime.utcnow().isoformat()
                    ))
                
                # Disk-Alert
                if latest_system.disk_usage_percent > self.alert_thresholds["disk_usage_percent"]:
                    new_alerts.append(Alert(
                        id=f"disk_high_{int(time.time())}",
                        type="system",
                        severity="critical",
                        message=f"Festplatten-Speicher zu hoch: {latest_system.disk_usage_percent:.1f}%",
                        timestamp=datetime.utcnow().isoformat()
                    ))
            
            # Application-Alerts
            if self.application_metrics:
                latest_app = self.application_metrics[-1]
                
                # Error Rate Alert
                if latest_app.error_rate_percent > self.alert_thresholds["error_rate_percent"]:
                    new_alerts.append(Alert(
                        id=f"error_rate_high_{int(time.time())}",
                        type="application",
                        severity="high",
                        message=f"Fehlerrate zu hoch: {latest_app.error_rate_percent:.1f}%",
                        timestamp=datetime.utcnow().isoformat()
                    ))
                
                # Response Time Alert
                if latest_app.average_response_time_ms > self.alert_thresholds["response_time_ms"]:
                    new_alerts.append(Alert(
                        id=f"response_time_high_{int(time.time())}",
                        type="application",
                        severity="medium",
                        message=f"Response-Zeit zu hoch: {latest_app.average_response_time_ms:.1f}ms",
                        timestamp=datetime.utcnow().isoformat()
                    ))
                
                # Cache Hit Rate Alert
                if latest_app.cache_hit_rate_percent < self.alert_thresholds["cache_hit_rate_percent"]:
                    new_alerts.append(Alert(
                        id=f"cache_hit_rate_low_{int(time.time())}",
                        type="application",
                        severity="medium",
                        message=f"Cache-Hit-Rate zu niedrig: {latest_app.cache_hit_rate_percent:.1f}%",
                        timestamp=datetime.utcnow().isoformat()
                    ))
            
            # Füge neue Alerts hinzu
            for alert in new_alerts:
                # Prüfe ob Alert bereits existiert (verhindert Spam)
                existing_alert = next((a for a in self.alerts if a.id == alert.id), None)
                if not existing_alert:
                    self.alerts.append(alert)
                    logger.warning(f"Neuer Alert: {alert.severity.upper()} - {alert.message}")
            
            return new_alerts
            
        except Exception as e:
            logger.error(f"Fehler beim Alert-Check: {e}")
            return []
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Löse einen Alert auf"""
        with self._lock:
            for alert in self.alerts:
                if alert.id == alert_id and not alert.resolved:
                    alert.resolved = True
                    alert.resolved_at = datetime.utcnow().isoformat()
                    logger.info(f"Alert {alert_id} aufgelöst")
                    return True
        return False
    
    def get_active_alerts(self) -> List[Dict]:
        """Erhalte aktive (nicht aufgelöste) Alerts"""
        with self._lock:
            return [asdict(alert) for alert in self.alerts if not alert.resolved]
    
    def cleanup_old_data(self):
        """Bereinige alte Metriken-Daten"""
        with self._lock:
            cutoff_time = datetime.utcnow() - timedelta(hours=self.retention_hours)
            
            # Bereinige aufgelöste Alerts älter als 7 Tage
            self.alerts = [
                alert for alert in self.alerts 
                if not alert.resolved or 
                (alert.resolved_at and datetime.fromisoformat(alert.resolved_at) > cutoff_time)
            ]
            
            logger.info(f"Bereinigung abgeschlossen: {len(self.alerts)} Alerts verbleiben")

# Globale MetricsCollector-Instanz
metrics_collector = MetricsCollector()
