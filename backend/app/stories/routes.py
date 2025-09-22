"""
Stories-Routes für Instagram-Style Stories Feature
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, Form
from sqlmodel import Session, desc
from sqlalchemy.orm import joinedload
from typing import List, Optional
import time
import sqlite3
import logging
import uuid
import os
from pathlib import Path
from datetime import datetime
import asyncio
import subprocess
import shutil
from pydantic import BaseModel

from app.dependencies import get_session, get_current_user
from models.user import User
from app.websocket.manager import manager
from models.story import (
    Story, StoryCreate, StoryResponse, StoryUpdate,
    StoryReactionType, StoriesFeedResponse, StoryStatsResponse,
    StoryView, StoryReaction, StoryComment
)
from sqlmodel import select

# Pydantic Models für API Responses
class StoryViewerInfo(BaseModel):
    id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    viewed_at: str
    is_owner: bool = False

class StoryInsightsResponse(BaseModel):
    story_id: str
    total_views: int
    viewers: List[StoryViewerInfo]
    created_at: str
    expires_at: str
from app.stories.service import StoriesService
from app.stories.cache import StoriesCache
from app.stories.validators import StoriesValidator
from app.stories.video_processor import VideoProcessor, ThumbnailGenerator
from app.stories.media_processor import MediaProcessor, PathManager, FileValidator
from fastapi import Body

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
    text_overlays: Optional[str] = Form(None),
    sticker_overlays: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story erstellen mit robustem Error-Handling und Upload-Limits"""
    
    try:
        # Alle Inputs validieren
        StoriesValidator.validate_story_inputs(media, caption, duration)
        
        # Media-Upload verarbeiten
        supported_image_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        supported_video_types = ["video/mp4", "video/webm", "video/quicktime"]
        
        # Media-Typ bestimmen
        media_type = "image" if media.content_type in supported_image_types else "video"
        
        # Media-Typ als Enum konvertieren
        from models.story import StoryMediaType
        media_type_enum = StoryMediaType.IMAGE if media_type == "image" else StoryMediaType.VIDEO
        
        # Media-Processor verwenden für Upload-Handling
        upload_dir = Path("uploads/stories")
        media_processor = MediaProcessor(upload_dir)
        
        # Datei mit Media-Processor speichern
        file_path, media_url = media_processor.save_uploaded_file(media, media.filename)
        unique_filename = file_path.name
        
        # Video-Verarbeitung mit Overlays
        final_media_url = media_url
        thumbnail_url = None
        
        if media_type == "video":
            # Prüfe ob Overlays vorhanden sind
            logger.info(f"VIDEO-OVERLAY-DEBUG - text_overlays: '{text_overlays}', sticker_overlays: '{sticker_overlays}'")
            has_overlays = (text_overlays and text_overlays.strip() != 'null') or (sticker_overlays and sticker_overlays.strip() != 'null')
            logger.info(f"VIDEO-OVERLAY-DEBUG - has_overlays: {has_overlays}")
            logger.info(f"VIDEO-OVERLAY-DEBUG - text_overlays type: {type(text_overlays)}, sticker_overlays type: {type(sticker_overlays)}")
            
            if has_overlays:
                logger.info(f"Overlays gefunden - Text: {text_overlays}, Sticker: {sticker_overlays}")
                try:
                    # Video mit Overlays verarbeiten
                    processed_video_path = await _process_video_with_overlays(
                        file_path, upload_dir, text_overlays, sticker_overlays
                    )
                    if processed_video_path:
                        # Neuen Dateinamen für verarbeitetes Video
                        processed_filename = f"processed_{unique_filename}"
                        processed_path = upload_dir / processed_filename
                        
                        # Verarbeitetes Video mit Media-Processor verschieben
                        media_processor.move_processed_file(processed_video_path, processed_filename)
                        
                        # Original-Video BEHALTEN (nicht löschen) für Fallback
                        # media_processor.delete_file(file_path)  # KOMMENTIERT: Original behalten
                        
                        # Neue Media-URL für verarbeitetes Video verwenden
                        final_media_url = f"/api/images/stories/{processed_filename}"
                        logger.info(f"Verarbeitetes Video wird verwendet: {final_media_url}")
                        unique_filename = processed_filename
                        file_path = processed_path
                        
                        logger.info(f"Video mit Overlays erfolgreich verarbeitet: {processed_filename}")
                    else:
                        logger.warning("Video-Overlay-Verarbeitung fehlgeschlagen - Original-Video wird verwendet")
                except Exception as overlay_error:
                    logger.error(f"Fehler bei Video-Overlay-Verarbeitung: {overlay_error}")
                    logger.error(f"Overlay-Fehler Details: {type(overlay_error).__name__}: {str(overlay_error)}")
                    # Fallback: Original-Video verwenden
            else:
                logger.info("Keine Overlays gefunden - Original-Video wird verwendet")
            
            # Video-Thumbnail generieren
            try:
                thumbnail_url = await _generate_video_thumbnail(file_path, upload_dir)
            except Exception as thumb_error:
                logger.error(f"Fehler bei Video-Thumbnail-Generierung: {thumb_error}")
                logger.error(f"Thumbnail-Fehler Details: {type(thumb_error).__name__}: {str(thumb_error)}")
                thumbnail_url = f"/api/images/stories/thumb_{unique_filename}"  # Fallback
        
        # Stories-Service
        stories_service = StoriesService(session, redis_client)
        
        # Story erstellen
        story = await stories_service.create_story(
            user_id=current_user.id,
            media_url=final_media_url,
            thumbnail_url=thumbnail_url,
            media_type=media_type_enum,
            caption=caption,
            duration=duration,
            text_overlays=text_overlays or None,
            sticker_overlays=sticker_overlays or None
        )
        
        logger.info(f"Story {story.id} für User {current_user.id} erstellt")
        
        # Cache invalidieren nach Story-Erstellung
        try:
            if redis_client:
                # Alle Feed-Caches löschen
                pattern = "stories:feed:*"
                keys = redis_client.keys(pattern)
                if keys:
                    redis_client.delete(*keys)
                    logger.info(f"Feed-Cache nach Story-Erstellung invalidiert: {len(keys)} Keys gelöscht")
        except Exception as cache_error:
            logger.warning(f"Fehler beim Invalidieren des Feed-Caches nach Story-Erstellung: {cache_error}")
        
        # WebSocket-Broadcast für neue Story
        try:
            import json
            story_data = {
                "id": story.id,
                "user_id": story.user_id,
                "media_url": media_url,
                "media_type": media_type,
                "thumbnail_url": thumbnail_url,
                "caption": caption,
                "duration": duration,
                "views_count": 0,
                "reactions_count": 0,
                "created_at": story.created_at.isoformat(),
                "expires_at": story.expires_at.isoformat(),
                "is_active": True,
                "has_viewed": False,
                "user_reaction": None,
                "user_name": f"{current_user.first_name} {current_user.last_name}".strip(),
                "user_avatar": current_user.avatar
            }
            
            await manager.broadcast(json.dumps({
                "type": "new_story",
                "story": story_data
            }))
            logger.info(f"Neue Story {story.id} an alle Clients gebroadcastet")
        except Exception as e:
            logger.error(f"Fehler beim Broadcasten der neuen Story: {e}")

        return {
            "message": "Story erfolgreich erstellt",
            "story_id": story.id,
            "media_url": final_media_url,
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
    # current_user: User = Depends(get_current_user),  # Temporär deaktiviert für Testing
    session: Session = Depends(get_session)
):
    """Stories-Feed für gefolgte User abrufen - ECHTE DATENBANK-ABFRAGEN"""
    try:
        # ECHTE DATENBANK-ABFRAGE - Supabase PostgreSQL mit joinedload
        query = session.query(Story).options(joinedload(Story.user)).filter(Story.is_active == True)
        
        # Nur Stories von gefolgten Usern (wenn User eingeloggt)
        # if current_user:
        #     following_ids = session.query(Follow.following_id).filter(Follow.follower_id == current_user.id).all()
        #     following_ids = [f[0] for f in following_ids]
        #     query = query.filter(Story.user_id.in_(following_ids))
        
        # Sortierung nach Erstellungsdatum (neueste zuerst)
        query = query.order_by(desc(Story.created_at))
        
        # Pagination
        total = query.count()
        stories = query.offset(offset).limit(limit).all()
        
        # Debug: Log die Anzahl der Stories
        logger.info(f"Gefundene Stories: {len(stories)}")
        
        # Wenn keine Stories gefunden, leere Liste zurückgeben
        if not stories:
            logger.info("Keine Stories gefunden, gebe leere Liste zurück")
            return {
                "success": True,
                "stories": [],
                "total_count": 0,
                "has_more": False,
                "limit": limit,
                "offset": offset
            }
        
        # Konvertierung zu Dictionary-Format
        stories_data = []
        for story in stories:
            # Sichere User-Daten-Zugriff
            user_name = "Unknown"
            user_avatar = "/api/images/default-avatar.jpg"
            
            if story.user:
                user_name = f"{story.user.first_name} {story.user.last_name}".strip() or "User"
                user_avatar = story.user.avatar if story.user.avatar else "/api/images/default-avatar.jpg"
            
            story_dict = {
                "id": story.id,
                "user_id": story.user_id,
                "media_url": story.media_url,
                "media_type": story.media_type.value if story.media_type else "image",
                "thumbnail_url": story.thumbnail_url,
                "caption": story.caption,
                "duration": story.duration,
                "views_count": story.views_count,
                "reactions_count": story.reactions_count,
                "created_at": story.created_at.isoformat() + "Z" if story.created_at else None,
                "expires_at": story.expires_at.isoformat() + "Z" if story.expires_at else None,
                "is_active": story.is_active,
                "text_overlays": story.text_overlays,
                "sticker_overlays": story.sticker_overlays,
                "user_name": user_name,
                "user_avatar": user_avatar,
                "has_viewed": False,  # TODO: Implement view tracking
                "user_reaction": None  # TODO: Implement reaction tracking
            }
            stories_data.append(story_dict)
        
        return {
            "success": True,
            "stories": stories_data,
            "total_count": total,
            "has_more": (offset + limit) < total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Stories: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Abrufen der Stories")

@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(
    story_id: int,
    # current_user: User = Depends(get_current_user),  # Temporär deaktiviert für Testing
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
        
        # User-Daten für Story-Response holen
        user = session.get(User, story.user_id)
        user_name = f"{user.first_name or ''} {user.last_name or ''}".strip() if user else f"User {story.user_id}"
        user_avatar = user.avatar if user else None
        
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
            user_name=user_name,
            user_avatar=user_avatar,
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

@router.post("/{story_id}/reply")
async def reply_to_story(
    story_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Text-Antwort auf eine Story. Persistenz optional – vorerst nur Benachrichtigung."""
    try:
        text = (payload or {}).get("text")
        if not text or not isinstance(text, str):
            raise HTTPException(status_code=400, detail="Text ist erforderlich")

        # Story-Owner benachrichtigen
        from models.story import Story
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")

        import json
        # Persistiere in DM-Konversation (listing_id=None)
        from models import Conversation, Message
        from sqlmodel import select, or_, and_
        # DM-Konversation immer erstellen/finden (auch bei Self-Reply)
        # Finde/erstelle DM-Konversation (mit Retry bei SQLite-Lock)
        convo = session.exec(
            select(Conversation).where(
                Conversation.listing_id == None,  # noqa: E711
                or_(
                    and_(Conversation.buyer_id == current_user.id, Conversation.seller_id == story.user_id),
                    and_(Conversation.buyer_id == story.user_id, Conversation.seller_id == current_user.id)
                )
            )
        ).first()
        if not convo:
            retries = 3
            while retries:
                try:
                    convo = Conversation(listing_id=None, buyer_id=current_user.id, seller_id=story.user_id)
                    session.add(convo)
                    session.commit()
                    session.refresh(convo)
                    break
                except Exception as e:
                    session.rollback()
                    if isinstance(e, sqlite3.OperationalError) and 'locked' in str(e).lower() and retries > 1:
                        time.sleep(0.1)
                        retries -= 1
                        continue
                    raise
        # Nachricht speichern mit Retry bei SQLite-Lock
        retries = 3
        while retries:
            try:
                msg = Message(conversation_id=convo.id, sender_id=current_user.id, content=text)
                session.add(msg)
                from datetime import datetime
                convo.updated_at = datetime.utcnow()
                session.commit()
                break
            except Exception as e:
                session.rollback()
                if isinstance(e, sqlite3.OperationalError) and 'locked' in str(e).lower() and retries > 1:
                    time.sleep(0.1)
                    retries -= 1
                    continue
                raise

        await manager.send_personal_message(json.dumps({
            "type": "story_reply",
            "story_id": story_id,
            "user_id": current_user.id,
            "text": text,
        }), story.user_id)

        # Zusätzlich Chat-Events an beide senden, damit ChatPage live aktualisiert
        try:
            payload = {
                "id": msg.id,
                "content": msg.content,
                "sender_id": msg.sender_id,
                "conversation_id": msg.conversation_id,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
                "message_type": "text",
                "file_url": None
            }
            await manager.send_personal_message(json.dumps({"type": "message", "data": payload}), current_user.id)
            # Auch an Owner senden (bei Self-Reply identisch)
            await manager.send_personal_message(json.dumps({"type": "message", "data": payload}), story.user_id)
        except Exception:
            pass

        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler bei Story-Reply: {type(e).__name__}: {e}")
        session.rollback()
        raise HTTPException(
            status_code=500, 
            detail="Fehler beim Senden der Story-Antwort",
            headers={"Access-Control-Allow-Origin": "*"}
        )

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

# Video-Overlay-Verarbeitung
async def _process_video_with_overlays(
    video_path: Path, 
    upload_dir: Path, 
    text_overlays: Optional[str], 
    sticker_overlays: Optional[str]
) -> Optional[Path]:
    """Video mit Text- und Sticker-Overlays verarbeiten - Delegiert an VideoProcessor"""
    try:
        logger.info(f"Starte Video-Overlay-Verarbeitung für: {video_path}")
        
        # Video-Processor verwenden
        video_processor = VideoProcessor()
        processed_video_path = await video_processor.process_video_with_overlays(
            video_path, text_overlays, sticker_overlays
        )
        
        if processed_video_path:
            # Verarbeitetes Video in den upload_dir verschieben
            final_path = upload_dir / f"temp_processed_{video_path.name}"
            shutil.move(str(processed_video_path), str(final_path))
            return final_path
        else:
            logger.warning("Video-Overlay-Verarbeitung fehlgeschlagen")
            return None
            
    except Exception as e:
        logger.error(f"Fehler in _process_video_with_overlays: {e}")
        logger.error(f"Fehler-Typ: {type(e).__name__}")
        logger.error(f"Fehler-Details: {str(e)}")
        return None

# _generate_overlay_filter Funktion entfernt - jetzt in VideoProcessor

# Story Insights Endpoint
@router.get("/{story_id}/insights", response_model=StoryInsightsResponse)
async def get_story_insights(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story-Insights abrufen - Viewer-Liste und Statistiken"""
    try:
        # Story existiert und gehört dem User?
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if story.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung für diese Story")
        
        # Story-Views mit User-Informationen abrufen
        from sqlmodel import select, func
        from models import StoryView
        
        # Query für Story-Views mit User-Daten
        query = select(
            StoryView.viewer_id,
            User.first_name,
            User.last_name,
            User.avatar,
            StoryView.viewed_at
        ).join(User, StoryView.viewer_id == User.id).where(
            StoryView.story_id == story_id
        ).order_by(StoryView.viewed_at.desc())
        
        results = session.exec(query).all()
        
        # Viewer-Liste erstellen
        viewers = []
        for result in results:
            viewer_id = result[0]  # StoryView.viewer_id
            first_name = result[1]  # User.first_name
            last_name = result[2]  # User.last_name
            avatar_url = result[3]  # User.avatar
            viewed_at = result[4]  # StoryView.viewed_at
            
            viewers.append(StoryViewerInfo(
                id=viewer_id,
                username=f"{first_name} {last_name}".strip(),  # Kombiniere first_name + last_name
                full_name=f"{first_name} {last_name}".strip(),
                avatar_url=avatar_url,
                viewed_at=viewed_at.isoformat(),
                is_owner=(viewer_id == current_user.id)
            ))
        
        return StoryInsightsResponse(
            story_id=str(story_id),
            total_views=len(viewers),
            viewers=viewers,
            created_at=story.created_at.isoformat(),
            expires_at=story.expires_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Fehler beim Abrufen der Story-Insights {story_id}: {e}")
        logging.error(f"Exception Type: {type(e).__name__}")
        logging.error(f"Exception Details: {str(e)}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Insights")

# Story Delete Endpoint
@router.delete("/{story_id}")
async def delete_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Story löschen"""
    try:
        # Story existiert und gehört dem User?
        story = session.get(Story, story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story nicht gefunden")
        
        if story.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung zum Löschen dieser Story")
        
        # Media-Datei löschen
        if story.media_url:
            try:
                media_path = Path(story.media_url)
                if media_path.exists():
                    media_path.unlink()
                    logging.info(f"Media-Datei gelöscht: {media_path}")
            except Exception as e:
                logging.warning(f"Konnte Media-Datei nicht löschen: {e}")
        
        # Thumbnail-Datei löschen
        if story.thumbnail_url:
            try:
                thumbnail_path = Path(story.thumbnail_url)
                if thumbnail_path.exists():
                    thumbnail_path.unlink()
                    logging.info(f"Thumbnail-Datei gelöscht: {thumbnail_path}")
            except Exception as e:
                logging.warning(f"Konnte Thumbnail-Datei nicht löschen: {e}")
        
        # Zuerst alle abhängigen Datensätze löschen
        # 1. Story Views löschen
        story_views = session.exec(select(StoryView).where(StoryView.story_id == story_id)).all()
        for view in story_views:
            session.delete(view)
        
        # 2. Story Reactions löschen
        story_reactions = session.exec(select(StoryReaction).where(StoryReaction.story_id == story_id)).all()
        for reaction in story_reactions:
            session.delete(reaction)
        
        # 3. Story Comments löschen
        story_comments = session.exec(select(StoryComment).where(StoryComment.story_id == story_id)).all()
        for comment in story_comments:
            session.delete(comment)
        
        # 4. Jetzt die Story selbst löschen
        session.delete(story)
        session.commit()
        
        logging.info(f"Story {story_id} von User {current_user.id} gelöscht")
        
        return {"message": "Story erfolgreich gelöscht"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Fehler beim Löschen der Story {story_id}: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Löschen der Story")

# Video-Thumbnail-Generierung
async def _generate_video_thumbnail(video_path: Path, upload_dir: Path) -> str:
    """Video-Thumbnail mit FFmpeg generieren - Delegiert an ThumbnailGenerator"""
    try:
        # Thumbnail-Dateiname mit PathManager generieren
        thumbnail_filename = PathManager.get_thumbnail_filename(video_path.name)
        thumbnail_path = upload_dir / thumbnail_filename
        
        # ThumbnailGenerator verwenden
        thumbnail_generator = ThumbnailGenerator()
        success = await thumbnail_generator.generate_video_thumbnail(video_path, thumbnail_path, time_offset=1.0)
        
        if success:
            logger.info(f"Video-Thumbnail erfolgreich generiert: {thumbnail_filename}")
            return f"/api/images/stories/{thumbnail_filename}"
        else:
            raise Exception("Thumbnail-Generierung fehlgeschlagen")
            
    except Exception as e:
        logger.error(f"Fehler bei Video-Thumbnail-Generierung: {e}")
        logger.error(f"Thumbnail-Fehler Details: {type(e).__name__}: {str(e)}")
        raise
# Test
