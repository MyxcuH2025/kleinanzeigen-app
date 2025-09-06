"""
Listing routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    Listing, ListingStatus, ListingCreate, ListingUpdate, 
    User, Favorite, VerificationState, Conversation, Message
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime
from typing import Optional, List
import logging

# Router für Listing-Endpoints
router = APIRouter(prefix="/api", tags=["listings"])

# Logging
logger = logging.getLogger(__name__)

def filter_by_json_attribute(query, attribute_name: str, value: any, operator: str = "equals"):
    """Filtert nach JSON-Attributen mit verschiedenen Operatoren"""
    if value is None:
        return query
    
    if operator == "equals":
        if isinstance(value, str):
            return query.where(Listing.attributes.contains(f'"{attribute_name}": "{value}"'))
        else:
            return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    elif operator == "contains":
        return query.where(Listing.attributes.contains(f'"{attribute_name}": "{value}"'))
    elif operator == "range_min":
        return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    elif operator == "range_max":
        return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    
    return query

@router.get("/listings/user")
def get_user_listings(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Holt alle Anzeigen des eingeloggten Benutzers"""
    try:
        # Nur Anzeigen des eingeloggten Nutzers
        query = select(Listing).where(Listing.user_id == current_user.id).order_by(Listing.id.desc())
        listings = session.exec(query).all()
        
        # Hole alle Listing-IDs für Batch-Queries
        listing_ids = [listing.id for listing in listings]
        
        # Batch-Query für Favoriten
        favorites_query = session.exec(
            select(Favorite.listing_id, func.count(Favorite.id).label('count'))
            .where(Favorite.listing_id.in_(listing_ids))
            .group_by(Favorite.listing_id)
        ).all()
        favorites_dict = {fav.listing_id: fav.count for fav in favorites_query}
        
        # Batch-Query für Nachrichten
        messages_query = session.exec(
            select(Conversation.listing_id, func.count(Message.id).label('count'))
            .join(Message, Message.conversation_id == Conversation.id)
            .where(Conversation.listing_id.in_(listing_ids))
            .group_by(Conversation.listing_id)
        ).all()
        messages_dict = {msg.listing_id: msg.count for msg in messages_query}
        
        # Konvertiere die Daten in das erwartete Format
        user_listings = []
        for listing in listings:
            # Parse JSON-Felder
            try:
                attributes = json.loads(listing.attributes) if listing.attributes else {}
                images = json.loads(listing.images) if listing.images else []
            except json.JSONDecodeError:
                attributes = {}
                images = []
            
            # Konvertiere relative Bildpfade zu absoluten URLs
            if images and isinstance(images, list):
                images = [f"http://localhost:8000{image}" if image.startswith('/') else image for image in images]
            
            # Bestimme den Status
            status = listing.status
            if status == "ACTIVE":
                status = "active"
            elif status == "INACTIVE":
                status = "paused"
            elif status == "SOLD":
                status = "expired"
            else:
                status = "draft"
            
            # Hole Statistiken aus den Batch-Queries
            favorites_count = favorites_dict.get(listing.id, 0)
            messages_count = messages_dict.get(listing.id, 0)
            
            # Erstelle das Listing-Objekt
            user_listing = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price or 0,
                "category": listing.category,
                "location": listing.location,
                "images": images,
                "user_id": listing.user_id,
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
                "status": status,
                "views": listing.views or 0,
                "messages": messages_count,
                "favorites": favorites_count,
                "highlighted": attributes.get("highlighted", False),
                "attributes": attributes
            }
            
            # Füge Fahrzeugdetails hinzu, falls es sich um ein Auto handelt
            if listing.category == "autos" and attributes:
                user_listing["vehicleDetails"] = {
                    "marke": attributes.get("marke", ""),
                    "erstzulassung": attributes.get("erstzulassung", ""),
                    "kilometerstand": attributes.get("kilometerstand", ""),
                    "kraftstoff": attributes.get("kraftstoff", ""),
                    "getriebe": attributes.get("getriebe", ""),
                    "leistung": attributes.get("leistung", ""),
                    "farbe": attributes.get("farbe", ""),
                    "unfallfrei": attributes.get("unfallfrei", True)
                }
            
            user_listings.append(user_listing)
        
        return {"listings": user_listings}
        
    except Exception as e:
        logger.error(f"Fehler beim Laden der Benutzer-Anzeigen: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Anzeigen")

