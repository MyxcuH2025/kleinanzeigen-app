"""
Admin Categories and Attributes routes for the Kleinanzeigen API
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

# Router für Admin Categories-Endpoints
router = APIRouter(prefix="/api", tags=["admin-categories"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/admin/categories")
def create_category(
    name: str = Body(...),
    description: str = Body(""),
    slug: str = Body(""),
    icon: str = Body(""),
    is_active: bool = Body(True),
    parent_id: Optional[int] = Body(None),
    sort_order: int = Body(0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Kategorie erstellen (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Kategorien erstellen")
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "name": name,
        "description": description,
        "slug": slug,
        "icon": icon,
        "is_active": is_active,
        "parent_id": parent_id,
        "sort_order": sort_order,
        "created_at": datetime.utcnow().isoformat()
    }

@router.put("/admin/categories/{category_id}")
def update_category(
    category_id: int = Path(...),
    name: str = Body(...),
    description: str = Body(""),
    slug: str = Body(""),
    icon: str = Body(""),
    is_active: bool = Body(True),
    parent_id: Optional[int] = Body(None),
    sort_order: int = Body(0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Kategorie aktualisieren (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Kategorien aktualisieren")
    
    # Einfache Mock-Antwort
    return {
        "id": category_id,
        "name": name,
        "description": description,
        "slug": slug,
        "icon": icon,
        "is_active": is_active,
        "parent_id": parent_id,
        "sort_order": sort_order,
        "updated_at": datetime.utcnow().isoformat()
    }

@router.post("/admin/attributes")
def create_attribute(
    name: str = Body(...),
    label: str = Body(...),
    description: str = Body(""),
    field_type: str = Body("text"),
    is_required: bool = Body(False),
    is_filterable: bool = Body(True),
    validation_rules: Dict[str, Any] = Body({}),
    sort_order: int = Body(0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Attribut erstellen (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Attribute erstellen")
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "name": name,
        "label": label,
        "description": description,
        "field_type": field_type,
        "is_required": is_required,
        "is_filterable": is_filterable,
        "validation_rules": validation_rules,
        "sort_order": sort_order,
        "created_at": datetime.utcnow().isoformat()
    }

@router.post("/admin/attributes/{attribute_id}/options")
def create_attribute_option(
    attribute_id: int = Path(...),
    value: str = Body(...),
    label: str = Body(...),
    sort_order: int = Body(0),
    is_active: bool = Body(True),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Attribut-Option erstellen (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Attribut-Optionen erstellen")
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "attribute_id": attribute_id,
        "value": value,
        "label": label,
        "sort_order": sort_order,
        "is_active": is_active,
        "created_at": datetime.utcnow().isoformat()
    }

@router.post("/admin/categories/{category_id}/attributes")
def assign_attribute_to_category(
    category_id: int = Path(...),
    attribute_id: int = Body(...),
    is_required: bool = Body(False),
    sort_order: int = Body(0),
    is_active: bool = Body(True),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Attribut zu Kategorie zuweisen (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Attribute zu Kategorien zuweisen")
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "category_id": category_id,
        "attribute_id": attribute_id,
        "is_required": is_required,
        "sort_order": sort_order,
        "is_active": is_active,
        "created_at": datetime.utcnow().isoformat()
    }