"""
Monitoring & Alerting Routes
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta

from app.dependencies import get_session, get_current_user
from models import User
from app.monitoring.metrics_collector import metrics_collector
from app.monitoring.alerting_service import alerting_service

logger = logging.getLogger(__name__)

# Router für Monitoring-Endpoints
router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

async def verify_admin_user(current_user: User) -> User:
    """Admin-Berechtigung prüfen"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Admin-Berechtigung erforderlich")
    return current_user

@router.get("/metrics/current")
async def get_current_metrics():
    """Aktuelle System-Metriken abrufen (öffentlich verfügbar)"""
    try:
        # System-Metriken sammeln
        system_metrics = metrics_collector.collect_system_metrics()
        
        # Anwendungs-Metriken sammeln (vereinfacht)
        application_metrics = metrics_collector.collect_application_metrics()
        
        # Business-Metriken sammeln (vereinfacht)
        business_metrics = metrics_collector.collect_business_metrics()
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "system": system_metrics.__dict__,
                "application": application_metrics.__dict__,
                "business": business_metrics.__dict__
            }
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der aktuellen Metriken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Metriken")

@router.get("/metrics/summary")
async def get_metrics_summary():
    """Metriken-Zusammenfassung abrufen (öffentlich verfügbar)"""
    try:
        summary = metrics_collector.get_metrics_summary()
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Metriken-Zusammenfassung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Zusammenfassung")

