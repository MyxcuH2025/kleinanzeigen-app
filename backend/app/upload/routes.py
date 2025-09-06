"""
File Upload routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from models import User
from app.dependencies import get_session, get_current_user, get_current_user_optional
from typing import List
import os
import uuid
from pathlib import Path
import logging

# Router für Upload-Endpoints
router = APIRouter(prefix="/api", tags=["upload"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/uploads/{filename:path}")
def get_uploaded_file(filename: str):
    """Hochgeladene Datei abrufen"""
    
    # Entferne alle möglichen Pfad-Präfixe
    clean_filename = filename
    if clean_filename.startswith('/api/uploads/'):
        clean_filename = clean_filename.replace('/api/uploads/', '')
    if clean_filename.startswith('api/uploads/'):
        clean_filename = clean_filename.replace('api/uploads/', '')
    if clean_filename.startswith('/uploads/'):
        clean_filename = clean_filename.replace('/uploads/', '')
    if clean_filename.startswith('uploads/'):
        clean_filename = clean_filename.replace('uploads/', '')
    
    file_path = Path("uploads") / clean_filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
    return FileResponse(file_path)

@router.get("/placeholder-image.jpg")
def get_placeholder_image():
    """Platzhalter-Bild abrufen"""
    
    placeholder_path = Path("uploads") / "placeholder.jpg"
    
    if not placeholder_path.exists():
        # Einfaches Platzhalter-Bild erstellen (ohne PIL)
        placeholder_path.write_bytes(b'')
        # Für jetzt einfach einen 404 zurückgeben
        raise HTTPException(status_code=404, detail="Platzhalter-Bild nicht verfügbar")
    
    return FileResponse(placeholder_path)

@router.get("/images/{filename:path}")
def get_image(filename: str):
    """Bild abrufen (Legacy-Endpoint für Kompatibilität)"""
    
    # Entferne alle möglichen Pfad-Präfixe
    clean_filename = filename
    if clean_filename.startswith('/api/uploads/'):
        clean_filename = clean_filename.replace('/api/uploads/', '')
    if clean_filename.startswith('api/uploads/'):
        clean_filename = clean_filename.replace('api/uploads/', '')
    if clean_filename.startswith('/uploads/'):
        clean_filename = clean_filename.replace('/uploads/', '')
    if clean_filename.startswith('uploads/'):
        clean_filename = clean_filename.replace('uploads/', '')
    
    file_path = Path("uploads") / clean_filename
    
    if file_path.exists():
        return FileResponse(file_path)
    
    # Fallback: Platzhalter-Bild
    return get_placeholder_image()

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bild hochladen"""
    
    # Dateityp prüfen
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Nur Bilddateien sind erlaubt")
    
    # Dateigröße prüfen (max 5MB)
    file_size = 0
    content = file.file.read()
    file_size = len(content)
    file.file.seek(0)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="Datei ist zu groß (max 5MB)")
    
    # Uploads-Ordner erstellen falls nicht vorhanden
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Eindeutigen Dateinamen generieren
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Datei speichern
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # URL für Frontend generieren
        file_url = f"/api/uploads/{unique_filename}"
        
        return {
            "message": "Bild erfolgreich hochgeladen",
            "filename": unique_filename,
            "url": file_url,
            "size": file_size
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Datei: {str(e)}")
