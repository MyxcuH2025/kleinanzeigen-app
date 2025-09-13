"""
Performance Monitoring Routes
API-Endpoints für Performance-Überwachung und Metriken
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Dict, Any
from .monitoring import performance_monitor
from ..dependencies import get_session

router = APIRouter(prefix="/performance", tags=["performance"])

@router.get("/metrics")
async def get_performance_metrics(session: Session = Depends(get_session)) -> Dict[str, Any]:
    """
    Gibt aktuelle Performance-Metriken zurück
    """
    try:
        summary = performance_monitor.get_performance_summary()
        db_metrics = performance_monitor.get_db_metrics(session)
        
        return {
            **summary,
            'database_metrics': db_metrics,
            'status': 'healthy'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

@router.get("/health")
async def health_check(session: Session = Depends(get_session)) -> Dict[str, Any]:
    """
    Einfacher Health Check für Load Balancer
    """
    try:
        # Teste Datenbankverbindung
        session.exec("SELECT 1").fetchone()
        
        system_metrics = performance_monitor.get_system_metrics()
        
        return {
            'status': 'healthy',
            'database': 'connected',
            'memory_usage_percent': system_metrics.get('memory_usage_percent', 0),
            'cpu_usage_percent': system_metrics.get('cpu_usage_percent', 0)
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

@router.get("/recommendations")
async def get_performance_recommendations() -> Dict[str, Any]:
    """
    Gibt Performance-Empfehlungen zurück
    """
    try:
        summary = performance_monitor.get_performance_summary()
        return {
            'recommendations': summary.get('recommendations', []),
            'api_metrics': summary.get('api_metrics', {}),
            'system_metrics': summary.get('system_metrics', {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving recommendations: {str(e)}")

@router.post("/reset-metrics")
async def reset_performance_metrics() -> Dict[str, str]:
    """
    Setzt alle Performance-Metriken zurück (nur für Entwicklung)
    """
    try:
        performance_monitor.metrics = {
            'request_count': 0,
            'total_response_time': 0,
            'avg_response_time': 0,
            'db_query_count': 0,
            'db_query_time': 0,
            'memory_usage': 0,
            'cpu_usage': 0,
            'active_connections': 0
        }
        return {'message': 'Performance metrics reset successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting metrics: {str(e)}")
