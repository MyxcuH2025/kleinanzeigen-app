"""
Templates routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path
from sqlmodel import Session, select
from models import Template, TemplateFolder, User, Listing, ListingCreate
from app.dependencies import get_session, get_current_user, get_current_user_optional
from typing import List
import json
import logging

# Router für Templates-Endpoints
router = APIRouter(prefix="/api", tags=["templates"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/templates")
def get_templates(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Alle Templates des Benutzers abrufen"""
    
    templates = session.exec(
        select(Template).where(Template.user_id == current_user.id)
        .order_by(Template.created_at.desc())
    ).all()
    
    result = []
    for template in templates:
        try:
            template_data = json.loads(template.template_data) if template.template_data else {}
        except:
            template_data = {}
        
        result.append({
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "category": template.category,
            "template_data": template_data,
            "created_at": template.created_at.isoformat() if template.created_at else None,
            "updated_at": template.updated_at.isoformat() if template.updated_at else None
        })
    
    return {"templates": result}

@router.post("/templates")
def create_template(
    name: str = Body(...),
    description: str = Body(...),
    category: str = Body(...),
    template_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Template erstellen"""
    
    template = Template(
        name=name,
        description=description,
        category=category,
        template_data=json.dumps(template_data),
        user_id=current_user.id
    )
    
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "template_data": template_data,
        "created_at": template.created_at.isoformat() if template.created_at else None
    }

@router.get("/templates/{template_id}")
def get_template(
    template_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Einzelnes Template abrufen"""
    
    template = session.exec(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    
    try:
        template_data = json.loads(template.template_data) if template.template_data else {}
    except:
        template_data = {}
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "template_data": template_data,
        "created_at": template.created_at.isoformat() if template.created_at else None,
        "updated_at": template.updated_at.isoformat() if template.updated_at else None
    }

@router.put("/templates/{template_id}")
def update_template(
    template_id: int = Path(...),
    name: str = Body(...),
    description: str = Body(...),
    category: str = Body(...),
    template_data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Template bearbeiten"""
    
    template = session.exec(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    
    # Template aktualisieren
    template.name = name
    template.description = description
    template.category = category
    template.template_data = json.dumps(template_data)
    template.updated_at = datetime.utcnow()
    
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "template_data": template_data,
        "updated_at": template.updated_at.isoformat() if template.updated_at else None
    }

@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Template löschen"""
    
    template = session.exec(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    
    session.delete(template)
    session.commit()
    
    return {"message": "Template erfolgreich gelöscht"}

@router.post("/templates/{template_id}/create-listing")
def create_listing_from_template(
    template_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing aus Template erstellen"""
    
    template = session.exec(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template nicht gefunden")
    
    try:
        template_data = json.loads(template.template_data) if template.template_data else {}
    except:
        template_data = {}
    
    # Neues Listing aus Template-Daten erstellen
    new_listing = Listing(
        title=template_data.get("title", "Neues Listing"),
        description=template_data.get("description", ""),
        category=template_data.get("category", "kleinanzeigen"),
        condition=template_data.get("condition", "neu"),
        location=template_data.get("location", ""),
        price=template_data.get("price", 0),
        attributes=json.dumps(template_data.get("attributes", {})),
        images=json.dumps(template_data.get("images", [])),
        user_id=current_user.id
    )
    
    session.add(new_listing)
    session.commit()
    session.refresh(new_listing)
    
    return {
        "message": "Listing aus Template erstellt",
        "listing_id": new_listing.id,
        "title": new_listing.title
    }

@router.get("/template-folders")
def get_template_folders(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Template-Ordner abrufen"""
    
    folders = session.exec(
        select(TemplateFolder).where(TemplateFolder.user_id == current_user.id)
        .order_by(TemplateFolder.name)
    ).all()
    
    result = []
    for folder in folders:
        result.append({
            "id": folder.id,
            "name": folder.name,
            "description": folder.description,
            "created_at": folder.created_at.isoformat() if folder.created_at else None
        })
    
    return {"folders": result}

@router.post("/template-folders")
def create_template_folder(
    name: str = Body(...),
    description: str = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neuen Template-Ordner erstellen"""
    
    folder = TemplateFolder(
        name=name,
        description=description,
        user_id=current_user.id
    )
    
    session.add(folder)
    session.commit()
    session.refresh(folder)
    
    return {
        "id": folder.id,
        "name": folder.name,
        "description": folder.description,
        "created_at": folder.created_at.isoformat() if folder.created_at else None
    }