@router.get("/metrics/historical")
async def get_historical_metrics(
    hours: int = 1,
    current_user: User = Depends(verify_admin_user)
):
    """Historische Metriken abrufen (Admin-only)"""
    try:
        if hours > 24:
            raise HTTPException(status_code=400, detail="Maximal 24 Stunden erlaubt")
        
        historical_data = metrics_collector.get_historical_metrics(hours)
        
        return {
            "success": True,
            "hours": hours,
            "data": historical_data
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der historischen Metriken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der historischen Metriken")

@router.get("/alerts/active")
async def get_active_alerts():
    """Aktive Alerts abrufen (öffentlich verfügbar)"""
    try:
        active_alerts = metrics_collector.get_active_alerts()
        
        return {
            "success": True,
            "alerts": active_alerts,
            "count": len(active_alerts)
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der aktiven Alerts: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Alerts")

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(verify_admin_user)
):
    """Alert auflösen (Admin-only)"""
    try:
        success = metrics_collector.resolve_alert(alert_id)
        
        if success:
            return {
                "success": True,
                "message": f"Alert {alert_id} erfolgreich aufgelöst"
            }
        else:
            raise HTTPException(status_code=404, detail="Alert nicht gefunden oder bereits aufgelöst")
        
    except Exception as e:
        logger.error(f"Fehler beim Auflösen des Alerts {alert_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Auflösen des Alerts")

@router.get("/alerts/rules")
async def get_alert_rules(
    current_user: User = Depends(verify_admin_user)
):
    """Alert-Regeln abrufen (Admin-only)"""
    try:
        rules = alerting_service.get_alert_rules()
        
        return {
            "success": True,
            "rules": rules,
            "count": len(rules)
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Alert-Regeln: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Alert-Regeln")

@router.post("/alerts/rules")
async def create_alert_rule(
    rule_data: Dict[str, Any],
    current_user: User = Depends(verify_admin_user)
):
    """Neue Alert-Regel erstellen (Admin-only)"""
    try:
        from app.monitoring.alerting_service import AlertRule
        
        # Validiere erforderliche Felder
        required_fields = ["id", "name", "description", "metric", "operator", "threshold", "severity"]
        for field in required_fields:
            if field not in rule_data:
                raise HTTPException(status_code=400, detail=f"Feld '{field}' ist erforderlich")
        
        # Erstelle neue Alert-Regel
        new_rule = AlertRule(
            id=rule_data["id"],
            name=rule_data["name"],
            description=rule_data["description"],
            metric=rule_data["metric"],
            operator=rule_data["operator"],
            threshold=rule_data["threshold"],
            severity=rule_data["severity"],
            enabled=rule_data.get("enabled", True),
            cooldown_minutes=rule_data.get("cooldown_minutes", 15)
        )
        
        alerting_service.add_alert_rule(new_rule)
        
        return {
            "success": True,
            "message": f"Alert-Regel '{new_rule.name}' erfolgreich erstellt",
            "rule": new_rule.__dict__
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Alert-Regel: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen der Alert-Regel")

@router.put("/alerts/rules/{rule_id}")
async def update_alert_rule(
    rule_id: str,
    updates: Dict[str, Any],
    current_user: User = Depends(verify_admin_user)
):
    """Alert-Regel aktualisieren (Admin-only)"""
    try:
        success = alerting_service.update_alert_rule(rule_id, updates)
        
        if success:
            return {
                "success": True,
                "message": f"Alert-Regel {rule_id} erfolgreich aktualisiert"
            }
        else:
            raise HTTPException(status_code=404, detail="Alert-Regel nicht gefunden")
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Alert-Regel {rule_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren der Alert-Regel")

@router.delete("/alerts/rules/{rule_id}")
async def delete_alert_rule(
    rule_id: str,
    current_user: User = Depends(verify_admin_user)
):
    """Alert-Regel löschen (Admin-only)"""
    try:
        alerting_service.delete_alert_rule(rule_id)
        
        return {
            "success": True,
            "message": f"Alert-Regel {rule_id} erfolgreich gelöscht"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Löschen der Alert-Regel {rule_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen der Alert-Regel")

@router.get("/notifications/channels")
async def get_notification_channels(
    current_user: User = Depends(verify_admin_user)
):
    """Benachrichtigungskanäle abrufen (Admin-only)"""
    try:
        channels = alerting_service.get_notification_channels()
        
        return {
            "success": True,
            "channels": channels,
            "count": len(channels)
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Benachrichtigungskanäle: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Benachrichtigungskanäle")

@router.post("/test/notification")
async def test_notification(
    channel_id: str,
    current_user: User = Depends(verify_admin_user)
):
    """Test-Benachrichtigung senden (Admin-only)"""
    try:
        # Erstelle Test-Alert
        test_alert = {
            "rule_id": "test_alert",
            "rule_name": "Test Alert",
            "description": "Dies ist eine Test-Benachrichtigung",
            "severity": "medium",
            "metric": "test_metric",
            "value": 100.0,
            "threshold": 50.0,
            "operator": "gt",
            "timestamp": datetime.utcnow().isoformat(),
            "status": "triggered"
        }
        
        # Sende Test-Benachrichtigung
        await alerting_service.send_notifications([test_alert])
        
        return {
            "success": True,
            "message": f"Test-Benachrichtigung über Kanal {channel_id} gesendet"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Senden der Test-Benachrichtigung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Senden der Test-Benachrichtigung")

@router.post("/collect")
async def manual_metrics_collection(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_admin_user)
):
    """Manuelle Metriken-Sammlung starten (Admin-only)"""
    try:
        def collect_and_check():
            # Metriken sammeln
            system_metrics = metrics_collector.collect_system_metrics()
            application_metrics = metrics_collector.collect_application_metrics()
            business_metrics = metrics_collector.collect_business_metrics()
            
            # Alerts prüfen
            metrics_summary = metrics_collector.get_metrics_summary()
            triggered_alerts = alerting_service.evaluate_metrics(metrics_summary)
            
            # Benachrichtigungen senden (falls Alerts ausgelöst wurden)
            if triggered_alerts:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(alerting_service.send_notifications(triggered_alerts))
                loop.close()
        
        # Starte Sammlung im Hintergrund
        background_tasks.add_task(collect_and_check)
        
        return {
            "success": True,
            "message": "Manuelle Metriken-Sammlung gestartet"
        }
        
    except Exception as e:
        logger.error(f"Fehler bei manueller Metriken-Sammlung: {e}")
        raise HTTPException(status_code=500, detail="Fehler bei manueller Metriken-Sammlung")

@router.get("/health")
async def monitoring_health_check():
    """Monitoring-System Health Check (öffentlich verfügbar)"""
    try:
        # Sammle aktuelle Metriken
        system_metrics = metrics_collector.collect_system_metrics()
        
        # Bewerte System-Gesundheit
        health_status = "healthy"
        issues = []
        
        # CPU-Check
        if system_metrics.cpu_percent > 90:
            health_status = "critical"
            issues.append(f"CPU-Auslastung kritisch: {system_metrics.cpu_percent:.1f}%")
        elif system_metrics.cpu_percent > 80:
            health_status = "warning"
            issues.append(f"CPU-Auslastung hoch: {system_metrics.cpu_percent:.1f}%")
        
        # Memory-Check
        if system_metrics.memory_percent > 95:
            health_status = "critical"
            issues.append(f"Speicher-Auslastung kritisch: {system_metrics.memory_percent:.1f}%")
        elif system_metrics.memory_percent > 85:
            health_status = "warning"
            issues.append(f"Speicher-Auslastung hoch: {system_metrics.memory_percent:.1f}%")
        
        # Disk-Check
        if system_metrics.disk_usage_percent > 95:
            health_status = "critical"
            issues.append(f"Festplatten-Speicher kritisch: {system_metrics.disk_usage_percent:.1f}%")
        elif system_metrics.disk_usage_percent > 90:
            health_status = "warning"
            issues.append(f"Festplatten-Speicher hoch: {system_metrics.disk_usage_percent:.1f}%")
        
        return {
            "success": True,
            "health": {
                "status": health_status,
                "issues": issues,
                "system_metrics": system_metrics.__dict__,
                "monitoring_uptime_hours": (datetime.utcnow().timestamp() - metrics_collector.start_time) / 3600
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Monitoring Health Check: {e}")
        return {
            "success": False,
            "health": {
                "status": "error",
                "error": str(e)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/dashboard")
async def get_monitoring_dashboard(
    current_user: User = Depends(verify_admin_user)
):
    """Monitoring-Dashboard-Daten abrufen (Admin-only)"""
    try:
        # Sammle alle Dashboard-Daten
        metrics_summary = metrics_collector.get_metrics_summary()
        active_alerts = metrics_collector.get_active_alerts()
        alert_rules = alerting_service.get_alert_rules()
        notification_channels = alerting_service.get_notification_channels()
        
        # Dashboard-Statistiken
        dashboard_stats = {
            "system_status": "healthy" if len(active_alerts) == 0 else "warning",
            "active_alerts_count": len(active_alerts),
            "critical_alerts_count": len([a for a in active_alerts if a.get("severity") == "critical"]),
            "enabled_alert_rules": len([r for r in alert_rules if r.get("enabled")]),
            "active_notification_channels": len([c for c in notification_channels if c.get("enabled")]),
            "uptime_hours": metrics_summary.get("collection_stats", {}).get("uptime_hours", 0)
        }
        
        return {
            "success": True,
            "dashboard": {
                "stats": dashboard_stats,
                "metrics": metrics_summary,
                "alerts": active_alerts,
                "rules": alert_rules,
                "channels": notification_channels
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Dashboard-Daten: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Dashboard-Daten")
