"""
Favorites routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select
from models import Favorite, User, Listing
from app.dependencies import get_session, get_current_user, get_current_user_optional
from typing import List
import logging
from datetime import datetime

# Router für Favorites-Endpoints
router = APIRouter(prefix="/api", tags=["favorites"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/favorites/{listing_id}")
async def add_to_favorites(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing zu Favoriten hinzufügen"""
    
    # Prüfen ob Listing existiert
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Prüfen ob bereits in Favoriten
    existing_favorite = session.exec(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.listing_id == listing_id
        )
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Listing ist bereits in den Favoriten")
    
    # Zu Favoriten hinzufügen
    favorite = Favorite(user_id=current_user.id, listing_id=listing_id)
    session.add(favorite)
    session.commit()
    
    # Automatische Benachrichtigung für Listing-Besitzer
    try:
        from app.notifications.service import NotificationService
        notification_service = NotificationService(session)
        notification_service.notify_listing_favorite(listing_id, current_user.id)
        
        # WebSocket-Benachrichtigung senden
        from app.websocket.manager import manager as websocket_manager
        user = session.get(User, current_user.id)
        if user:
            await websocket_manager.send_notification(
                user_id=listing.user_id,
                notification_data={
                    "id": 0,  # Wird von NotificationService überschrieben
                    "type": "listing_favorite",
                    "title": "Anzeige favorisiert",
                    "message": f"Deine Anzeige '{listing.title}' wurde zu den Favoriten hinzugefügt",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat(),
                    "related_user_id": current_user.id,
                    "related_listing_id": listing_id
                }
            )
            
            # Favorite-Update an den User senden
            await websocket_manager.send_favorite_update(
                user_id=current_user.id,
                favorite_data={
                    "action": "added",
                    "listing_id": listing_id,
                    "user_id": current_user.id,
                    "listing_title": listing.title
                }
            )
    except Exception as e:
        logger.error(f"Fehler bei automatischer Benachrichtigung: {e}")
    
    return {"message": "Listing zu Favoriten hinzugefügt"}

@router.delete("/favorites/{listing_id}")
async def remove_from_favorites(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing aus Favoriten entfernen"""
    
    # Favorit finden
    favorite = session.exec(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.listing_id == listing_id
        )
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Listing nicht in Favoriten gefunden")
    
    # Aus Favoriten entfernen
    session.delete(favorite)
    session.commit()
    
    # WebSocket-Update senden
    try:
        from app.websocket.manager import manager as websocket_manager
        await websocket_manager.send_favorite_update(
            user_id=current_user.id,
            favorite_data={
                "action": "removed",
                "listing_id": listing_id,
                "user_id": current_user.id
            }
        )
    except Exception as e:
        logger.error(f"Fehler beim Senden des Favorite-Updates: {e}")
    
    return {"message": "Listing aus Favoriten entfernt"}

@router.get("/favorites")
def get_favorites(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Favoriten des Benutzers abrufen"""
    
    # Favoriten mit Listing-Details abrufen
    favorites = session.exec(
        select(Favorite, Listing)
        .join(Listing, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    ).all()
    
    result = []
    for favorite, listing in favorites:
        try:
            import json
            attributes = json.loads(listing.attributes) if listing.attributes else {}
            images = json.loads(listing.images) if listing.images else []
        except:
            attributes = {}
            images = []
        
        result.append({
            "id": favorite.id,
            "listing": {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price,
                "category": listing.category,
                "location": listing.location,
                "images": images,
                "attributes": attributes,
                "created_at": listing.created_at.isoformat() if listing.created_at else None
            },
            "added_at": favorite.created_at.isoformat() if favorite.created_at else None
        })
    
    return {"favorites": result}
