"""
Categories and Locations routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from sqlmodel import Session, select, func
from models import (
    Listing, User, Category, Subcategory, CategoryItem,
    CategoryResponse, SubcategoryResponse, CategoryWithSubcategories
)
from app.dependencies import get_session
from typing import Optional, List
from datetime import datetime
import json

# Router für Categories-Endpoints
router = APIRouter(prefix="/api", tags=["categories"])

# ============================================================================
# NEUE CATEGORY-ENDPOINTS
# ============================================================================

@router.get("/categories/all", response_model=List[CategoryWithSubcategories])
def get_all_categories(session: Session = Depends(get_session)):
    """Alle Hauptkategorien mit Unterkategorien abrufen"""
    categories = session.exec(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order, Category.label)
    ).all()
    
    result = []
    for category in categories:
        subcategories = session.exec(
            select(Subcategory)
            .where(Subcategory.category_id == category.id, Subcategory.is_active == True)
            .order_by(Subcategory.sort_order, Subcategory.label)
        ).all()
        
        result.append(CategoryWithSubcategories(
            id=category.id,
            value=category.value,
            label=category.label,
            icon=category.icon,
            description=category.description,
            is_active=category.is_active,
            sort_order=category.sort_order,
            created_at=category.created_at,
            updated_at=category.updated_at,
            subcategories=[
                SubcategoryResponse(
                    id=sub.id,
                    category_id=sub.category_id,
                    value=sub.value,
                    label=sub.label,
                    icon=sub.icon,
                    description=sub.description,
                    is_active=sub.is_active,
                    sort_order=sub.sort_order,
                    created_at=sub.created_at,
                    updated_at=sub.updated_at
                )
                for sub in subcategories
            ]
        ))
    
    return result

@router.get("/categories/{category_value}", response_model=CategoryWithSubcategories)
def get_category_by_value(
    category_value: str = Path(..., description="Category value (z.B. 'auto-rad-boot')"),
    session: Session = Depends(get_session)
):
    """Spezifische Kategorie mit Unterkategorien abrufen"""
    category = session.exec(
        select(Category).where(Category.value == category_value, Category.is_active == True)
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    subcategories = session.exec(
        select(Subcategory)
        .where(Subcategory.category_id == category.id, Subcategory.is_active == True)
        .order_by(Subcategory.sort_order, Subcategory.label)
    ).all()
    
    return CategoryWithSubcategories(
        id=category.id,
        value=category.value,
        label=category.label,
        icon=category.icon,
        description=category.description,
        is_active=category.is_active,
        sort_order=category.sort_order,
        created_at=category.created_at,
        updated_at=category.updated_at,
        subcategories=[
            SubcategoryResponse(
                id=sub.id,
                category_id=sub.category_id,
                value=sub.value,
                label=sub.label,
                icon=sub.icon,
                description=sub.description,
                is_active=sub.is_active,
                sort_order=sub.sort_order,
                created_at=sub.created_at,
                updated_at=sub.updated_at
            )
            for sub in subcategories
        ]
    )

@router.get("/categories/{category_value}/subcategories", response_model=List[SubcategoryResponse])
def get_subcategories_by_category(
    category_value: str = Path(..., description="Category value"),
    session: Session = Depends(get_session)
):
    """Unterkategorien einer Hauptkategorie abrufen"""
    category = session.exec(
        select(Category).where(Category.value == category_value, Category.is_active == True)
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    subcategories = session.exec(
        select(Subcategory)
        .where(Subcategory.category_id == category.id, Subcategory.is_active == True)
        .order_by(Subcategory.sort_order, Subcategory.label)
    ).all()
    
    return [
        SubcategoryResponse(
            id=sub.id,
            category_id=sub.category_id,
            value=sub.value,
            label=sub.label,
            icon=sub.icon,
            description=sub.description,
            is_active=sub.is_active,
            sort_order=sub.sort_order,
            created_at=sub.created_at,
            updated_at=sub.updated_at
        )
        for sub in subcategories
    ]

@router.get("/listings/category/{category_value}")
def get_listings_by_category(
    category_value: str = Path(..., description="Category value"),
    limit: int = Query(20, description="Anzahl der Listings pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    session: Session = Depends(get_session)
):
    """Listings nach Kategorie abrufen (unterstützt Hauptkategorien und Unterkategorien)"""
    
    # Mapping für Unterkategorien zu Hauptkategorien
    subcategory_mapping = {
        "möbel": "home-garden",
        "autos": "auto-rad-boot",
        "handy-telefon": "elektronik",
        "notebooks": "elektronik",
        "pcs": "elektronik",
        "tablets": "elektronik",
        "audio-hifi": "elektronik",
        "tv-video": "elektronik",
        "foto": "elektronik",
        "konsolen": "elektronik",
        "videospiele": "elektronik",
        "elektronik-haushaltsgeraete": "elektronik",
        "pc-zubehoer": "elektronik",
        "dienstleistungen-elektronik": "elektronik",
        "weitere-elektronik": "elektronik",
        "wohnungen": "real-estate",
        "haeuser": "real-estate",
        "gewerbeimmobilien": "real-estate",
        "grundstuecke": "real-estate",
        "ich-suche-arbeit": "jobs",
        "ich-suche-mitarbeiter": "jobs",
        "altenpflege": "services",
        "auto-rad-boot-services": "services",
        "babysitter-kinderbetreuung": "services",
        "elektronik-services": "services",
        "haus-garten-services": "services",
        "kuenstler-musiker": "services",
        "reise-event": "services",
        "tierbetreuung-training": "services",
        "umzug-transport": "services",
        "weitere-dienstleistungen": "services",
        "clothing": "personal-items",
        "jewelry": "personal-items",
        "beauty": "personal-items",
        "haushaltsgeraete": "home-garden",
        "garten-pflanzen": "home-garden",
        "kueche-haushalt": "home-garden",
        "sport-fitness": "freizeit-hobby",
        "musik-instrumente": "freizeit-hobby",
        "sammeln": "freizeit-hobby",
        "outdoor": "freizeit-hobby",
        "nachbarschaft": "freizeit-hobby",
        "baby": "familie-kind-baby",
        "kind": "familie-kind-baby",
        "schwangerschaft": "familie-kind-baby",
        "damenmode": "mode-beauty",
        "herrenmode": "mode-beauty",
        "schuhe": "mode-beauty",
        "accessoires": "mode-beauty",
        "hunde": "haustiere",
        "katzen": "haustiere",
        "andere-tiere": "haustiere",
        "tierzubehoer": "haustiere",
        "konzerte": "eintrittskarten-tickets",
        "sport": "eintrittskarten-tickets",
        "theater": "eintrittskarten-tickets",
        "veranstaltungen": "eintrittskarten-tickets",
        "buecher": "musik-filme-buecher",
        "musik": "musik-filme-buecher",
        "filme-serien": "musik-filme-buecher",
        "zeitschriften": "musik-filme-buecher",
        "verschenken": "verschenken-tauschen",
        "tauschen": "verschenken-tauschen",
        "sprachen": "unterricht-kurse",
        "musik": "unterricht-kurse",
        "sport": "unterricht-kurse",
        "computer": "unterricht-kurse"
    }
    
    # Bestimme die Hauptkategorie
    main_category = subcategory_mapping.get(category_value, category_value)
    
    # Prüfen ob Hauptkategorie existiert
    category = session.exec(
        select(Category).where(Category.value == main_category, Category.is_active == True)
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    # Listings abrufen (nur nach category string, da category_id noch nicht existiert)
    listings = session.exec(
        select(Listing)
        .where(
            Listing.category == category.value,
            Listing.status == "ACTIVE"
        )
        .order_by(Listing.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    
    return {
        "category": {
            "id": category.id,
            "value": category.value,
            "label": category.label,
            "icon": category.icon,
            "description": category.description
        },
        "listings": [
            {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price,
                "category": listing.category,
                "condition": listing.condition,
                "location": listing.location,
                "images": [img.replace('/api/uploads/', '').replace('api/uploads/', '') for img in (json.loads(listing.images) if listing.images else []) if img],
                "status": listing.status,
                "views": listing.views,
                "created_at": listing.created_at,
                "updated_at": listing.updated_at,
                "user_id": listing.user_id
            }
            for listing in listings
        ],
        "pagination": {
            "total": len(listings),
            "limit": limit,
            "offset": offset,
            "has_more": len(listings) >= limit
        }
    }

# ============================================================================
# BESTEHENDE ENDPOINTS (für Backward-Compatibility)
# ============================================================================

@router.get("/categories")
def get_categories(session: Session = Depends(get_session)):
    """Alle verfügbaren Kategorien abrufen"""
    
    # Kategorien aus Listings extrahieren
    categories = session.exec(
        select(Listing.category, func.count(Listing.id))
        .where(Listing.status == "ACTIVE")
        .group_by(Listing.category)
        .order_by(func.count(Listing.id).desc())
    ).all()
    
    result = []
    for category, count in categories:
        if category:
            result.append({
                "name": category,
                "slug": category.lower().replace(" ", "-"),
                "count": count,
                "icon": "📦" if category == "kleinanzeigen" else "🚗"
            })
    
    return {"categories": result}

@router.get("/categories/{theme}")
def get_category_details(
    theme: str,
    session: Session = Depends(get_session)
):
    """Kategorien für ein spezifisches Theme abrufen (kleinanzeigen oder autos)"""
    
    # Kategorien aus Listings extrahieren basierend auf Theme
    if theme == "kleinanzeigen":
        # Für Kleinanzeigen: alle Kategorien außer Autos
        categories = session.exec(
            select(Listing.category, func.count(Listing.id))
            .where(
                Listing.status == "ACTIVE",
                Listing.category.isnot(None),
                Listing.category.notin_(["autos", "motorräder", "auto teile", "zubehör", "reifen"])
            )
            .group_by(Listing.category)
            .order_by(func.count(Listing.id).desc())
        ).all()
    elif theme == "autos":
        # Für Autos: nur Auto-bezogene Kategorien
        categories = session.exec(
            select(Listing.category, func.count(Listing.id))
            .where(
                Listing.status == "ACTIVE",
                Listing.category.isnot(None),
                Listing.category.in_(["autos", "motorräder", "auto teile", "zubehör", "reifen"])
            )
            .group_by(Listing.category)
            .order_by(func.count(Listing.id).desc())
        ).all()
    else:
        # Fallback: alle Kategorien
        categories = session.exec(
            select(Listing.category, func.count(Listing.id))
            .where(Listing.status == "ACTIVE", Listing.category.isnot(None))
            .group_by(Listing.category)
            .order_by(func.count(Listing.id).desc())
        ).all()
    
    result = []
    for i, (category, count) in enumerate(categories):
        if category:
            result.append({
                "id": i + 1,
                "name": category,
                "slug": category.lower().replace(" ", "-"),
                "count": count,
                "icon": "🚗" if theme == "autos" else "📦",
                "color": "#059669",
                "bgColor": "#f0fdf4"
            })
    
    return {"categories": result}

@router.get("/locations")
def get_locations(
    search: Optional[str] = Query(None, description="Suche nach Standort"),
    limit: int = Query(50, description="Anzahl der Standorte"),
    session: Session = Depends(get_session)
):
    """Alle verfügbaren Standorte abrufen"""
    
    query = select(Listing.location, func.count(Listing.id))
    query = query.where(Listing.status == "ACTIVE", Listing.location.isnot(None))
    
    if search:
        query = query.where(Listing.location.contains(search))
    
    locations = session.exec(
        query.group_by(Listing.location)
        .order_by(func.count(Listing.id).desc())
        .limit(limit)
    ).all()
    
    result = []
    for location, count in locations:
        if location:
            result.append({
                "name": location,
                "count": count
            })
    
    return {"locations": result}

@router.get("/price-options")
def get_price_options(session: Session = Depends(get_session)):
    """Preis-Optionen für Filter abrufen"""
    
    # Preis-Statistiken
    price_stats = session.exec(
        select(func.min(Listing.price), func.max(Listing.price))
        .where(Listing.status == "ACTIVE", Listing.price.isnot(None))
    ).first()
    
    min_price = price_stats[0] if price_stats[0] else 0
    max_price = price_stats[1] if price_stats[1] else 10000
    
    # Preis-Bereiche definieren
    price_ranges = [
        {"label": "Bis 50€", "min": 0, "max": 50},
        {"label": "50€ - 100€", "min": 50, "max": 100},
        {"label": "100€ - 500€", "min": 100, "max": 500},
        {"label": "500€ - 1000€", "min": 500, "max": 1000},
        {"label": "1000€ - 5000€", "min": 1000, "max": 5000},
        {"label": "Über 5000€", "min": 5000, "max": None}
    ]
    
    return {
        "price_ranges": price_ranges,
        "min_price": min_price,
        "max_price": max_price
    }

@router.get("/conditions")
def get_conditions(session: Session = Depends(get_session)):
    """Alle verfügbaren Zustände abrufen"""
    
    conditions = session.exec(
        select(Listing.condition, func.count(Listing.id))
        .where(Listing.status == "ACTIVE", Listing.condition.isnot(None))
        .group_by(Listing.condition)
        .order_by(func.count(Listing.id).desc())
    ).all()
    
    result = []
    for condition, count in conditions:
        if condition:
            result.append({
                "name": condition,
                "count": count
            })
    
    return {"conditions": result}

@router.get("/car-data")
def get_car_data(session: Session = Depends(get_session)):
    """Auto-spezifische Daten für Dropdowns abrufen"""
    
    # Auto-Kategorie finden
    auto_category = session.exec(
        select(Category).where(Category.value == "auto-rad-boot", Category.is_active == True)
    ).first()
    
    if not auto_category:
        raise HTTPException(status_code=404, detail="Auto-Kategorie nicht gefunden")
    
    # Auto-Unterkategorie finden
    auto_subcategory = session.exec(
        select(Subcategory).where(
            Subcategory.category_id == auto_category.id, 
            Subcategory.value == "autos",
            Subcategory.is_active == True
        )
    ).first()
    
    if not auto_subcategory:
        raise HTTPException(status_code=404, detail="Auto-Unterkategorie nicht gefunden")
    
    # Auto-Marken abrufen
    car_brands = session.exec(
        select(CategoryItem)
        .where(
            CategoryItem.subcategory_id == auto_subcategory.id,
            CategoryItem.is_active == True
        )
        .order_by(CategoryItem.sort_order, CategoryItem.label)
    ).all()
    
    # Weitere Auto-Unterkategorien für Fahrzeugtypen
    vehicle_types = session.exec(
        select(Subcategory)
        .where(
            Subcategory.category_id == auto_category.id,
            Subcategory.is_active == True
        )
        .order_by(Subcategory.sort_order, Subcategory.label)
    ).all()
    
    # Kraftstoff-Typen (statisch definiert)
    fuel_types = [
        {"value": "benzin", "label": "Benzin"},
        {"value": "diesel", "label": "Diesel"},
        {"value": "elektro", "label": "Elektro"},
        {"value": "hybrid", "label": "Hybrid"},
        {"value": "gas", "label": "Gas (LPG/CNG)"},
        {"value": "wasserstoff", "label": "Wasserstoff"}
    ]
    
    # Getriebe-Typen (statisch definiert)
    transmission_types = [
        {"value": "manuell", "label": "Manuell"},
        {"value": "automatik", "label": "Automatik"},
        {"value": "halbautomatik", "label": "Halbautomatik"}
    ]
    
    # Erstzulassung-Jahre (dynamisch basierend auf aktuellen Listings)
    current_year = datetime.now().year
    registration_years = []
    for year in range(current_year, current_year - 30, -1):
        registration_years.append({"value": str(year), "label": str(year)})
    
    return {
        "brands": [
            {
                "value": brand.value,
                "label": brand.label
            }
            for brand in car_brands
        ],
        "vehicle_types": [
            {
                "value": vt.value,
                "label": vt.label,
                "icon": vt.icon
            }
            for vt in vehicle_types
        ],
        "fuel_types": fuel_types,
        "transmission_types": transmission_types,
        "registration_years": registration_years,
        "price_ranges": [
            {"value": "0-5000", "label": "Bis 5.000€"},
            {"value": "5000-10000", "label": "5.000€ - 10.000€"},
            {"value": "10000-20000", "label": "10.000€ - 20.000€"},
            {"value": "20000-50000", "label": "20.000€ - 50.000€"},
            {"value": "50000-100000", "label": "50.000€ - 100.000€"},
            {"value": "100000+", "label": "Über 100.000€"}
        ]
    }