"""
Redis-Caching für Stories-Performance
"""
import redis
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import timedelta

logger = logging.getLogger(__name__)

class StoriesCache:
    """Redis-Cache für Stories-Performance"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        
        # Cache-TTLs
        self.FEED_TTL = 300  # 5 Minuten
        self.STORY_TTL = 600  # 10 Minuten
        self.USER_STORIES_TTL = 180  # 3 Minuten
        self.STATS_TTL = 900  # 15 Minuten
    
    async def get_stories_feed(
        self, 
        user_id: int, 
        limit: int = 20, 
        offset: int = 0
    ) -> Optional[List[Dict[str, Any]]]:
        """Stories-Feed aus Cache abrufen"""
        try:
            cache_key = f"stories:feed:{user_id}:{limit}:{offset}"
            cached_data = await self.redis.get(cache_key)
            
            if cached_data:
                logger.debug(f"Stories-Feed aus Cache abgerufen: {cache_key}")
                return json.loads(cached_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Stories-Feed-Cache: {e}")
            return None
    
    async def set_stories_feed(
        self, 
        user_id: int, 
        feed_data: List[Dict[str, Any]], 
        limit: int = 20, 
        offset: int = 0
    ) -> None:
        """Stories-Feed in Cache speichern"""
        try:
            cache_key = f"stories:feed:{user_id}:{limit}:{offset}"
            await self.redis.setex(
                cache_key,
                self.FEED_TTL,
                json.dumps(feed_data, default=str)
            )
            logger.debug(f"Stories-Feed in Cache gespeichert: {cache_key}")
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Stories-Feed-Cache: {e}")
    
    async def get_story(self, story_id: int) -> Optional[Dict[str, Any]]:
        """Einzelne Story aus Cache abrufen"""
        try:
            cache_key = f"stories:story:{story_id}"
            cached_data = await self.redis.get(cache_key)
            
            if cached_data:
                logger.debug(f"Story aus Cache abgerufen: {cache_key}")
                return json.loads(cached_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Story aus Cache: {e}")
            return None
    
    async def set_story(self, story_id: int, story_data: Dict[str, Any]) -> None:
        """Einzelne Story in Cache speichern"""
        try:
            cache_key = f"stories:story:{story_id}"
            await self.redis.setex(
                cache_key,
                self.STORY_TTL,
                json.dumps(story_data, default=str)
            )
            logger.debug(f"Story in Cache gespeichert: {cache_key}")
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Story in Cache: {e}")
    
    async def get_user_stories(self, user_id: int) -> Optional[List[Dict[str, Any]]]:
        """User-Stories aus Cache abrufen"""
        try:
            cache_key = f"stories:user:{user_id}"
            cached_data = await self.redis.get(cache_key)
            
            if cached_data:
                logger.debug(f"User-Stories aus Cache abgerufen: {cache_key}")
                return json.loads(cached_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der User-Stories aus Cache: {e}")
            return None
    
    async def set_user_stories(self, user_id: int, stories_data: List[Dict[str, Any]]) -> None:
        """User-Stories in Cache speichern"""
        try:
            cache_key = f"stories:user:{user_id}"
            await self.redis.setex(
                cache_key,
                self.USER_STORIES_TTL,
                json.dumps(stories_data, default=str)
            )
            logger.debug(f"User-Stories in Cache gespeichert: {cache_key}")
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der User-Stories in Cache: {e}")
    
    async def get_story_stats(self, story_id: int) -> Optional[Dict[str, Any]]:
        """Story-Statistiken aus Cache abrufen"""
        try:
            cache_key = f"stories:stats:{story_id}"
            cached_data = await self.redis.get(cache_key)
            
            if cached_data:
                logger.debug(f"Story-Stats aus Cache abgerufen: {cache_key}")
                return json.loads(cached_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Story-Stats aus Cache: {e}")
            return None
    
    async def set_story_stats(self, story_id: int, stats_data: Dict[str, Any]) -> None:
        """Story-Statistiken in Cache speichern"""
        try:
            cache_key = f"stories:stats:{story_id}"
            await self.redis.setex(
                cache_key,
                self.STATS_TTL,
                json.dumps(stats_data, default=str)
            )
            logger.debug(f"Story-Stats in Cache gespeichert: {cache_key}")
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Story-Stats in Cache: {e}")
    
    async def invalidate_user_stories(self, user_id: int) -> None:
        """User-Stories-Cache invalidieren"""
        try:
            # Alle Cache-Keys für diesen User entfernen
            pattern = f"stories:*{user_id}*"
            keys = await self.redis.keys(pattern)
            
            if keys:
                await self.redis.delete(*keys)
                logger.debug(f"User-Stories-Cache invalidiert: {len(keys)} Keys entfernt")
            
        except Exception as e:
            logger.error(f"Fehler beim Invalidieren des User-Stories-Cache: {e}")
    
    async def invalidate_story(self, story_id: int) -> None:
        """Story-Cache invalidieren"""
        try:
            # Alle Cache-Keys für diese Story entfernen
            pattern = f"stories:*{story_id}*"
            keys = await self.redis.keys(pattern)
            
            if keys:
                await self.redis.delete(*keys)
                logger.debug(f"Story-Cache invalidiert: {len(keys)} Keys entfernt")
            
        except Exception as e:
            logger.error(f"Fehler beim Invalidieren des Story-Cache: {e}")
    
    async def invalidate_feeds(self, user_ids: List[int] = None) -> None:
        """Stories-Feed-Cache invalidieren"""
        try:
            if user_ids:
                # Spezifische User-Feeds invalidieren
                for user_id in user_ids:
                    pattern = f"stories:feed:{user_id}:*"
                    keys = await self.redis.keys(pattern)
                    if keys:
                        await self.redis.delete(*keys)
                        logger.debug(f"Feed-Cache für User {user_id} invalidiert")
            else:
                # Alle Feed-Caches invalidieren
                pattern = "stories:feed:*"
                keys = await self.redis.keys(pattern)
                if keys:
                    await self.redis.delete(*keys)
                    logger.debug(f"Alle Feed-Caches invalidiert: {len(keys)} Keys entfernt")
            
        except Exception as e:
            logger.error(f"Fehler beim Invalidieren des Feed-Cache: {e}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Cache-Statistiken abrufen"""
        try:
            stats = {
                "total_keys": 0,
                "feed_keys": 0,
                "story_keys": 0,
                "user_keys": 0,
                "stats_keys": 0,
                "memory_usage": 0
            }
            
            # Zähle verschiedene Cache-Typen
            patterns = {
                "feed_keys": "stories:feed:*",
                "story_keys": "stories:story:*",
                "user_keys": "stories:user:*",
                "stats_keys": "stories:stats:*"
            }
            
            for key, pattern in patterns.items():
                keys = await self.redis.keys(pattern)
                stats[key] = len(keys)
                stats["total_keys"] += len(keys)
            
            # Memory-Usage (falls verfügbar)
            try:
                info = await self.redis.info("memory")
                stats["memory_usage"] = info.get("used_memory_human", "N/A")
            except:
                stats["memory_usage"] = "N/A"
            
            return stats
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Cache-Statistiken: {e}")
            return {"error": str(e)}
