"""
Analytics Routes für Business Intelligence
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
import logging

from app.dependencies import get_session
from models.analytics import AnalyticsEvent, RevenueMetric, ABTest, EventType
from app.analytics.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# ==================== EVENT TRACKING ====================

@router.post("/events/track")
async def track_event(
    event_type: EventType,
    user_id: Optional[int] = None,
    session_id: Optional[str] = None,
    properties: Optional[Dict[str, Any]] = None,
    value: Optional[float] = None,
    request: Request = None,
    session: Session = Depends(get_session)
):
    """Tracke ein Analytics Event"""
    try:
        analytics_service = AnalyticsService(session)
        
        # Extrahiere Request-Informationen
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        referrer = request.headers.get("referer")
        
        event = analytics_service.track_event(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            properties=properties,
            value=value,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer
        )
        
        return {
            "success": True,
            "event_id": event.event_id,
            "message": "Event tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to track event: {e}")
        raise HTTPException(status_code=500, detail="Failed to track event")

@router.get("/events")
async def get_events(
    event_types: Optional[List[EventType]] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(1000, le=10000),
    session: Session = Depends(get_session)
):
    """Hole Events mit Filtern"""
    try:
        analytics_service = AnalyticsService(session)
        
        events = analytics_service.get_events(
            event_types=event_types,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        logger.error(f"Failed to get events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get events")

# ==================== REVENUE ANALYTICS ====================

@router.post("/revenue/calculate/{target_date}")
async def calculate_daily_revenue(
    target_date: date,
    session: Session = Depends(get_session)
):
    """Berechne Tagesumsatz"""
    try:
        analytics_service = AnalyticsService(session)
        
        metric = analytics_service.calculate_daily_revenue(target_date)
        
        return {
            "success": True,
            "metric": metric,
            "message": f"Revenue calculated for {target_date}"
        }
        
    except Exception as e:
        logger.error(f"Failed to calculate revenue for {target_date}: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate revenue")

@router.get("/revenue/metrics")
async def get_revenue_metrics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session)
):
    """Hole Revenue-Metriken"""
    try:
        analytics_service = AnalyticsService(session)
        
        if not start_date:
            start_date = date.today() - timedelta(days=days)
        if not end_date:
            end_date = date.today()
        
        metrics = analytics_service.get_revenue_metrics(start_date, end_date)
        
        return {
            "success": True,
            "metrics": metrics,
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "days": (end_date - start_date).days + 1
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get revenue metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get revenue metrics")

@router.get("/revenue/summary")
async def get_revenue_summary(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session)
):
    """Hole Revenue-Zusammenfassung"""
    try:
        analytics_service = AnalyticsService(session)
        
        summary = analytics_service.get_revenue_summary(days)
        
        return {
            "success": True,
            "summary": summary,
            "period_days": days
        }
        
    except Exception as e:
        logger.error(f"Failed to get revenue summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get revenue summary")

# ==================== USER ANALYTICS ====================

@router.post("/users/{user_id}/update")
async def update_user_analytics(
    user_id: int,
    session: Session = Depends(get_session)
):
    """Aktualisiere User Analytics"""
    try:
        analytics_service = AnalyticsService(session)
        
        analytics = analytics_service.update_user_analytics(user_id)
        
        return {
            "success": True,
            "analytics": analytics,
            "message": f"User analytics updated for user {user_id}"
        }
        
    except Exception as e:
        logger.error(f"Failed to update user analytics for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user analytics")

@router.get("/users/{user_id}")
async def get_user_analytics(
    user_id: int,
    session: Session = Depends(get_session)
):
    """Hole User Analytics"""
    try:
        analytics_service = AnalyticsService(session)
        
        analytics = analytics_service.get_user_analytics(user_id)
        
        if not analytics:
            raise HTTPException(status_code=404, detail="User analytics not found")
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user analytics for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user analytics")

@router.get("/users/top")
async def get_top_users(
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """Hole Top User nach Engagement"""
    try:
        analytics_service = AnalyticsService(session)
        
        top_users = analytics_service.get_top_users(limit)
        
        return {
            "success": True,
            "top_users": top_users,
            "count": len(top_users)
        }
        
    except Exception as e:
        logger.error(f"Failed to get top users: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top users")

# ==================== A/B TESTING ====================

@router.post("/ab-tests")
async def create_ab_test(
    name: str,
    description: str,
    variants: Dict[str, Any],
    traffic_allocation: Dict[str, float],
    primary_metric: str,
    secondary_metrics: Optional[List[str]] = None,
    session: Session = Depends(get_session)
):
    """Erstelle A/B Test"""
    try:
        analytics_service = AnalyticsService(session)
        
        ab_test = analytics_service.create_ab_test(
            name=name,
            description=description,
            variants=variants,
            traffic_allocation=traffic_allocation,
            primary_metric=primary_metric,
            secondary_metrics=secondary_metrics
        )
        
        return {
            "success": True,
            "ab_test": ab_test,
            "message": f"A/B test '{name}' created successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to create A/B test: {e}")
        raise HTTPException(status_code=500, detail="Failed to create A/B test")

@router.post("/ab-tests/{test_id}/assign/{user_id}")
async def assign_user_to_test(
    test_id: str,
    user_id: int,
    session: Session = Depends(get_session)
):
    """Weise User einem Test-Variant zu"""
    try:
        analytics_service = AnalyticsService(session)
        
        variant = analytics_service.assign_user_to_test(user_id, test_id)
        
        return {
            "success": True,
            "variant": variant,
            "message": f"User {user_id} assigned to variant '{variant}'"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to assign user to test: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign user to test")

@router.get("/ab-tests/{test_id}/results")
async def get_test_results(
    test_id: str,
    session: Session = Depends(get_session)
):
    """Hole A/B Test Ergebnisse"""
    try:
        analytics_service = AnalyticsService(session)
        
        results = analytics_service.get_test_results(test_id)
        
        return {
            "success": True,
            "results": results
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get test results: {e}")
        raise HTTPException(status_code=500, detail="Failed to get test results")

@router.get("/ab-tests")
async def get_ab_tests(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Hole alle A/B Tests"""
    try:
        query = select(ABTest)
        if status:
            query = query.where(ABTest.status == status)
        
        ab_tests = session.exec(query).all()
        
        return {
            "success": True,
            "ab_tests": ab_tests,
            "count": len(ab_tests)
        }
        
    except Exception as e:
        logger.error(f"Failed to get A/B tests: {e}")
        raise HTTPException(status_code=500, detail="Failed to get A/B tests")

