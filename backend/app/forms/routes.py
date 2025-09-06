"""
Dynamic Forms routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    User, Listing
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

# Router für Forms-Endpoints
router = APIRouter(prefix="/api", tags=["forms"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/forms")
def create_form(
    name: str = Body(...),
    description: str = Body(""),
    fields: List[Dict[str, Any]] = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues dynamisches Formular erstellen"""
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "name": name,
        "description": description,
        "fields": fields,
        "created_by": current_user.id,
        "created_at": datetime.utcnow().isoformat()
    }

@router.get("/forms")
def get_forms(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Dynamische Formulare abrufen"""
    
    # Einfache Mock-Daten
    return {"forms": []}

@router.get("/forms/{form_id}")
def get_form_by_id(
    form_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Spezifisches Formular abrufen"""
    
    # Einfache Mock-Antwort
    return {
        "id": form_id,
        "name": "Beispiel-Formular",
        "description": "Ein Beispiel-Formular",
        "fields": [],
        "created_at": datetime.utcnow().isoformat()
    }

@router.put("/forms/{form_id}")
def update_form(
    form_id: int = Path(...),
    name: str = Body(...),
    description: str = Body(""),
    fields: List[Dict[str, Any]] = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Formular aktualisieren"""
    
    # Einfache Mock-Antwort
    return {
        "id": form_id,
        "name": name,
        "description": description,
        "fields": fields,
        "updated_at": datetime.utcnow().isoformat()
    }

@router.delete("/forms/{form_id}")
def delete_form(
    form_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Formular löschen"""
    
    return {"message": f"Formular {form_id} wurde gelöscht"}

@router.post("/forms/{form_id}/submissions")
def submit_form(
    form_id: int = Path(...),
    data: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Formular-Antwort einreichen"""
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "form_id": form_id,
        "data": data,
        "submitted_by": current_user.id,
        "submitted_at": datetime.utcnow().isoformat()
    }

@router.get("/forms/{form_id}/submissions")
def get_form_submissions(
    form_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Formular-Antworten abrufen"""
    
    # Einfache Mock-Daten
    return {"submissions": []}

@router.get("/dynamic/categories")
def get_dynamic_categories(session: Session = Depends(get_session)):
    """Dynamische Kategorien abrufen"""
    
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
                "id": hash(category) % 1000000,  # Einfache ID-Generierung
                "name": category,
                "slug": category.lower().replace(" ", "-"),
                "count": count,
                "is_active": True
            })
    
    return {"categories": result}

@router.get("/dynamic/categories/{category_id}")
def get_dynamic_category_by_id(
    category_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Spezifische dynamische Kategorie abrufen"""
    
    # Kategorie-Statistiken
    categories = session.exec(
        select(Listing.category, func.count(Listing.id))
        .where(Listing.status == "ACTIVE")
        .group_by(Listing.category)
    ).all()
    
    for category, count in categories:
        if hash(category) % 1000000 == category_id:
            return {
                "id": category_id,
                "name": category,
                "slug": category.lower().replace(" ", "-"),
                "count": count,
                "is_active": True
            }
    
    raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")

@router.get("/dynamic/attributes")
def get_dynamic_attributes(session: Session = Depends(get_session)):
    """Dynamische Attribute abrufen"""
    
    # Attribute aus Listings extrahieren
    listings = session.exec(
        select(Listing.attributes)
        .where(Listing.status == "ACTIVE", Listing.attributes.isnot(None))
    ).all()
    
    all_attributes = {}
    for listing in listings:
        try:
            attrs = json.loads(listing.attributes)
            for key, value in attrs.items():
                if key not in all_attributes:
                    all_attributes[key] = {
                        "name": key,
                        "type": "text",
                        "options": [],
                        "count": 0
                    }
                all_attributes[key]["count"] += 1
                
                # Optionen sammeln
                if isinstance(value, str) and value not in all_attributes[key]["options"]:
                    all_attributes[key]["options"].append(value)
        except:
            continue
    
    result = []
    for attr_name, attr_data in all_attributes.items():
        result.append({
            "id": hash(attr_name) % 1000000,
            "name": attr_name,
            "type": attr_data["type"],
            "options": attr_data["options"][:10],  # Max 10 Optionen
            "count": attr_data["count"]
        })
    
    return {"attributes": result}

@router.get("/dynamic/forms/{category_id}")
def get_category_form_schema(
    category_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Formular-Schema für Kategorie abrufen"""
    
    # Kategorie finden
    categories = session.exec(
        select(Listing.category, func.count(Listing.id))
        .where(Listing.status == "ACTIVE")
        .group_by(Listing.category)
    ).all()
    
    category_name = None
    for category, count in categories:
        if hash(category) % 1000000 == category_id:
            category_name = category
            break
    
    if not category_name:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    # Formular-Schema basierend auf Kategorie erstellen
    schema = {
        "category_id": category_id,
        "category_name": category_name,
        "fields": [
            {
                "name": "title",
                "label": "Titel",
                "type": "text",
                "required": True,
                "placeholder": "Geben Sie einen aussagekräftigen Titel ein"
            },
            {
                "name": "description",
                "label": "Beschreibung",
                "type": "textarea",
                "required": True,
                "placeholder": "Beschreiben Sie Ihr Angebot detailliert"
            },
            {
                "name": "price",
                "label": "Preis",
                "type": "number",
                "required": True,
                "placeholder": "0.00"
            },
            {
                "name": "condition",
                "label": "Zustand",
                "type": "select",
                "required": True,
                "options": ["Neu", "Sehr gut", "Gut", "Befriedigend", "Ausreichend"]
            },
            {
                "name": "location",
                "label": "Standort",
                "type": "text",
                "required": True,
                "placeholder": "Stadt, PLZ"
            }
        ]
    }
    
    # Kategorie-spezifische Felder hinzufügen
    if "auto" in category_name.lower():
        schema["fields"].append({
            "name": "mileage",
            "label": "Kilometerstand",
            "type": "number",
            "required": False,
            "placeholder": "0"
        })
        schema["fields"].append({
            "name": "year",
            "label": "Baujahr",
            "type": "number",
            "required": False,
            "placeholder": "2020"
        })
    
    return schema

@router.post("/dynamic/validate-attributes")
def validate_listing_attributes(
    attributes: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session)
):
    """Listing-Attribute validieren"""
    
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "suggestions": []
    }
    
    # Titel validieren
    if "title" in attributes:
        title = attributes["title"]
        if not title or len(title.strip()) < 5:
            validation_result["errors"].append("Titel muss mindestens 5 Zeichen lang sein")
            validation_result["valid"] = False
        elif len(title) > 100:
            validation_result["warnings"].append("Titel ist sehr lang (>100 Zeichen)")
    
    # Beschreibung validieren
    if "description" in attributes:
        description = attributes["description"]
        if not description or len(description.strip()) < 20:
            validation_result["errors"].append("Beschreibung muss mindestens 20 Zeichen lang sein")
            validation_result["valid"] = False
        elif len(description) > 2000:
            validation_result["warnings"].append("Beschreibung ist sehr lang (>2000 Zeichen)")
    
    # Preis validieren
    if "price" in attributes:
        try:
            price = float(attributes["price"])
            if price < 0:
                validation_result["errors"].append("Preis darf nicht negativ sein")
                validation_result["valid"] = False
            elif price > 1000000:
                validation_result["warnings"].append("Preis ist sehr hoch (>1.000.000€)")
        except (ValueError, TypeError):
            validation_result["errors"].append("Preis muss eine gültige Zahl sein")
            validation_result["valid"] = False
    
    # Standort validieren
    if "location" in attributes:
        location = attributes["location"]
        if not location or len(location.strip()) < 2:
            validation_result["errors"].append("Standort muss mindestens 2 Zeichen lang sein")
            validation_result["valid"] = False
    
    # Vorschläge hinzufügen
    if validation_result["valid"]:
        validation_result["suggestions"].append("Alle Felder sind korrekt ausgefüllt")
        validation_result["suggestions"].append("Fügen Sie hochwertige Bilder hinzu")
        validation_result["suggestions"].append("Verwenden Sie aussagekräftige Schlüsselwörter")
    
    return validation_result