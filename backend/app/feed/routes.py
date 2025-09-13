"""
Feed routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload
from models import (
    Listing, User, Follow, Favorite, VerificationState
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

# Router für Feed-Endpoints
router = APIRouter(prefix="/api", tags=["feed"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/feed")
def get_personalized_feed(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der Listings pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    session: Session = Depends(get_session)
):
    """Personalisierter Feed basierend auf gefolgten Benutzern"""
    
    # Benutzer abrufen, denen der aktuelle Benutzer folgt
    following_users = session.exec(
        select(Follow.following_id)
        .where(Follow.follower_id == current_user.id)
    ).all()
    
    if not following_users:
        # Falls keine gefolgten Benutzer, zeige allgemeine Listings
        # OPTIMIERT: Eager Loading mit joinedload um N+1 Queries zu vermeiden
        query = select(Listing).where(Listing.status == "ACTIVE").options(joinedload(Listing.seller))
        listings = session.exec(
            query.order_by(Listing.created_at.desc())
            .offset(offset)
            .limit(limit)
        ).all()
    else:
        # Listings von gefolgten Benutzern abrufen
        # OPTIMIERT: Eager Loading mit joinedload um N+1 Queries zu vermeiden
        query = select(Listing).where(
            Listing.user_id.in_(following_users),
            Listing.status == "ACTIVE"
        ).options(joinedload(Listing.seller))
        listings = session.exec(
            query.order_by(Listing.created_at.desc())
            .offset(offset)
            .limit(limit)
        ).all()
    
    result = []
    for listing in listings:
        # OPTIMIERT: Verkäufer-Informationen bereits geladen durch joinedload
        seller = listing.seller
        
        # Prüfen ob Listing favorisiert ist
        is_favorited = False
        if current_user:
            favorite = session.exec(
                select(Favorite)
                .where(
                    Favorite.user_id == current_user.id,
                    Favorite.listing_id == listing.id
                )
            ).first()
            is_favorited = favorite is not None
        
        # Seller-Badge bestimmen
        seller_badge = None
        if seller and seller.verification_state == VerificationState.SELLER_VERIFIED:
            seller_badge = "verified_seller"
        
        listing_data = listing.dict()
        try:
            listing_data["attributes"] = json.loads(listing.attributes)
            listing_data["images"] = json.loads(listing.images)
        except:
            listing_data["attributes"] = {}
            listing_data["images"] = []
        
        listing_data["seller"] = {
            "id": seller.id if seller else None,
            "name": seller.email.split('@')[0] if seller else "Unbekannt",
            "avatar": seller.avatar if seller else None,
            "rating": 4.5,  # Placeholder
            "reviewCount": 12,  # Placeholder
            "userType": seller.verification_state.value if seller and seller.verification_state else "unverified",
            "badge": seller_badge
        }
        
        listing_data["is_favorited"] = is_favorited
        listing_data["is_following_seller"] = seller.id in following_users if seller else False
        
        result.append(listing_data)
    
    return {
        "listings": result,
        "feed_type": "personalized" if following_users else "general",
        "following_count": len(following_users),
        "pagination": {
            "limit": limit,
            "offset": offset,
            "total": len(result)
        }
    }