# ==================== DASHBOARD ====================

@router.get("/dashboard/overview")
async def get_dashboard_overview(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session)
):
    """Hole Dashboard-Übersicht - OPTIMIERT mit Caching"""
    try:
        analytics_service = AnalyticsService(session)
        
        # Cache-Key für bessere Performance
        cache_key = f"dashboard_overview_{days}"
        
        # Prüfe Cache zuerst
        cached_data = analytics_service._get_cache(cache_key)
        if cached_data:
            logger.info("✅ Dashboard-Übersicht aus Cache geladen")
            return cached_data
        
        # Revenue Summary
        revenue_summary = analytics_service.get_revenue_summary(days)
        
        # Top Users
        top_users = analytics_service.get_top_users(5)
        
        # Recent Events (letzte 24h)
        recent_events = analytics_service.get_events(
            start_date=date.today() - timedelta(days=1),
            limit=100
        )
        
        # Event Types Count
        event_counts = {}
        for event in recent_events:
            event_type = event.event_type
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        result = {
            "success": True,
            "overview": {
                "revenue": revenue_summary,
                "top_users": top_users,
                "recent_activity": {
                    "total_events": len(recent_events),
                    "event_types": event_counts
                },
                "period_days": days
            }
        }
        
        # Speichere im Cache für 5 Minuten
        analytics_service._set_cache(cache_key, result, ttl=300)
        logger.info("✅ Dashboard-Übersicht im Cache gespeichert")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get dashboard overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard overview")

@router.get("/dashboard/real-time")
async def get_real_time_metrics(
    session: Session = Depends(get_session)
):
    """Hole Echtzeit-Metriken"""
    try:
        analytics_service = AnalyticsService(session)
        
        # Heute
        today = date.today()
        today_metric = analytics_service.calculate_daily_revenue(today)
        
        # Gestern
        yesterday = today - timedelta(days=1)
        yesterday_metric = analytics_service.calculate_daily_revenue(yesterday)
        
        # Aktuelle Events (letzte Stunde)
        recent_events = analytics_service.get_events(
            start_date=today,
            limit=1000
        )
        
        # Filter für letzte Stunde
        from datetime import datetime, timedelta
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_events = [e for e in recent_events if e.created_at >= one_hour_ago]
        
        return {
            "success": True,
            "real_time": {
                "today_revenue": today_metric.total_revenue,
                "yesterday_revenue": yesterday_metric.total_revenue,
                "revenue_growth": (
                    (today_metric.total_revenue - yesterday_metric.total_revenue) / 
                    yesterday_metric.total_revenue * 100
                ) if yesterday_metric.total_revenue > 0 else 0,
                "recent_events": len(recent_events),
                "active_users": today_metric.active_users,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get real-time metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get real-time metrics")
