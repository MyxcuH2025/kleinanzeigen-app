"""
Stories-Routes für Instagram-Style Stories Feature
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, Form
from sqlmodel import Session
from typing import List, Optional
import logging
import uuid
import os
from pathlib import Path
from datetime import datetime
import asyncio
import subprocess

from app.dependencies import get_session, get_current_user
from models.user import User
from models.story import (
    Story, StoryCreate, StoryResponse, StoryUpdate,
    StoryReactionType, StoriesFeedResponse, StoryStatsResponse
)
from app.stories.service import StoriesService
from app.stories.cache import StoriesCache

# Router für Stories-Endpoints
router = APIRouter(prefix="/api/stories", tags=["stories"])

# Logging
logger = logging.getLogger(__name__)

# Redis-Client mit Fallback-Strategie
redis_client = None
try:
    import redis
    redis_client = redis.Redis(
        host='localhost', 
        port=6379, 
        db=0, 
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
        retry_on_timeout=False
    )
    # Teste Connection
    redis_client.ping()
    logger.info("Redis erfolgreich verbunden")
except Exception as e:
    redis_client = None
    logger.warning(f"Redis nicht verfügbar - Caching deaktiviert: {e}")

@router.post("/", status_code=201)
async def create_story(
    media: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    duration: Optional[int] = Form(15),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story erstellen mit robustem Error-Handling und Upload-Limits"""
    
    # Upload-Limits validieren
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    
    try:
        # File-Size validieren
        if media.size and media.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"Datei zu groß. Maximum: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # File-Type validieren
        if media.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Nicht unterstützter Dateityp. Erlaubt: {', '.join(ALLOWED_TYPES)}"
            )
        
        # Duration validieren
        if duration and (duration < 1 or duration > 60):
            raise HTTPException(
                status_code=400,
                detail="Story-Dauer muss zwischen 1 und 60 Sekunden liegen"
            )
        
        # Caption-Länge validieren
        if caption and len(caption) > 500:
            raise HTTPException(
                status_code=400,
                detail="Caption zu lang. Maximum: 500 Zeichen"
            )
        
        # Media-Upload verarbeiten
        supported_image_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        supported_video_types = ["video/mp4", "video/webm", "video/quicktime"]
        
        # Media-Typ bestimmen
        media_type = "image" if media.content_type in supported_image_types else "video"
        
        # Dateigröße prüfen (max 50MB für Videos, 10MB für Bilder)
        media_content = await media.read()
        max_size = 50 * 1024 * 1024 if media_type == "video" else 10 * 1024 * 1024
        
        if len(media_content) > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"Datei zu groß. Max: {max_size // (1024*1024)}MB"
            )
        
        # Eindeutigen Dateinamen generieren
        file_extension = media.filename.split('.')[-1] if '.' in media.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Upload-Verzeichnis erstellen
        upload_dir = Path("uploads/stories")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Datei speichern
        file_path = upload_dir / unique_filename
        with open(file_path, "wb") as buffer:
            buffer.write(media_content)
        
        # Media-URL für API
        media_url = f"/api/images/stories/{unique_filename}"
        
        # Video-Thumbnail generieren
        thumbnail_url = None
        if media_type == "video":
            try:
                thumbnail_url = await _generate_video_thumbnail(file_path, upload_dir)
            except Exception as thumb_error:
                logger.warning(f"Fehler bei Video-Thumbnail-Generierung: {thumb_error}")
                thumbnail_url = f"/api/images/stories/thumb_{unique_filename}"  # Fallback
        
        # Stories-Service
        stories_service = StoriesService(session, redis_client)
        
        # Story erstellen
        story = await stories_service.create_story(
            user_id=current_user.id,
            media_url=media_url,
            thumbnail_url=thumbnail_url,
            media_type=media_type,
            caption=caption,
            duration=duration
        )
        
        logger.info(f"Story {story.id} für User {current_user.id} erstellt")
        
        return {
            "message": "Story erfolgreich erstellt",
            "story_id": story.id,
            "media_url": media_url,
            "expires_at": story.expires_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Story: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen der Story")

@router.get("/feed", response_model=StoriesFeedResponse)
async def get_stories_feed(
    limit: int = Query(20, ge=1, le=50, description="Anzahl Stories pro Seite"),
    offset: int = Query(0, ge=0, description="Offset für Paginierung"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Stories-Feed für gefolgte User abrufen"""
    try:
        # Stories-Service mit Redis-Caching initialisieren
        stories_service = StoriesService(session, redis_client)
        
        # Stories-Feed mit Caching abrufen
        stories_data = await stories_service.get_stories_feed(
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        
        # Gesamtanzahl für Paginierung abrufen (mit Fallback)
        try:
            total_count = await stories_service.get_stories_count(current_user.id)
        except Exception as count_error:
            logger.warning(f"Fehler beim Zählen der Stories (Fallback): {count_error}")
            total_count = len(stories_data)  # Fallback: Anzahl der aktuellen Stories
        
        return StoriesFeedResponse(
            stories=stories_data,
            total_count=total_count,
            has_more=(offset + limit) < total_count
        )
        
    except HTTPException:
        # Re-raise HTTP-Exceptions (Authentication, etc.)
        raise
    except Exception as e:
        logger.error(f"Kritischer Fehler beim Abrufen des Stories-Feeds: {e}")
        # Graceful Fallback: Leere Stories-Liste zurückgeben statt 500 Error
        return StoriesFeedResponse(
            stories=[],
            total_count=0,
            has_more=False
        )

@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Einzelne Story abrufen"""
    try:
        stories_service = StoriesService(session, redis_client)
        
        # Story aus Datenbank abrufen
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if not story.is_active:
            raise HTTPException(status_code=404, detail="Story ist nicht mehr verfügbar")
        
        # Story-Response erstellen
        story_response = StoryResponse(
            id=story.id,
            user_id=story.user_id,
            media_url=story.media_url,
            media_type=story.media_type,
            thumbnail_url=story.thumbnail_url,
            caption=story.caption,
            duration=story.duration,
            views_count=story.views_count,
            reactions_count=story.reactions_count,
            created_at=story.created_at,
            expires_at=story.expires_at,
            is_active=story.is_active,
            has_viewed=stories_service._has_user_viewed_story(story.id, current_user.id),
            user_reaction=stories_service._get_user_reaction(story.id, current_user.id)
        )
        
        return story_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Story: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Story")

@router.post("/{story_id}/view")
async def view_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story als gesehen markieren"""
    try:
        stories_service = StoriesService(session, redis_client)
        
        # Prüfe ob Story existiert
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if not story.is_active:
            raise HTTPException(status_code=404, detail="Story ist nicht mehr verfügbar")
        
        # Story als gesehen markieren
        success = await stories_service.view_story(story_id, current_user.id)
        
        if success:
            return {"message": "Story als gesehen markiert", "story_id": story_id}
        else:
            raise HTTPException(status_code=500, detail="Fehler beim Markieren der Story")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Markieren der Story als gesehen: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Markieren der Story")

@router.post("/{story_id}/reaction")
async def react_to_story(
    story_id: int,
    reaction_type: StoryReactionType,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reaktion auf Story hinzufügen/entfernen"""
    try:
        stories_service = StoriesService(session, redis_client)
        
        # Prüfe ob Story existiert
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if not story.is_active:
            raise HTTPException(status_code=404, detail="Story ist nicht mehr verfügbar")
        
        # Reaktion hinzufügen/entfernen
        success = await stories_service.react_to_story(
            story_id, 
            current_user.id, 
            reaction_type.value
        )
        
        if success:
            return {
                "message": f"Reaktion {reaction_type.value} erfolgreich",
                "story_id": story_id,
                "reaction_type": reaction_type.value
            }
        else:
            raise HTTPException(status_code=500, detail="Fehler beim Hinzufügen der Reaktion")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Reagieren auf Story: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Reagieren auf Story")

@router.delete("/{story_id}")
async def delete_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story löschen"""
    try:
        stories_service = StoriesService(session, redis_client)
        
        # Story löschen
        success = await stories_service.delete_story(story_id, current_user.id)
        
        if success:
            return {"message": "Story erfolgreich gelöscht", "story_id": story_id}
        else:
            raise HTTPException(status_code=500, detail="Fehler beim Löschen der Story")
        
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Löschen der Story: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Löschen der Story")

@router.get("/user/{user_id}")
async def get_user_stories(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Stories eines Users abrufen"""
    try:
        stories_service = StoriesService(session, redis_client)
        
        # User-Stories abrufen
        stories_data = await stories_service.get_user_stories(user_id)
        
        return {
            "user_id": user_id,
            "stories": stories_data,
            "total_count": len(stories_data)
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der User-Stories: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der User-Stories")

@router.get("/{story_id}/stats", response_model=StoryStatsResponse)
async def get_story_stats(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story-Statistiken abrufen"""
    try:
        # Prüfe ob Story existiert und User berechtigt ist
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if story.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Keine Berechtigung für Statistiken")
        
        # TODO: Implementiere detaillierte Statistiken
        stats = StoryStatsResponse(
            story_id=story_id,
            views_count=story.views_count,
            reactions_count=story.reactions_count,
            comments_count=0,  # TODO: Implementiere Kommentare
            unique_viewers=story.views_count,  # Vereinfacht
            top_reactions={}  # TODO: Implementiere Reaktions-Analyse
        )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Story-Statistiken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Statistiken")

@router.get("/cache/stats")
async def get_cache_stats(
    current_user: User = Depends(get_current_user)
):
    """Cache-Statistiken abrufen (Admin-only)"""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Nur für Admins")
        
        if not redis_client:
            return {"message": "Redis-Cache nicht verfügbar"}
        
        cache = StoriesCache(redis_client)
        stats = await cache.get_cache_stats()
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Cache-Statistiken: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Cache-Statistiken")

# Video-Thumbnail-Generierung
async def _generate_video_thumbnail(video_path: Path, upload_dir: Path) -> str:
    """Video-Thumbnail mit FFmpeg generieren"""
    try:
        # Thumbnail-Dateiname generieren
        thumbnail_filename = f"thumb_{video_path.stem}.jpg"
        thumbnail_path = upload_dir / thumbnail_filename
        
        # FFmpeg-Befehl für Thumbnail-Generierung
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-ss", "00:00:01",  # Thumbnail bei 1 Sekunde
            "-vframes", "1",
            "-q:v", "2",  # Hohe Qualität
            "-y",  # Überschreiben ohne Nachfrage
            str(thumbnail_path)
        ]
        
        # FFmpeg ausführen
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0 and thumbnail_path.exists():
            logger.info(f"Video-Thumbnail erfolgreich generiert: {thumbnail_filename}")
            return f"/api/images/stories/{thumbnail_filename}"
        else:
            logger.error(f"FFmpeg-Fehler: {stderr.decode()}")
            raise Exception(f"Thumbnail-Generierung fehlgeschlagen: {stderr.decode()}")
            
    except FileNotFoundError:
        logger.warning("FFmpeg nicht gefunden - Thumbnail-Generierung übersprungen")
        raise Exception("FFmpeg nicht installiert")
    except Exception as e:
        logger.error(f"Fehler bei Video-Thumbnail-Generierung: {e}")
        raise
