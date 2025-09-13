"""
Analytics Routes für Stories Performance Monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Dict, Any
import logging

from app.dependencies import get_session, get_current_user
from models.user import User
from app.stories.analytics import StoriesAnalytics

router = APIRouter(prefix="/api/stories/analytics", tags=["stories-analytics"])
logger = logging.getLogger(__name__)

@router.get("/performance")
async def get_stories_performance_metrics(
    days: int = Query(7, ge=1, le=30, description="Anzahl Tage für Analytics"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Performance-Metriken für Stories abrufen"""
    try:
        analytics = StoriesAnalytics(session)
        metrics = await analytics.get_stories_performance_metrics(days=days)
        
        return {
            "success": True,
            "metrics": metrics,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Performance-Metriken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Analytics")

@router.get("/user/{user_id}")
async def get_user_stories_analytics(
    user_id: int,
    days: int = Query(30, ge=1, le=90, description="Anzahl Tage für User-Analytics"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """User-spezifische Stories-Analytics"""
    try:
        # Prüfen ob User Zugriff auf die Daten hat
        if current_user.id != user_id and not getattr(current_user, 'is_admin', False):
            raise HTTPException(status_code=403, detail="Kein Zugriff auf User-Analytics")
        
        analytics = StoriesAnalytics(session)
        user_metrics = await analytics.get_user_stories_analytics(user_id=user_id, days=days)
        
        return {
            "success": True,
            "user_analytics": user_metrics,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der User-Analytics: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der User-Analytics")

@router.get("/trends")
async def get_engagement_trends(
    days: int = Query(7, ge=1, le=30, description="Anzahl Tage für Trends"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Engagement-Trends über Zeit"""
    try:
        analytics = StoriesAnalytics(session)
        trends = await analytics.get_stories_engagement_trends(days=days)
        
        return {
            "success": True,
            "trends": trends,
            "period_days": days,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Engagement-Trends: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Trends")

@router.get("/alerts")
async def get_performance_alerts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Performance-Alerts für Stories"""
    try:
        analytics = StoriesAnalytics(session)
        alerts = await analytics.get_stories_performance_alerts()
        
        return {
            "success": True,
            "alerts": alerts,
            "alert_count": len(alerts),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Performance-Alerts: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Alerts")

@router.get("/realtime")
async def get_real_time_metrics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Echtzeit-Metriken für Stories"""
    try:
        analytics = StoriesAnalytics(session)
        realtime_metrics = await analytics.get_stories_real_time_metrics()
        
        return {
            "success": True,
            "realtime_metrics": realtime_metrics
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Echtzeit-Metriken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Echtzeit-Metriken")

@router.get("/dashboard")
async def get_analytics_dashboard(
    days: int = Query(7, ge=1, le=30, description="Anzahl Tage für Dashboard"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Vollständiges Analytics-Dashboard für Stories"""
    try:
        analytics = StoriesAnalytics(session)
        
        # Alle Metriken parallel abrufen
        performance_metrics = await analytics.get_stories_performance_metrics(days=days)
        engagement_trends = await analytics.get_stories_engagement_trends(days=days)
        performance_alerts = await analytics.get_stories_performance_alerts()
        realtime_metrics = await analytics.get_stories_real_time_metrics()
        user_analytics = await analytics.get_user_stories_analytics(current_user.id, days=days)
        
        return {
            "success": True,
            "dashboard": {
                "performance": performance_metrics,
                "trends": engagement_trends,
                "alerts": performance_alerts,
                "realtime": realtime_metrics,
                "user": user_analytics
            },
            "period_days": days,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Analytics-Dashboards: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen des Dashboards")

# Import für datetime
from datetime import datetime
