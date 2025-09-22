"""
Erweiterte Search-Routes mit Elasticsearch
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from models import Listing, User
from typing import Optional, List, Dict, Any
import json
import logging
from app.dependencies import get_session, get_current_user_optional
from app.search.elasticsearch_service import elasticsearch_service
from app.cache.decorators import cache_search_results
from config import config

logger = logging.getLogger(__name__)

# Router für erweiterte Search-Endpoints
router = APIRouter(prefix="/api/search", tags=["advanced-search"])

@router.get("/listings")
@cache_search_results(ttl=180)  # 3 Minuten Cache
def advanced_search_listings(
    q: str = Query(..., description="Suchbegriff"),
    category: Optional[str] = Query(None, description="Kategorie"),
    location: Optional[str] = Query(None, description="Standort"),
    price_min: Optional[float] = Query(None, description="Minimaler Preis"),
    price_max: Optional[float] = Query(None, description="Maximaler Preis"),
    condition: Optional[str] = Query(None, description="Zustand"),
    sort_by: str = Query("relevance", description="Sortierung: relevance, price, date, views"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    use_elasticsearch: bool = Query(True, description="Elasticsearch verwenden"),
    session: Session = Depends(get_session)
):
    """Erweiterte Suche nach Listings mit Elasticsearch"""
    
    # Parameter für Elasticsearch vorbereiten
    search_params = {
        "q": q,
        "category": category,
        "location": location,
        "price_min": price_min,
        "price_max": price_max,
        "condition": condition,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "offset": (page - 1) * limit,
        "limit": limit
    }
    
    # Versuche Elasticsearch zuerst
    if use_elasticsearch and elasticsearch_service.is_available:
        try:
            logger.info(f"🔍 Elasticsearch-Suche: {q}")
            es_results = elasticsearch_service.search_listings(search_params)
            
            if "error" not in es_results:
                # Elasticsearch-Ergebnisse erfolgreich
                results = es_results.get("results", [])
                total = es_results.get("total", 0)
                took = es_results.get("took", 0)
                
                # Zusätzliche Daten aus DB holen (User-Info, etc.)
                enhanced_results = []
                for result in results:
                    enhanced_result = result.copy()
                    
                    # User-Informationen hinzufügen
                    user = session.get(User, result.get("user_id"))
                    if user:
                        enhanced_result["seller"] = {
                            "id": user.id,
                            "display_name": user.display_name,
                            "verification_state": user.verification_state
                        }
                    
                    enhanced_results.append(enhanced_result)
                
                return {
                    "results": enhanced_results,
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "total_pages": (total + limit - 1) // limit,
                    "search_engine": "elasticsearch",
                    "took_ms": took
                }
            else:
                logger.warning(f"Elasticsearch-Fehler: {es_results.get('error')}")
                # Fallback zu DB-Suche
                
        except Exception as e:
            logger.error(f"Elasticsearch-Suchfehler: {e}")
            # Fallback zu DB-Suche
    
    # Fallback zu PostgreSQL-Suche
    if config.SEARCH_FALLBACK_TO_DB:
        logger.info(f"🗄️ PostgreSQL-Fallback-Suche: {q}")
        return _postgresql_search_listings(search_params, session)
    else:
        raise HTTPException(status_code=503, detail="Such-Service temporär nicht verfügbar")

@router.get("/users")
@cache_search_results(ttl=300)  # 5 Minuten Cache
def advanced_search_users(
    q: str = Query(..., description="Suchbegriff"),
    role: Optional[str] = Query(None, description="Rolle"),
    verification_state: Optional[str] = Query(None, description="Verifizierungsstatus"),
    location: Optional[str] = Query(None, description="Standort"),
    sort_by: str = Query("relevance", description="Sortierung: relevance, date"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    use_elasticsearch: bool = Query(True, description="Elasticsearch verwenden"),
    session: Session = Depends(get_session)
):
    """Erweiterte Suche nach Users mit Elasticsearch"""
    
    # Parameter für Elasticsearch vorbereiten
    search_params = {
        "q": q,
        "role": role,
        "verification_state": verification_state,
        "location": location,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "offset": (page - 1) * limit,
        "limit": limit
    }
    
    # Versuche Elasticsearch zuerst
    if use_elasticsearch and elasticsearch_service.is_available:
        try:
            logger.info(f"🔍 Elasticsearch-User-Suche: {q}")
            es_results = elasticsearch_service.search_users(search_params)
            
            if "error" not in es_results:
                # Elasticsearch-Ergebnisse erfolgreich
                results = es_results.get("results", [])
                total = es_results.get("total", 0)
                took = es_results.get("took", 0)
                
                return {
                    "results": results,
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "total_pages": (total + limit - 1) // limit,
                    "search_engine": "elasticsearch",
                    "took_ms": took
                }
            else:
                logger.warning(f"Elasticsearch-User-Fehler: {es_results.get('error')}")
                # Fallback zu DB-Suche
                
        except Exception as e:
            logger.error(f"Elasticsearch-User-Suchfehler: {e}")
            # Fallback zu DB-Suche
    
    # Fallback zu PostgreSQL-Suche
    if config.SEARCH_FALLBACK_TO_DB:
        logger.info(f"🗄️ PostgreSQL-User-Fallback-Suche: {q}")
        return _postgresql_search_users(search_params, session)
    else:
        raise HTTPException(status_code=503, detail="Such-Service temporär nicht verfügbar")

@router.get("/suggestions")
def search_suggestions(
    q: str = Query(..., min_length=2, description="Suchbegriff für Vorschläge"),
    type: str = Query("listings", description="Typ: listings, users, categories"),
    limit: int = Query(10, ge=1, le=20, description="Anzahl Vorschläge"),
    session: Session = Depends(get_session)
):
    """Such-Vorschläge basierend auf Elasticsearch"""
    
    if not elasticsearch_service.is_available:
        return {"suggestions": [], "error": "Elasticsearch nicht verfügbar"}
    
    try:
        suggestions = []
        
        if type == "listings":
            # Listing-Titel-Vorschläge
            query = {
                "suggest": {
                    "listing_suggest": {
                        "prefix": q,
                        "completion": {
                            "field": "title.suggest",
                            "size": limit
                        }
                    }
                }
            }
            
            response = elasticsearch_service.client.search(
                index=config.ELASTICSEARCH_INDEX_LISTINGS,
                body=query
            )
            
            suggestions = [
                option["text"] 
                for option in response.get("suggest", {}).get("listing_suggest", [{}])[0].get("options", [])
            ]
            
        elif type == "categories":
            # Kategorie-Vorschläge
            query = {
                "aggs": {
                    "categories": {
                        "terms": {
                            "field": "category",
                            "include": f"{q}.*",
                            "size": limit
                        }
                    }
                },
                "size": 0
            }
            
            response = elasticsearch_service.client.search(
                index=config.ELASTICSEARCH_INDEX_LISTINGS,
                body=query
            )
            
            suggestions = [
                bucket["key"] 
                for bucket in response.get("aggregations", {}).get("categories", {}).get("buckets", [])
            ]
        
        return {
            "suggestions": suggestions,
            "query": q,
            "type": type,
            "search_engine": "elasticsearch"
        }
        
    except Exception as e:
        logger.error(f"Such-Vorschläge-Fehler: {e}")
        return {"suggestions": [], "error": str(e)}

@router.get("/stats")
def search_stats():
    """Such-Engine-Statistiken"""
    stats = {
        "elasticsearch": elasticsearch_service.get_stats(),
        "fallback_enabled": config.SEARCH_FALLBACK_TO_DB,
        "elasticsearch_enabled": config.ELASTICSEARCH_ENABLED
    }
    
    return stats

def _postgresql_search_listings(params: Dict[str, Any], session: Session) -> Dict[str, Any]:
    """PostgreSQL-Fallback-Suche für Listings"""
    from app.search.routes import search_listings as pg_search
    
    # Parameter für PostgreSQL-Suche anpassen
    pg_params = {
        "q": params.get("q", ""),
        "category": params.get("category"),
        "location": params.get("location"),
        "price_min": params.get("price_min"),
        "price_max": params.get("price_max"),
        "sort_by": params.get("sort_by", "relevance"),
        "sort_order": params.get("sort_order", "desc"),
        "page": (params.get("offset", 0) // params.get("limit", 20)) + 1,
        "limit": params.get("limit", 20),
        "session": session
    }
    
    # PostgreSQL-Suche ausführen
    results = pg_search(**pg_params)
    
    # Format für erweiterte Suche anpassen
    return {
        "results": results.get("results", []),
        "total": results.get("total", 0),
        "page": pg_params["page"],
        "limit": pg_params["limit"],
        "total_pages": results.get("total_pages", 1),
        "search_engine": "postgresql",
        "took_ms": 0
    }

def _postgresql_search_users(params: Dict[str, Any], session: Session) -> Dict[str, Any]:
    """PostgreSQL-Fallback-Suche für Users"""
    
    # Basis-Query
    query = select(User).where(User.is_active == True)
    
    # Textsuche
    if params.get("q"):
        search_term = f"%{params['q']}%"
        query = query.where(
            or_(
                User.first_name.contains(search_term),
                User.last_name.contains(search_term),
                User.display_name.contains(search_term),
                User.bio.contains(search_term)
            )
        )
    
    # Filter
    if params.get("role"):
        query = query.where(User.role == params["role"])
    
    if params.get("verification_state"):
        query = query.where(User.verification_state == params["verification_state"])
    
    if params.get("location"):
        query = query.where(User.location.contains(params["location"]))
    
    # Sortierung
    sort_by = params.get("sort_by", "relevance")
    sort_order = params.get("sort_order", "desc")
    
    if sort_by == "date":
        if sort_order == "asc":
            query = query.order_by(User.created_at.asc())
        else:
            query = query.order_by(User.created_at.desc())
    else:  # relevance
        query = query.order_by(User.created_at.desc())
    
    # Pagination
    offset = params.get("offset", 0)
    limit = params.get("limit", 20)
    query = query.offset(offset).limit(limit)
    
    # Ausführen
    users = session.exec(query).all()
    total = session.exec(select(func.count(User.id)).where(User.is_active == True)).one()
    
    # Formatieren
    results = []
    for user in users:
        user_data = user.dict()
        # Sensible Daten entfernen
        user_data.pop("hashed_password", None)
        user_data.pop("email", None)
        results.append(user_data)
    
    page = (offset // limit) + 1
    
    return {
        "results": results,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "search_engine": "postgresql",
        "took_ms": 0
    }
