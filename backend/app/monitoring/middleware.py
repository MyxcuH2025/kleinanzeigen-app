"""
Monitoring Middleware für automatische Metriken-Sammlung
"""
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.monitoring.metrics_collector import metrics_collector

logger = logging.getLogger(__name__)

class MonitoringMiddleware(BaseHTTPMiddleware):
    """
    Middleware für automatische Request-Tracking und Metriken-Sammlung
    """
    
    def __init__(self, app, collect_interval_minutes: int = 1):
        super().__init__(app)
        self.collect_interval_minutes = collect_interval_minutes
        self.last_collection_time = 0
        self.request_count = 0
        self.start_time = time.time()
        
        logger.info("MonitoringMiddleware initialisiert")
    
    async def dispatch(self, request: Request, call_next):
        """Verarbeite Request und sammle Metriken"""
        start_time = time.time()
        
        # Request verarbeiten
        try:
            response = await call_next(request)
        except Exception as e:
            # Fehler-Tracking
            response_time = time.time() - start_time
            metrics_collector.track_request(response_time, 500)
            logger.error(f"Request-Fehler: {e}")
            raise
        
        # Response-Zeit berechnen
        response_time = time.time() - start_time
        
        # Request-Metriken tracken
        metrics_collector.track_request(response_time, response.status_code)
        
        # Periodische Metriken-Sammlung
        await self._periodic_collection()
        
        # Response-Header für Monitoring hinzufügen
        response.headers["X-Response-Time"] = f"{response_time:.3f}s"
        response.headers["X-Request-ID"] = str(int(start_time * 1000))
        
        return response
    
    async def _periodic_collection(self):
        """Periodische Metriken-Sammlung"""
        current_time = time.time()
        
        # Prüfe ob es Zeit für die nächste Sammlung ist
        if current_time - self.last_collection_time >= (self.collect_interval_minutes * 60):
            try:
                # System-Metriken sammeln
                system_metrics = metrics_collector.collect_system_metrics()
                
                # Anwendungs-Metriken sammeln (vereinfacht)
                application_metrics = metrics_collector.collect_application_metrics(
                    active_connections=self.request_count,
                    database_connections=5,  # Placeholder
                    redis_connections=3,     # Placeholder
                    elasticsearch_status="available"  # Placeholder
                )
                
                # Business-Metriken sammeln (vereinfacht)
                business_metrics = metrics_collector.collect_business_metrics(
                    active_users=100,        # Placeholder
                    total_listings=1000,     # Placeholder
                    new_listings_today=50,   # Placeholder
                    total_conversations=500, # Placeholder
                    active_conversations=25, # Placeholder
                    stories_created_today=10,# Placeholder
                    search_queries_per_minute=30.0,  # Placeholder
                    revenue_today=0.0        # Placeholder
                )
                
                # Alert-Check durchführen
                from app.monitoring.alerting_service import alerting_service
                metrics_summary = metrics_collector.get_metrics_summary()
                triggered_alerts = alerting_service.evaluate_metrics(metrics_summary)
                
                # Benachrichtigungen senden (falls Alerts ausgelöst wurden)
                if triggered_alerts:
                    await alerting_service.send_notifications(triggered_alerts)
                
                self.last_collection_time = current_time
                
                logger.debug(f"Metriken-Sammlung abgeschlossen: {len(triggered_alerts)} Alerts ausgelöst")
                
            except Exception as e:
                logger.error(f"Fehler bei periodischer Metriken-Sammlung: {e}")
    
    def get_stats(self):
        """Erhalte Middleware-Statistiken"""
        uptime = time.time() - self.start_time
        return {
            "uptime_seconds": uptime,
            "uptime_hours": uptime / 3600,
            "requests_processed": self.request_count,
            "last_collection_time": self.last_collection_time,
            "collection_interval_minutes": self.collect_interval_minutes
        }
