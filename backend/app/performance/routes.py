"""
Performance Monitoring Routes
API-Endpoints für Performance-Überwachung und Metriken
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from sqlalchemy import text
from typing import Dict, Any, Optional
from .monitoring import performance_monitor
from ..dependencies import get_session
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

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
        # Teste Datenbankverbindung (korrektes Text-Statement)
        session.exec(text("SELECT 1")).fetchone()
        
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

@router.post("/load-test-results")
async def receive_load_test_results(
    request: Request,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Empfängt Load-Test-Ergebnisse und speichert sie für Analyse
    """
    try:
        # Load-Test-Daten empfangen
        data = await request.json()
        
        # Daten validieren
        test_type = data.get("test_type")
        results = data.get("results", {})
        timestamp = data.get("timestamp")
        config = data.get("config", {})
        
        if not test_type or not results:
            raise HTTPException(status_code=400, detail="Ungültige Load-Test-Daten")
        
        # Load-Test-Ergebnisse loggen
        logger.info(f"📊 Load-Test-Ergebnisse empfangen: {test_type}")
        logger.info(f"   Verbindungen: {results.get('total_connections', 0)}")
        logger.info(f"   Erfolgsrate: {results.get('successful_connections', 0)}/{results.get('total_connections', 0)}")
        logger.info(f"   Response-Zeit: {results.get('average_response_time', 0):.3f}s")
        logger.info(f"   Fehlerrate: {results.get('error_rate', 0):.2f}%")
        
        # Performance-Bewertung
        performance_score = _calculate_performance_score(results)
        
        return {
            "success": True,
            "message": "Load-Test-Ergebnisse erfolgreich empfangen",
            "performance_score": performance_score,
            "recommendations": _generate_performance_recommendations(results),
            "received_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Empfangen der Load-Test-Ergebnisse: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Verarbeiten der Load-Test-Ergebnisse")

def _calculate_performance_score(results: Dict[str, Any]) -> int:
    """Performance-Score basierend auf Load-Test-Ergebnissen berechnen"""
    try:
        score = 100
        
        # Verbindungsrate bewerten
        connections_per_second = results.get('connections_per_second', 0)
        if connections_per_second < 50:
            score -= 20
        elif connections_per_second < 100:
            score -= 10
        
        # Response-Zeit bewerten
        avg_response_time = results.get('average_response_time', 0)
        if avg_response_time > 0.5:
            score -= 20
        elif avg_response_time > 0.1:
            score -= 10
        
        # Fehlerrate bewerten
        error_rate = results.get('error_rate', 0)
        if error_rate > 5:
            score -= 30
        elif error_rate > 1:
            score -= 15
        
        # Erfolgsrate bewerten
        total_connections = results.get('total_connections', 0)
        successful_connections = results.get('successful_connections', 0)
        if total_connections > 0:
            success_rate = (successful_connections / total_connections) * 100
            if success_rate < 90:
                score -= 25
            elif success_rate < 95:
                score -= 10
        
        return max(0, score)
        
    except Exception as e:
        logger.error(f"Fehler beim Berechnen des Performance-Scores: {e}")
        return 0

def _generate_performance_recommendations(results: Dict[str, Any]) -> list:
    """Performance-Empfehlungen basierend auf Load-Test-Ergebnissen generieren"""
    recommendations = []
    
    try:
        # Response-Zeit-Empfehlungen
        avg_response_time = results.get('average_response_time', 0)
        if avg_response_time > 0.5:
            recommendations.append({
                "type": "performance",
                "priority": "high",
                "title": "Response-Zeit optimieren",
                "description": f"Response-Zeit von {avg_response_time:.3f}s ist zu hoch. Empfehlung: Connection Pooling und Caching implementieren."
            })
        
        # Fehlerrate-Empfehlungen
        error_rate = results.get('error_rate', 0)
        if error_rate > 5:
            recommendations.append({
                "type": "reliability",
                "priority": "high",
                "title": "Fehlerrate reduzieren",
                "description": f"Fehlerrate von {error_rate:.2f}% ist zu hoch. Empfehlung: Error-Handling und Retry-Mechanismen verbessern."
            })
        
        # Verbindungsrate-Empfehlungen
        connections_per_second = results.get('connections_per_second', 0)
        if connections_per_second < 50:
            recommendations.append({
                "type": "scalability",
                "priority": "medium",
                "title": "Verbindungsrate erhöhen",
                "description": f"Verbindungsrate von {connections_per_second:.2f}/s ist niedrig. Empfehlung: WebSocket-Verbindungspool optimieren."
            })
        
        # Skalierbarkeit-Empfehlungen
        total_connections = results.get('total_connections', 0)
        successful_connections = results.get('successful_connections', 0)
        if total_connections > 0:
            success_rate = (successful_connections / total_connections) * 100
            if success_rate < 90:
                recommendations.append({
                    "type": "scalability",
                    "priority": "high",
                    "title": "Skalierbarkeit verbessern",
                    "description": f"Erfolgsrate von {success_rate:.1f}% ist zu niedrig. Empfehlung: Load-Balancing und Connection-Management optimieren."
                })
        
        # Positive Empfehlungen
        if avg_response_time <= 0.1 and error_rate <= 1 and success_rate >= 95:
            recommendations.append({
                "type": "optimization",
                "priority": "low",
                "title": "Performance ist excellent",
                "description": "Alle Performance-Metriken sind im optimalen Bereich. System ist bereit für Production."
            })
        
    except Exception as e:
        logger.error(f"Fehler beim Generieren der Performance-Empfehlungen: {e}")
        recommendations.append({
            "type": "error",
            "priority": "medium",
            "title": "Fehler bei Empfehlungsgenerierung",
            "description": f"Fehler beim Analysieren der Load-Test-Ergebnisse: {str(e)}"
        })
    
    return recommendations