@router.get("/listings")
def get_listings(
    # Grundlegende Filter
    category: Optional[str] = Query(None, description="Kategorie: autos oder kleinanzeigen"),
    price_min: Optional[float] = Query(None, description="Minimaler Preis"),
    price_max: Optional[float] = Query(None, description="Maximaler Preis"),
    condition: Optional[str] = Query(None, description="Zustand"),
    location: Optional[str] = Query(None, description="Standort"),
    search: Optional[str] = Query(None, description="Freitext-Suche in Titel und Beschreibung"),
    
    # Auto-spezifische Filter
    marke: Optional[str] = Query(None, description="Marke (nur für Autos)"),
    modell: Optional[str] = Query(None, description="Modell (nur für Autos)"),
    erstzulassung_min: Optional[int] = Query(None, description="Minimale Erstzulassung (nur für Autos)"),
    erstzulassung_max: Optional[int] = Query(None, description="Maximale Erstzulassung (nur für Autos)"),
    kilometerstand_min: Optional[int] = Query(None, description="Minimaler Kilometerstand (nur für Autos)"),
    kilometerstand_max: Optional[int] = Query(None, description="Maximaler Kilometerstand (nur für Autos)"),
    getriebe: Optional[str] = Query(None, description="Getriebe (nur für Autos)"),
    kraftstoff: Optional[str] = Query(None, description="Kraftstoff (nur für Autos)"),
    fahrzeugtyp: Optional[str] = Query(None, description="Fahrzeugtyp: auto, motorrad, wohnmobil, lkw"),
    
    # Kleinanzeigen-spezifische Filter
    zustand: Optional[str] = Query(None, description="Zustand (nur für Kleinanzeigen)"),
    versand: Optional[bool] = Query(None, description="Versand möglich (nur für Kleinanzeigen)"),
    garantie: Optional[bool] = Query(None, description="Garantie (nur für Kleinanzeigen)"),
    kategorie: Optional[str] = Query(None, description="Kategorie (nur für Kleinanzeigen)"),
    
    # Sortierung und Pagination
    sort_by: str = Query("created_at", description="Sortierung: price, created_at, title"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    
    session: Session = Depends(get_session)
):
    """Alle Listings abrufen mit Filtern"""
    
    # Basis-Query
    query = select(Listing).where(Listing.status == ListingStatus.ACTIVE)
    
    # Kategorie-Filter
    if category:
        query = query.where(Listing.category == category)
    
    # Preis-Filter
    if price_min is not None:
        query = query.where(Listing.price >= price_min)
    if price_max is not None:
        query = query.where(Listing.price <= price_max)
    
    # Zustand-Filter
    if condition:
        query = query.where(Listing.condition == condition)
    
    # Standort-Filter
    if location:
        query = query.where(Listing.location.contains(location))
    
    # Freitext-Suche
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Listing.title.contains(search_term),
                Listing.description.contains(search_term)
            )
        )
    
    # Auto-spezifische Filter
    if category == "autos":
        if marke:
            query = filter_by_json_attribute(query, "marke", marke)
        if modell:
            query = filter_by_json_attribute(query, "modell", modell)
        if erstzulassung_min is not None:
            query = filter_by_json_attribute(query, "erstzulassung", erstzulassung_min, "gte")
        if erstzulassung_max is not None:
            query = filter_by_json_attribute(query, "erstzulassung", erstzulassung_max, "lte")
        if kilometerstand_min is not None:
            query = filter_by_json_attribute(query, "kilometerstand", kilometerstand_min, "gte")
        if kilometerstand_max is not None:
            query = filter_by_json_attribute(query, "kilometerstand", kilometerstand_max, "lte")
        if getriebe:
            query = filter_by_json_attribute(query, "getriebe", getriebe)
        if kraftstoff:
            query = filter_by_json_attribute(query, "kraftstoff", kraftstoff)
        if fahrzeugtyp:
            query = filter_by_json_attribute(query, "fahrzeugtyp", fahrzeugtyp)
    
    # Kleinanzeigen-spezifische Filter
    if category == "kleinanzeigen":
        if zustand:
            query = filter_by_json_attribute(query, "zustand", zustand)
        if versand is not None:
            query = filter_by_json_attribute(query, "versand", versand)
        if garantie is not None:
            query = filter_by_json_attribute(query, "garantie", garantie)
        if kategorie:
            query = filter_by_json_attribute(query, "kategorie", kategorie)
    
    # Sortierung
    if sort_by == "price":
        if sort_order == "asc":
            query = query.order_by(Listing.price.asc())
        else:
            query = query.order_by(Listing.price.desc())
    elif sort_by == "title":
        if sort_order == "asc":
            query = query.order_by(Listing.title.asc())
        else:
            query = query.order_by(Listing.title.desc())
    else:  # created_at
        if sort_order == "asc":
            query = query.order_by(Listing.created_at.asc())
        else:
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
            raw_images = json.loads(listing.images)
            # Korrigiere Bild-URLs: Entferne /api/uploads/ Präfix
            corrected_images = []
            for img in raw_images:
                if img and isinstance(img, str):
                    # Entferne /api/uploads/ falls vorhanden
                    if img.startswith('/api/uploads/'):
                        corrected_img = img.replace('/api/uploads/', '')
                    elif img.startswith('api/uploads/'):
                        corrected_img = img.replace('api/uploads/', '')
                    else:
                        corrected_img = img
                    corrected_images.append(corrected_img)
            listing_data["images"] = corrected_images
        except:
            listing_data["attributes"] = {}
            listing_data["images"] = []
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if user.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            avatar_url = user.avatar
            # Nur relative Pfade speichern; Frontend mappt zur absoluten URL
            if avatar_url and avatar_url.startswith('/api/uploads/'):
                avatar_url = avatar_url.replace('/api/uploads/', '')
            elif avatar_url and avatar_url.startswith('api/uploads/'):
                avatar_url = avatar_url.replace('api/uploads/', '')
            listing_data["seller"] = {
                "id": user.id,
                "name": user.email.split('@')[0],
                "avatar": avatar_url,
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
    
    # Pagination-Informationen berechnen
    total_count = len(response_listings)
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 1
    
    return {
        "listings": response_listings,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": total_pages
        }
    }

