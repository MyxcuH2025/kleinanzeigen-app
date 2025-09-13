"""
Stories-Service für Business-Logic
"""
from sqlmodel import Session, select, and_, or_, func, desc, joinedload
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import redis
from models.story import Story, StoryView, StoryReaction, StoryComment, StoryReactionType
from models.user import User

logger = logging.getLogger(__name__)

class StoriesService:
    """Service für Stories-Business-Logic"""
    
    def __init__(self, session: Session, redis_client: Optional[redis.Redis] = None):
        self.session = session
        self.redis = redis_client
    
    async def create_story(
        self, 
        user_id: int, 
        media_url: str, 
        media_type: str, 
        caption: Optional[str] = None,
        duration: int = 15,
        thumbnail_url: Optional[str] = None
    ) -> Story:
        """Story erstellen"""
        try:
            # Neue Story erstellen
            story = Story(
                user_id=user_id,
                media_url=media_url,
                media_type=media_type,
                caption=caption,
                duration=duration,
                thumbnail_url=thumbnail_url,
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            
            self.session.add(story)
            self.session.commit()
            self.session.refresh(story)
            
            logger.info(f"Story {story.id} für User {user_id} erstellt")
            
            # Redis-Cache für User-Stories invalidieren
            if self.redis:
                await self._invalidate_user_stories_cache(user_id)
            
            return story
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Fehler beim Erstellen der Story: {e}")
            raise
    
    async def get_stories_feed(
        self, 
        user_id: int, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Stories-Feed für User abrufen mit robustem Error-Handling"""
        try:
            # Prüfe Redis-Cache zuerst (mit Fallback)
            if self.redis:
                try:
                    cache_key = f"stories:feed:{user_id}:{limit}:{offset}"
                    cached_feed = self.redis.get(cache_key)
                    if cached_feed:
                        import json
                        logger.info(f"Cache-Hit für Stories-Feed: {cache_key}")
                        return json.loads(cached_feed)
                except Exception as cache_error:
                    logger.warning(f"Redis-Cache-Fehler (Fallback zu DB): {cache_error}")
                    # Fallback: Weiter ohne Cache
            
            # Stories von gefolgten Usern abrufen (N+1 Query optimiert)
            # TODO: Implementiere Follow-System für Stories-Feed
            # Für jetzt: Alle aktiven Stories mit User-Info in einer Query
            query = select(Story).where(
                and_(
                    Story.is_active == True,
                    Story.expires_at > datetime.utcnow(),
                    Story.user_id != user_id  # Eigene Stories nicht im Feed
                )
            ).options(
                joinedload(Story.user)  # Verhindert N+1 Queries
            ).order_by(desc(Story.created_at)).limit(limit).offset(offset)
            
            stories = self.session.exec(query).all()
            
            # Batch-Query für Viewer-Status und Reactions (verhindert N+1)
            story_ids = [story.id for story in stories] if stories else []
            viewer_status = {}
            user_reactions = {}
            
            # Robuste Batch-Queries mit Fallback
            try:
                viewer_status = self._batch_get_viewer_status(story_ids, user_id)
            except Exception as view_error:
                logger.warning(f"Fehler beim Batch-Abrufen der Viewer-Status: {view_error}")
                viewer_status = {}
            
            try:
                user_reactions = self._batch_get_user_reactions(story_ids, user_id)
            except Exception as reaction_error:
                logger.warning(f"Fehler beim Batch-Abrufen der User-Reactions: {reaction_error}")
                user_reactions = {}
            
            # Stories mit User-Info und Viewer-Status anreichern
            feed_data = []
            for story in stories:
                # Batch-optimierte Abfragen verwenden
                has_viewed = viewer_status.get(story.id, False)
                user_reaction = user_reactions.get(story.id, None)
                
                feed_data.append({
                    "id": story.id,
                    "user_id": story.user_id,
                    "media_url": story.media_url,
                    "media_type": story.media_type,
                    "thumbnail_url": story.thumbnail_url,
                    "caption": story.caption,
                    "duration": story.duration,
                    "views_count": story.views_count,
                    "reactions_count": story.reactions_count,
                    "created_at": story.created_at.isoformat(),
                    "expires_at": story.expires_at.isoformat(),
                    "is_active": story.is_active,
                    "has_viewed": has_viewed,
                    "user_reaction": user_reaction,
                    "user_name": f"{story.user.first_name} {story.user.last_name}".strip() if story.user else "Unbekannt",
                    "user_avatar": story.user.avatar if story.user else None
                })
            
            # In Redis-Cache speichern (5 Minuten TTL)
            if self.redis:
                import json
                await self.redis.setex(
                    cache_key, 
                    300,  # 5 Minuten
                    json.dumps(feed_data, default=str)
                )
            
            return feed_data
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Stories-Feeds: {e}")
            raise
    
    async def get_stories_count(self, user_id: int) -> int:
        """Gesamtanzahl der verfügbaren Stories für User"""
        try:
            query = select(func.count(Story.id)).where(
                and_(
                    Story.is_active == True,
                    Story.expires_at > datetime.utcnow(),
                    Story.user_id != user_id  # Eigene Stories nicht zählen
                )
            )
            
            count = self.session.exec(query).first()
            return count or 0
            
        except Exception as e:
            logger.error(f"Fehler beim Zählen der Stories: {e}")
            return 0
    
    async def view_story(self, story_id: int, viewer_id: int) -> bool:
        """Story als gesehen markieren"""
        try:
            # Prüfe ob Story bereits gesehen wurde
            existing_view = self.session.exec(
                select(StoryView).where(
                    and_(
                        StoryView.story_id == story_id,
                        StoryView.viewer_id == viewer_id
                    )
                )
            ).first()
            
            if existing_view:
                return True  # Bereits gesehen
            
            # Neue View erstellen
            story_view = StoryView(
                story_id=story_id,
                viewer_id=viewer_id
            )
            
            self.session.add(story_view)
            
            # View-Counter erhöhen
            story = self.session.get(Story, story_id)
            if story:
                story.views_count += 1
                self.session.add(story)
            
            self.session.commit()
            
            logger.info(f"Story {story_id} von User {viewer_id} als gesehen markiert")
            
            # Cache invalidieren
            if self.redis:
                await self._invalidate_story_cache(story_id)
            
            return True
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Fehler beim Markieren der Story als gesehen: {e}")
            raise
    
    async def react_to_story(
        self, 
        story_id: int, 
        user_id: int, 
        reaction_type: str
    ) -> bool:
        """Reaktion auf Story hinzufügen/entfernen"""
        try:
            # Prüfe ob bereits eine Reaktion existiert
            existing_reaction = self.session.exec(
                select(StoryReaction).where(
                    and_(
                        StoryReaction.story_id == story_id,
                        StoryReaction.user_id == user_id
                    )
                )
            ).first()
            
            story = self.session.get(Story, story_id)
            if not story:
                raise ValueError("Story nicht gefunden")
            
            if existing_reaction:
                # Gleiche Reaktion = entfernen
                if existing_reaction.reaction_type == reaction_type:
                    self.session.delete(existing_reaction)
                    story.reactions_count -= 1
                else:
                    # Andere Reaktion = aktualisieren
                    existing_reaction.reaction_type = reaction_type
                    # reactions_count bleibt gleich
            else:
                # Neue Reaktion hinzufügen
                new_reaction = StoryReaction(
                    story_id=story_id,
                    user_id=user_id,
                    reaction_type=reaction_type
                )
                self.session.add(new_reaction)
                story.reactions_count += 1
            
            self.session.add(story)
            self.session.commit()
            
            logger.info(f"Reaktion {reaction_type} auf Story {story_id} von User {user_id}")
            
            # Cache invalidieren
            if self.redis:
                await self._invalidate_story_cache(story_id)
            
            return True
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Fehler beim Reagieren auf Story: {e}")
            raise
    
    async def delete_story(self, story_id: int, user_id: int) -> bool:
        """Story löschen"""
        try:
            story = self.session.get(Story, story_id)
            if not story:
                raise ValueError("Story nicht gefunden")
            
            # Prüfe Berechtigung
            if story.user_id != user_id:
                raise ValueError("Keine Berechtigung zum Löschen dieser Story")
            
            # Story als inaktiv markieren (soft delete)
            story.is_active = False
            self.session.add(story)
            self.session.commit()
            
            logger.info(f"Story {story_id} von User {user_id} gelöscht")
            
            # Cache invalidieren
            if self.redis:
                await self._invalidate_story_cache(story_id)
                await self._invalidate_user_stories_cache(user_id)
            
            return True
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Fehler beim Löschen der Story: {e}")
            raise
    
    async def get_user_stories(self, user_id: int) -> List[Dict[str, Any]]:
        """Stories eines Users abrufen"""
        try:
            query = select(Story).where(
                and_(
                    Story.user_id == user_id,
                    Story.is_active == True
                )
            ).order_by(desc(Story.created_at))
            
            stories = self.session.exec(query).all()
            
            return [
                {
                    "id": story.id,
                    "media_url": story.media_url,
                    "media_type": story.media_type,
                    "thumbnail_url": story.thumbnail_url,
                    "caption": story.caption,
                    "duration": story.duration,
                    "views_count": story.views_count,
                    "reactions_count": story.reactions_count,
                    "created_at": story.created_at.isoformat(),
                    "expires_at": story.expires_at.isoformat()
                }
                for story in stories
            ]
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der User-Stories: {e}")
            raise
    
    def _has_user_viewed_story(self, story_id: int, user_id: int) -> bool:
        """Prüfe ob User die Story bereits gesehen hat"""
        view = self.session.exec(
            select(StoryView).where(
                and_(
                    StoryView.story_id == story_id,
                    StoryView.viewer_id == user_id
                )
            )
        ).first()
        return view is not None
    
    def _get_user_reaction(self, story_id: int, user_id: int) -> Optional[str]:
        """User-Reaktion auf Story abrufen"""
        reaction = self.session.exec(
            select(StoryReaction).where(
                and_(
                    StoryReaction.story_id == story_id,
                    StoryReaction.user_id == user_id
                )
            )
        ).first()
        return reaction.reaction_type if reaction else None
    
    async def _invalidate_story_cache(self, story_id: int):
        """Story-Cache invalidieren"""
        if not self.redis:
            return
        
        # Alle Cache-Keys für diese Story entfernen
        pattern = f"stories:*{story_id}*"
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)
    
    async def _invalidate_user_stories_cache(self, user_id: int):
        """User-Stories-Cache invalidieren"""
        if not self.redis:
            return
        
        # Alle Cache-Keys für diesen User entfernen
        pattern = f"stories:*{user_id}*"
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)
    
    def _batch_get_viewer_status(self, story_ids: List[int], user_id: int) -> Dict[int, bool]:
        """Batch-Query für Viewer-Status (verhindert N+1)"""
        if not story_ids:
            return {}
        
        try:
            query = select(StoryView.story_id).where(
                and_(
                    StoryView.story_id.in_(story_ids),
                    StoryView.viewer_id == user_id
                )
            )
            
            viewed_story_ids = self.session.exec(query).all()
            return {story_id: True for story_id in viewed_story_ids}
            
        except Exception as e:
            logger.error(f"Fehler beim Batch-Abrufen der Viewer-Status: {e}")
            return {}
    
    def _batch_get_user_reactions(self, story_ids: List[int], user_id: int) -> Dict[int, str]:
        """Batch-Query für User-Reactions (verhindert N+1)"""
        if not story_ids:
            return {}
        
        try:
            query = select(StoryReaction.story_id, StoryReaction.reaction_type).where(
                and_(
                    StoryReaction.story_id.in_(story_ids),
                    StoryReaction.user_id == user_id
                )
            )
            
            reactions = self.session.exec(query).all()
            return {story_id: reaction_type for story_id, reaction_type in reactions}
            
        except Exception as e:
            logger.error(f"Fehler beim Batch-Abrufen der User-Reactions: {e}")
            return {}
