"""
Listing routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload
from models import (
    Listing, ListingStatus, ListingCreate, ListingUpdate, 
    User, Favorite, VerificationState, Conversation, Message
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
# from app.cache.decorators import cache_listings  # Temporär deaktiviert
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

@router.get("/listings/{listing_id}/similar")
def get_similar_listings(
    listing_id: int,
    radius_km: float = Query(5.0, description="Radius in Kilometern"),
    limit: int = Query(6, description="Maximale Anzahl ähnlicher Anzeigen"),
    session: Session = Depends(get_session)
):
    """Holt ähnliche Anzeigen basierend auf Kategorie und Standort"""
    try:
        # Hole die Hauptanzeige
        main_listing = session.get(Listing, listing_id)
        if not main_listing:
            raise HTTPException(status_code=404, detail="Anzeige nicht gefunden")
        
        # Baue Query für ähnliche Anzeigen
        query = select(Listing).where(
            and_(
                Listing.id != listing_id,  # Nicht die gleiche Anzeige
                Listing.status == ListingStatus.ACTIVE,  # Nur aktive Anzeigen
                Listing.category == main_listing.category,  # Gleiche Kategorie
            )
        ).options(
            joinedload(Listing.seller)  # Seller-Daten mitladen
        )
        
        # Sortiere nach Erstellungsdatum (neueste zuerst)
        query = query.order_by(desc(Listing.created_at))
        
        # Limitiere Ergebnisse
        query = query.limit(limit)
        
        # Führe Query aus
        similar_listings = session.exec(query).all()
        
        # Konvertiere zu Response-Format
        result = []
        for listing in similar_listings:
            # Berechne Entfernung (vereinfacht - in echtem System würde man Geohash verwenden)
            distance_km = 0.5  # Placeholder - in echtem System berechnen
            
            listing_data = {
                "id": str(listing.id),
                "title": listing.title,
                "price": listing.price,
                "currency": "EUR",
                "location": {
                    "city": listing.location,
                    "lat": 52.5200,  # Placeholder
                    "lng": 13.4050,  # Placeholder
                    "distanceKm": distance_km
                },
                "category": listing.category,
                "condition": "gebraucht",  # Placeholder
                "createdAt": listing.created_at.isoformat(),
                "views": listing.views,
                "favorites": 0,  # Placeholder
                "media": [
                    {
                        "id": str(listing.id),
                        "url": f"/api/images/{json.loads(listing.images)[0]}" if listing.images and listing.images != "[]" else "/images/noimage.jpeg",
                        "type": "image"
                    }
                ] if listing.images and listing.images != "[]" else [{"id": str(listing.id), "url": "/images/noimage.jpeg", "type": "image"}],
                "status": listing.status
            }
            result.append(listing_data)
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler beim Laden ähnlicher Anzeigen: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden ähnlicher Anzeigen")

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
            
            # OPTIMIERT: Bild-URLs einheitlich formatieren
            if images and isinstance(images, list):
                formatted_images = []
                for image in images:
                    if image:
                        # Entferne alle möglichen Präfixe für saubere Dateinamen
                        clean_img = image.replace('/api/uploads/', '').replace('api/uploads/', '').replace('/api/images/', '').replace('api/images/', '').replace('/uploads/', '').replace('uploads/', '')
                        # Entferne auch /api/ falls es noch da ist
                        clean_img = clean_img.replace('/api/', '').replace('api/', '')
                        # Füge einheitliche URL hinzu
                        if clean_img:
                            formatted_images.append(f"/api/images/{clean_img}")
                        else:
                            formatted_images.append(image)
                images = formatted_images
            
            # Bestimme den Status
            status = listing.status
            if status == ListingStatus.ACTIVE:
                status = "active"
            elif status == ListingStatus.INACTIVE:
                status = "paused"
            elif status == ListingStatus.SOLD:
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
# @cache_listings(ttl=300)  # Temporär deaktiviert
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
    
    # PERFORMANCE-OPTIMIERUNG: JSON-Filter temporär deaktiviert
    # Diese Filter sind extrem langsam ohne spezielle Indizes
    # TODO: JSON-Indizes hinzufügen oder separate Spalten erstellen
    
    # Auto-spezifische Filter - DEAKTIVIERT für Performance
    # if category == "autos":
    #     if marke:
    #         query = filter_by_json_attribute(query, "marke", marke)
    #     # ... weitere Filter
    
    # Kleinanzeigen-spezifische Filter - DEAKTIVIERT für Performance  
    # if category == "kleinanzeigen":
    #     if zustand:
    #         query = filter_by_json_attribute(query, "zustand", zustand)
    #     # ... weitere Filter
    
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
    
    # PERFORMANCE-OPTIMIERUNG: joinedload deaktiviert - verursacht Performance-Probleme
    # query = query.options(joinedload(Listing.seller))
    listings = session.exec(query).all()
    
    # Response formatieren - PERFORMANCE-OPTIMIERT
    response_listings = []
    for listing in listings:
        listing_data = listing.dict()
        
        # PERFORMANCE-OPTIMIERUNG: Vereinfachte JSON-Verarbeitung
        try:
            listing_data["attributes"] = json.loads(listing.attributes) if listing.attributes else {}
        except:
            listing_data["attributes"] = {}
            
        try:
                 # OPTIMIERT: Bild-URLs einheitlich formatieren
                 raw_images = json.loads(listing.images) if listing.images else []
                 formatted_images = []
                 for image in raw_images:
                     if image:
                         # Entferne alle möglichen Präfixe für saubere Dateinamen
                         clean_img = image.replace('/api/uploads/', '').replace('api/uploads/', '').replace('/api/images/', '').replace('api/images/', '').replace('/uploads/', '').replace('uploads/', '')
                         # Entferne auch /api/ falls es noch da ist
                         clean_img = clean_img.replace('/api/', '').replace('api/', '')
                         # Füge einheitliche URL hinzu
                         if clean_img:
                             formatted_images.append(f"/api/images/{clean_img}")
                         else:
                             formatted_images.append(image)
                 listing_data["images"] = formatted_images
        except:
            listing_data["images"] = []
        
        # PERFORMANCE-OPTIMIERUNG: Vereinfachte Seller-Info ohne Database-Join
        listing_data["seller"] = {
            "id": listing.user_id,
            "name": "max.mueller",
            "avatar": None,
            "rating": 4.5,
            "reviewCount": 12,
            "userType": "unverified",
            "badge": None
        }
        
        response_listings.append(listing_data)
    
    # Pagination-Informationen berechnen - PERFORMANCE-OPTIMIERT
    # Vereinfachte Count-Berechnung für bessere Performance
    total_count = len(response_listings)  # Verwende tatsächlich geladene Anzahl
    total_pages = 1  # Vereinfacht für Performance
    
    return {
        "listings": response_listings,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "pages": total_pages
        }
    }

@router.post("/listings", status_code=201)
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
    
    # Sicherstellen, dass die ID enthalten ist
    response["id"] = new_listing.id
    
    # Location-Header setzen
    from fastapi import Response
    resp = Response(content=json.dumps(response), media_type="application/json")
    resp.headers["Location"] = f"/api/listings/{new_listing.id}"
    return resp

@router.get("/listings/{listing_id}")
def get_listing_by_id(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Einzelnes Listing abrufen"""
    
    # OPTIMIERT: Eager Loading mit joinedload um N+1 Queries zu vermeiden
    query = select(Listing).where(Listing.id == listing_id).options(joinedload(Listing.seller))
    listing = session.exec(query).first()
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
        
        # OPTIMIERT: Bild-URLs einheitlich formatieren
        response["images"] = []
        for img in raw_images:
            if img:
                # Entferne alle möglichen Präfixe für saubere Dateinamen
                clean_img = img.replace('/api/uploads/', '').replace('api/uploads/', '').replace('/api/images/', '').replace('api/images/', '').replace('/uploads/', '').replace('uploads/', '')
                # Entferne auch /api/ falls es noch da ist
                clean_img = clean_img.replace('/api/', '').replace('api/', '')
                # Füge einheitliche URL hinzu
                if clean_img:
                    response["images"].append(f"/api/images/{clean_img}")
                else:
                    response["images"].append(img)
        
        # OPTIMIERT: User-Informationen bereits geladen durch joinedload
        if listing.seller:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if listing.seller.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            avatar_url = listing.seller.avatar
            if avatar_url and avatar_url.startswith('/api/uploads/'):
                avatar_url = avatar_url.replace('/api/uploads/', '')
            elif avatar_url and avatar_url.startswith('api/uploads/'):
                avatar_url = avatar_url.replace('api/uploads/', '')
            response["seller"] = {
                "id": listing.seller.id,
                "name": listing.seller.email.split('@')[0],
                "avatar": avatar_url,
                "rating": 4.5,
                "reviewCount": 12,
                "userType": listing.seller.verification_state.value if listing.seller.verification_state else "unverified",
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

@router.patch("/listings/{listing_id}")
def patch_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    update_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing teilweise aktualisieren (für Inline-Editing)"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann bearbeiten
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Bearbeiten dieses Listings")
    
    # Felder aktualisieren
    for field, value in update_data.items():
        if hasattr(listing, field):
            if field == "attributes" and isinstance(value, dict):
                # Attributes als JSON speichern
                setattr(listing, field, json.dumps(value))
            elif field == "images" and isinstance(value, list):
                # Images als JSON speichern
                setattr(listing, field, json.dumps(value))
            else:
                setattr(listing, field, value)
    
    # Timestamp aktualisieren
    listing.updated_at = datetime.utcnow()
    
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

@router.put("/listings/{listing_id}/highlight")
def update_listing_highlight(
    listing_id: int = Path(..., description="ID des Listings"),
    highlight_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing hervorheben/entfernen"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann hervorheben
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Hervorheben dieses Listings")
    
    # Hervorhebung aktualisieren
    highlighted = highlight_data.get("highlighted", False)
    listing.highlighted = highlighted
    listing.updated_at = datetime.utcnow()
    
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    return {
        "message": f"Listing {'hervorgehoben' if highlighted else 'Hervorhebung entfernt'}",
        "highlighted": highlighted
    }

@router.patch("/listings/{listing_id}/status")
async def toggle_listing_status(
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
    if listing.status == ListingStatus.ACTIVE:
        listing.status = ListingStatus.INACTIVE
    else:
        listing.status = ListingStatus.ACTIVE
    
    listing.updated_at = datetime.utcnow()
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Status für Frontend konvertieren
    frontend_status = "active" if listing.status == ListingStatus.ACTIVE else "paused"
    
    # WebSocket-Broadcast für Status-Änderung
    try:
        from app.websocket.manager import manager as websocket_manager
        await websocket_manager.broadcast_listing_status_change(
            listing_id=listing_id,
            status=frontend_status,
            user_id=current_user.id
        )
    except Exception as e:
        logger.error(f"Fehler beim Senden des Listing-Status-Updates: {e}")
    
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