@router.post("/listings")
def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Listing erstellen"""
    
    # Neues Listing erstellen
    new_listing = Listing(
        title=listing.title,
        description=listing.description,
        category=listing.category,
        condition=listing.condition,
        location=listing.location,
        price=listing.price,
        attributes=json.dumps(listing.attributes) if listing.attributes else "{}",
        images=json.dumps(listing.images) if listing.images else "[]",
        user_id=current_user.id
    )
    
    session.add(new_listing)
    session.commit()
    session.refresh(new_listing)
    
    # Automatische Benachrichtigung für Follower
    try:
        from app.notifications.service import NotificationService
        notification_service = NotificationService(session)
        notification_service.notify_new_listing(new_listing)
    except Exception as e:
        logger.error(f"Fehler bei automatischer Benachrichtigung: {e}")
    
    # Response formatieren
    response = new_listing.dict()
    response["attributes"] = listing.attributes
    response["images"] = listing.images
    
    return response

@router.get("/listings/{listing_id}")
def get_listing_by_id(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Einzelnes Listing abrufen"""
    
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Views erhöhen
    listing.views += 1
    session.add(listing)
    session.commit()
    
    # Response formatieren - manuell alle Felder extrahieren
    response = {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "price": listing.price,
        "category": listing.category,
        "location": listing.location,
        "status": listing.status,
        "views": listing.views,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
        "user_id": listing.user_id
    }
    
    try:
        response["attributes"] = json.loads(listing.attributes) if listing.attributes else {}
        raw_images = json.loads(listing.images) if listing.images else []
        response["images"] = [img.replace('/api/uploads/', '').replace('api/uploads/', '') for img in raw_images if img]
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if user.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            avatar_url = user.avatar
            if avatar_url and avatar_url.startswith('/api/uploads/'):
                avatar_url = avatar_url.replace('/api/uploads/', '')
            elif avatar_url and avatar_url.startswith('api/uploads/'):
                avatar_url = avatar_url.replace('api/uploads/', '')
            response["seller"] = {
                "id": user.id,
                "name": user.email.split('@')[0],
                "avatar": avatar_url,
                "rating": 4.5,
                "reviewCount": 12,
                "userType": user.verification_state.value if user.verification_state else "unverified",
                "badge": seller_badge,
                "isFollowing": False
            }
        else:
            response["seller"] = {
                "id": None,
                "name": "Unbekannt",
                "avatar": None,
                "rating": 0.0,
                "reviewCount": 0,
                "userType": "unverified",
                "badge": None,
                "isFollowing": False
            }
    except Exception as e:
        print(f"Fehler beim Parsen der JSON-Felder: {e}")
        response["attributes"] = {}
        response["images"] = []
        response["seller"] = {
            "id": None,
            "name": "Unbekannt",
            "avatar": None,
            "rating": 0.0,
            "reviewCount": 0,
            "userType": "unverified",
            "badge": None,
            "isFollowing": False
        }
    
    return response

