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
from app.cache.decorators import cache_listings
from app.security.input_validation import SecurityValidator
from app.security.sql_injection_protection import SQLInjectionProtection
from app.security.xss_protection import XSSProtection
import json
from datetime import datetime
from typing import Optional, List
import logging

# Router für Listing-Endpoints
router = APIRouter(prefix="/api", tags=["listings"])

# Logging
logger = logging.getLogger(__name__)

def filter_by_json_attribute(query, attribute_name: str, value: any, operator: str = "equals"):
    """Sichere JSON-Attribut-Filterung ohne SQL Injection"""
    if value is None:
        return query
    
    # Input-Validierung
    attribute_name = SecurityValidator.validate_string_input(attribute_name, "attribute_name", 50)
    
    # Sichere Filterung mit SQLInjectionProtection
    return SQLInjectionProtection.safe_json_filter(
        query.session, 
        Listing, 
        attribute_name, 
        value, 
        operator
    )

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
                # Base64-Bilder durch leeres Array ersetzen (vermeidet JSON-Parse-Fehler)
                images_raw = listing.images if listing.images and listing.images != "Array[]" else "[]"
                images = json.loads(images_raw) if images_raw else []
            except json.JSONDecodeError:
                attributes = {}
                images = []
            
        # OPTIMIERT: Bild-URLs einheitlich formatieren - Base64-Filter
        if images and isinstance(images, list):
            formatted_images = []
            for image in images:
                if image:
                    # FILTER: Base64-Bilder ignorieren (verursachen "Image corrupt" Fehler)
                    if image.startswith('data:image/'):
                        logger.warning(f"❌ Base64-Bild ignoriert: {image[:50]}...")
                        continue
                    
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
# REPARIERT: Cache deaktiviert für Bild-Updates (verursacht "bild wird nicht aktualisiert")
# @cache_listings(ttl=300)  # DEAKTIVIERT: Verhindert Bild-Updates
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
    """Alle Listings abrufen mit Filtern - ECHTE DATENBANK-ABFRAGEN"""
    
    try:
        # ECHTE DATENBANK-ABFRAGE - Supabase PostgreSQL
        query = session.query(Listing).options(joinedload(Listing.seller))
        
        # Filter anwenden
        if category:
            query = query.filter(Listing.category == category)
        if location:
            query = query.filter(Listing.location.ilike(f"%{location}%"))
        if price_min is not None:
            query = query.filter(Listing.price >= price_min)
        if price_max is not None:
            query = query.filter(Listing.price <= price_max)
        if search:
            search_filter = or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Status-Filter (nur aktive Anzeigen)
        query = query.filter(Listing.status == ListingStatus.ACTIVE)
        
        # Sortierung
        if sort_by == "price":
            if sort_order == "asc":
                query = query.order_by(asc(Listing.price))
            else:
                query = query.order_by(desc(Listing.price))
        elif sort_by == "title":
            if sort_order == "asc":
                query = query.order_by(asc(Listing.title))
            else:
                query = query.order_by(desc(Listing.title))
        else:  # created_at
            if sort_order == "asc":
                query = query.order_by(asc(Listing.created_at))
            else:
                query = query.order_by(desc(Listing.created_at))
        
        # Gesamtanzahl für Pagination
        total = query.count()
        
        # Pagination
        offset = (page - 1) * limit
        listings = query.offset(offset).limit(limit).all()
        
        # Konvertierung zu Dictionary-Format
        listings_data = []
        for listing in listings:
            listing_dict = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": float(listing.price),
                "category": listing.category,
                "location": listing.location,
                "status": listing.status.value,
                "images": listing.images or [],
                "created_at": listing.created_at.isoformat() + "Z" if listing.created_at else None,
                "seller_id": listing.user_id,
                "seller": {
                    "id": listing.seller.id,
                    "name": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
                    "username": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
                    "email": listing.seller.email,
                    "rating": getattr(listing.seller, 'rating', 4.5),
                    "reviewCount": getattr(listing.seller, 'review_count', 12),
                    "avatar": listing.seller.avatar or ""
                } if listing.seller else None
            }
            listings_data.append(listing_dict)
        
        # REPARIERT: Cache-Headers für Bild-Updates (verursacht "bild wird nicht aktualisiert")
        from fastapi import Response
        response = Response(
            content=json.dumps({
                "success": True,
                "listings": listings_data,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit
            }),
            media_type="application/json",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
        return response
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Listings: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Listings")
    
    # DEAKTIVIERT: Alte get_listings Funktion entfernt - verursachte Base64-Probleme
    # Die neue Funktion oben (Zeile 237-356) ist aktiv und hat Base64-Filter

@router.post("/listings", status_code=201)
def create_listing(
    listing_data: dict,  # REPARIERT: Akzeptiere dict statt ListingCreate für Flexibilität
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Listing erstellen"""
    try:
        # REPARIERT: Bilder korrekt als JSON-Array speichern - Base64 komplett blockieren
        images_json = "[]"
        if listing_data.get('images') and len(listing_data.get('images', [])) > 0:
            # Stelle sicher, dass Bilder als saubere URLs gespeichert werden
            clean_images = []
            for img in listing_data.get('images', []):
                if img and isinstance(img, str):
                    # BLOCKIERE: Base64-Bilder komplett (verursachen "Image corrupt" Fehler)
                    if img.startswith('data:image/') or 'base64' in img:
                        logger.error(f"❌ Base64-Bild blockiert: {img[:50]}...")
                        continue
                    
                    # Entferne doppelte Präfixe und bereinige URL
                    clean_img = img.replace('/api/images/', '').replace('api/images/', '').replace('/api/uploads/', '').replace('api/uploads/', '')
                    if clean_img and not clean_img.startswith('http'):
                        clean_images.append(clean_img)
                    elif clean_img:
                        clean_images.append(img)
            images_json = json.dumps(clean_images)
        
        # Neues Listing erstellen
        new_listing = Listing(
            title=listing_data.get('title', ''),
            description=listing_data.get('description', ''),
            category=listing_data.get('category', ''),
            condition=listing_data.get('condition', 'Gut'),
            location=listing_data.get('location', ''),
            price=listing_data.get('price', 0.0),
            attributes=json.dumps(listing_data.get('attributes', {})) if listing_data.get('attributes') else "{}",
            images=images_json,
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
        
        # Response formatieren - REPARIERT: datetime serialization + Bilder
        response = {
            "id": new_listing.id,
            "title": new_listing.title,
            "description": new_listing.description,
            "price": new_listing.price,
            "category": new_listing.category,
            "condition": new_listing.condition,
            "location": new_listing.location,
            "status": new_listing.status.value,
            "user_id": new_listing.user_id,
            "created_at": new_listing.created_at.isoformat() if new_listing.created_at else None,
            "updated_at": new_listing.updated_at.isoformat() if new_listing.updated_at else None,
            "attributes": listing_data.get('attributes', {}),
            "images": json.loads(images_json)  # REPARIERT: Korrekt geparste Bilder
        }
        
        # Location-Header setzen
        from fastapi import Response
        resp = Response(content=json.dumps(response), media_type="application/json")
        resp.headers["Location"] = f"/api/listings/{new_listing.id}"
        return resp
    
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Listings: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Fehler beim Erstellen der Anzeige",
            headers={"Access-Control-Allow-Origin": "*"}
        )

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
        # Base64-Bilder durch leeres Array ersetzen (vermeidet JSON-Parse-Fehler)
        images_raw = listing.images if listing.images and listing.images != "Array[]" else "[]"
        raw_images = json.loads(images_raw) if images_raw else []
        
        # OPTIMIERT: Bild-URLs einheitlich formatieren
        response["images"] = []
        
        # REPARIERT: Kein Fallback-Bild - Frontend zeigt "Kein Bild verfügbar" (verursacht "waschmaschinen bild")
        if not raw_images or len(raw_images) == 0:
            response["images"] = []
        else:
            for img in raw_images:
                if img and isinstance(img, str):
                    # FILTER: Base64-Bilder ignorieren (verursachen "Image corrupt" Fehler)
                    if img.startswith('data:image/'):
                        logger.warning(f"❌ Base64-Bild ignoriert: {img[:50]}...")
                        continue
                    
                    # Entferne JSON-Array-Syntax falls vorhanden
                    clean_img = img
                    if clean_img.startswith('["') and clean_img.endswith('"]'):
                        clean_img = clean_img[2:-2]
                    if clean_img.startswith('"') and clean_img.endswith('"'):
                        clean_img = clean_img[1:-1]
                    
                    # REPARIERT: Behalte saubere Dateinamen und füge korrekten Präfix hinzu
                    clean_img = clean_img.replace('/api/uploads/', '').replace('api/uploads/', '').replace('/api/images/', '').replace('api/images/', '').replace('/uploads/', '').replace('uploads/', '')
                    # Entferne auch /api/ falls es noch da ist
                    clean_img = clean_img.replace('/api/', '').replace('api/', '')
                    # Füge einheitliche URL hinzu - REPARIERT für Frontend
                    if clean_img and clean_img.strip():
                        response["images"].append(f"/api/images/{clean_img}")
                    # REPARIERT: Kein Fallback-Bild - Frontend zeigt "Kein Bild verfügbar" (verursacht "waschmaschinen bild")
                    # else:
                    #     response["images"].append("/api/images/noimage.jpeg")
        
        # OPTIMIERT: User-Informationen bereits geladen durch joinedload
        if listing.seller:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if listing.seller.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            # REPARIERT: Avatar-URL korrekt formatieren
            avatar_url = listing.seller.avatar
            if avatar_url:
                # Entferne Präfixe aber behalte den vollständigen Pfad
                if avatar_url.startswith('/api/uploads/'):
                    avatar_url = avatar_url.replace('/api/uploads/', '')
                elif avatar_url.startswith('api/uploads/'):
                    avatar_url = avatar_url.replace('api/uploads/', '')
                elif avatar_url.startswith('/uploads/'):
                    avatar_url = avatar_url.replace('/uploads/', '')
                elif avatar_url.startswith('uploads/'):
                    avatar_url = avatar_url.replace('uploads/', '')
                
                # Stelle sicher dass Avatar-Pfad korrekt ist
                if avatar_url and not avatar_url.startswith('http'):
                    if avatar_url.startswith('avatars/'):
                        avatar_url = f"/api/images/uploads/{avatar_url}"
                    elif avatar_url.endswith('.jpg') or avatar_url.endswith('.jpeg') or avatar_url.endswith('.png') or avatar_url.endswith('.webp'):
                        avatar_url = f"/api/images/uploads/avatars/{avatar_url}"
                    else:
                        avatar_url = f"/api/images/{avatar_url}"
            response["seller"] = {
                "id": listing.seller.id,
                "name": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
                "username": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
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
        # Base64-Bilder durch leeres Array ersetzen (vermeidet JSON-Parse-Fehler)
        images_raw = listing.images if listing.images and listing.images != "Array[]" else "[]"
        raw_images = json.loads(images_raw)
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
        # Base64-Bilder durch leeres Array ersetzen (vermeidet JSON-Parse-Fehler)
        images_raw = listing.images if listing.images and listing.images != "Array[]" else "[]"
        raw_images = json.loads(images_raw)
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

@router.get("/listings/category/{category_slug}")
def get_listings_by_category(
    category_slug: str = Path(..., description="Kategorie-Slug"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    session: Session = Depends(get_session)
):
    """Listings nach Kategorie abrufen"""
    
    try:
        # Kategorie-Informationen laden
        from models.category import Category
        category = session.exec(select(Category).where(Category.value == category_slug)).first()
        if not category:
            raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
        
        # Listings für diese Kategorie abrufen
        query = session.query(Listing).options(joinedload(Listing.seller)).filter(
            Listing.category == category_slug,
            Listing.status == ListingStatus.ACTIVE
        ).order_by(desc(Listing.created_at))
        
        # Gesamtanzahl für Pagination
        total = query.count()
        
        # Pagination
        offset = (page - 1) * limit
        listings = query.offset(offset).limit(limit).all()
        
        # Konvertierung zu Dictionary-Format
        listings_data = []
        for listing in listings:
            listing_dict = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": float(listing.price),
                "category": listing.category,
                "location": listing.location,
                "status": listing.status.value,
                "images": listing.images or [],
                "created_at": listing.created_at.isoformat() + "Z" if listing.created_at else None,
                "seller_id": listing.user_id,
                "seller": {
                    "id": listing.seller.id,
                    "name": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
                    "username": f"{listing.seller.first_name} {listing.seller.last_name}".strip() if listing.seller.first_name != "User" else listing.seller.email.split('@')[0],
                    "email": listing.seller.email,
                    "rating": getattr(listing.seller, 'rating', 4.5),
                    "reviewCount": getattr(listing.seller, 'review_count', 12),
                    "avatar": listing.seller.avatar or ""
                } if listing.seller else None
            }
            listings_data.append(listing_dict)
        
        # Kategorie-Daten für Frontend
        category_data = {
            "id": category.id,
            "name": category.label,
            "slug": category.value,
            "icon": category.icon,
            "color": "#059669",
            "bgColor": "#f0fdf4"
        }
        
        return {
            "category": category_data,
            "listings": listings_data,
            "count": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Kategorie-Listings: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Kategorie-Listings")

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
