"""
Reports and Ratings routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    User, Listing
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime
from typing import Optional, List
import logging

# Router für Reports-Endpoints
router = APIRouter(prefix="/api", tags=["reports"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/reports")
def create_report(
    listing_id: int = Body(...),
    reason: str = Body(...),
    description: str = Body(""),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neuen Report erstellen"""
    
    # Listing prüfen
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Einfacher Report (ohne Report-Model)
    return {
        "id": 1,
        "reporter_id": current_user.id,
        "listing_id": listing_id,
        "reason": reason,
        "description": description,
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat()
    }

@router.get("/reports")
def get_reports(
    status: Optional[str] = Query(None, description="Report-Status filtern"),
    limit: int = Query(20, description="Anzahl der Reports pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reports abrufen (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Reports einsehen")
    
    # Einfache Mock-Daten (ohne Report-Model)
    return {"reports": []}

@router.put("/reports/{report_id}/status")
def update_report_status(
    report_id: int = Path(...),
    new_status: str = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Report-Status aktualisieren (nur für Admins)"""
    
    # Prüfen ob Benutzer Admin ist
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins können Report-Status ändern")
    
    # Einfache Mock-Antwort
    return {
        "id": report_id,
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    }

@router.post("/ratings")
def create_rating(
    listing_id: int = Body(...),
    rating: int = Body(...),
    comment: str = Body(""),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Bewertung erstellen"""
    
    # Listing prüfen
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Rating validieren
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Bewertung muss zwischen 1 und 5 liegen")
    
    # Einfache Mock-Antwort
    return {
        "id": 1,
        "user_id": current_user.id,
        "listing_id": listing_id,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow().isoformat()
    }