@router.put("/listings/{listing_id}")
def update_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    listing_update: ListingUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing bearbeiten"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann bearbeiten
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Bearbeiten dieses Listings")
    
    # Felder aktualisieren
    update_data = listing_update.dict(exclude_unset=True)
    
    if "attributes" in update_data:
        update_data["attributes"] = json.dumps(update_data["attributes"])
    if "images" in update_data:
        update_data["images"] = json.dumps(update_data["images"])
    
    # Timestamp aktualisieren
    update_data["updated_at"] = datetime.utcnow()
    
    # Listing aktualisieren
    for field, value in update_data.items():
        if hasattr(listing, field):
            setattr(listing, field, value)
    
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Response formatieren
    response = listing.dict()
    try:
        response["attributes"] = json.loads(listing.attributes)
        raw_images = json.loads(listing.images)
        response["images"] = [img.replace('/api/uploads/', '').replace('api/uploads/', '') for img in raw_images if img]
    except:
        response["attributes"] = {}
        response["images"] = []
    
    return response

@router.patch("/listings/{listing_id}/status")
def toggle_listing_status(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing-Status umschalten (active/paused)"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann Status ändern
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Ändern des Status dieses Listings")
    
    # Status umschalten
    if listing.status == "active":
        listing.status = "inactive"
    else:
        listing.status = "active"
    
    listing.updated_at = datetime.utcnow()
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Status für Frontend konvertieren
    frontend_status = "active" if listing.status == "active" else "paused"
    
    return {
        "message": f"Listing-Status erfolgreich auf '{frontend_status}' gesetzt",
        "status": frontend_status,
        "listing_id": listing.id
    }

@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing löschen"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann löschen
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Löschen dieses Listings")
    
    # Alle zugehörigen Favoriten löschen
    favorites = session.exec(select(Favorite).where(Favorite.listing_id == listing_id)).all()
    for favorite in favorites:
        session.delete(favorite)
    
    # Listing löschen
    session.delete(listing)
    session.commit()
    
    return {"message": "Listing erfolgreich gelöscht"}
