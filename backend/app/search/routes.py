"""
Search routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func, create_engine
from models import Listing, User, VerificationState
from typing import Optional, List
import json
from app.cache.decorators import cache_search_results, cache_listings
from config import config

# Router für Search-Endpoints
router = APIRouter(prefix="/api", tags=["search"])

def get_session():
    engine = create_engine(config.DATABASE_URL)
    with Session(engine) as session:
        yield session

@router.get("/search")
@cache_search_results(ttl=180)  # 3 Minuten Cache
def search_listings(
    q: str = Query(..., description="Suchbegriff"),
    category: Optional[str] = Query(None, description="Kategorie"),
    location: Optional[str] = Query(None, description="Standort"),
    price_min: Optional[float] = Query(None, description="Minimaler Preis"),
    price_max: Optional[float] = Query(None, description="Maximaler Preis"),
    sort_by: str = Query("relevance", description="Sortierung: relevance, price, date"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    session: Session = Depends(get_session)
):
    """Erweiterte Suche nach Listings"""
    
    # Basis-Query
    query = select(Listing).where(Listing.status == "ACTIVE")
    
    # Suchbegriff in Titel und Beschreibung
    if q:
        search_term = f"%{q}%"
        query = query.where(
            or_(
                Listing.title.contains(search_term),
                Listing.description.contains(search_term)
            )
        )
    
    # Kategorie-Filter
    if category:
        query = query.where(Listing.category == category)
    
    # Standort-Filter
    if location:
        query = query.where(Listing.location.contains(location))
    
    # Preis-Filter
    if price_min is not None:
        query = query.where(Listing.price >= price_min)
    if price_max is not None:
        query = query.where(Listing.price <= price_max)
    
    # Sortierung
    if sort_by == "price":
        if sort_order == "asc":
            query = query.order_by(Listing.price.asc())
        else:
            query = query.order_by(Listing.price.desc())
    elif sort_by == "date":
        if sort_order == "asc":
            query = query.order_by(Listing.created_at.asc())
        else:
            query = query.order_by(Listing.created_at.desc())
    else:  # relevance (Standard)
        query = query.order_by(Listing.created_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    # Ausführen
    listings = session.exec(query).all()
    
    # Response formatieren
    response_listings = []
    for listing in listings:
        listing_data = listing.dict()
        try:
            listing_data["attributes"] = json.loads(listing.attributes)
            listing_data["images"] = json.loads(listing.images)
        except:
            listing_data["attributes"] = {}
            listing_data["images"] = []
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            seller_badge = None
            if user.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            listing_data["seller"] = {
                "id": user.id,
                "name": user.email.split('@')[0],
                "avatar": None,
                "rating": 4.5,
                "reviewCount": 12,
                "userType": user.verification_state.value if user.verification_state else "unverified",
                "badge": seller_badge
            }
        else:
            listing_data["seller"] = {
                "id": None,
                "name": "Unbekannt",
                "avatar": None,
                "rating": 0.0,
                "reviewCount": 0,
                "userType": "unverified",
                "badge": None
            }
        
        response_listings.append(listing_data)
    
    return {
        "listings": response_listings,
        "query": q,
        "filters": {
            "category": category,
            "location": location,
            "price_min": price_min,
            "price_max": price_max
        },
        "sorting": {
            "sort_by": sort_by,
            "sort_order": sort_order
        },
        "pagination": {
            "page": page,
            "limit": limit,
            "total": len(response_listings)
        }
    }
