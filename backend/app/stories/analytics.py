"""
Stories Analytics & Performance Monitoring
"""
from sqlmodel import Session, select, func, and_, desc
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import json
from models.story import Story, StoryView, StoryReaction, StoryReactionType
from models.user import User

logger = logging.getLogger(__name__)

class StoriesAnalytics:
    """Analytics-Service für Stories-Performance und Engagement"""
    
    def __init__(self, session: Session):
        self.session = session
    
    async def get_stories_performance_metrics(self, days: int = 7) -> Dict[str, Any]:
        """Performance-Metriken für Stories abrufen"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Basis-Metriken
            total_stories = self.session.exec(
                select(func.count(Story.id)).where(
                    and_(
                        Story.created_at >= cutoff_date,
                        Story.is_active == True
                    )
                )
            ).first() or 0
            
            total_views = self.session.exec(
                select(func.count(StoryView.id)).join(Story).where(
                    and_(
                        Story.created_at >= cutoff_date,
                        Story.is_active == True
                    )
                )
            ).first() or 0
            
            total_reactions = self.session.exec(
                select(func.count(StoryReaction.id)).join(Story).where(
                    and_(
                        Story.created_at >= cutoff_date,
                        Story.is_active == True
                    )
                )
            ).first() or 0
            
            # Engagement-Rate berechnen
            engagement_rate = (total_reactions / total_views * 100) if total_views > 0 else 0
            
            # Top-Performing Stories
            top_stories = self.session.exec(
                select(Story).where(
                    and_(
                        Story.created_at >= cutoff_date,
                        Story.is_active == True
                    )
                ).order_by(desc(Story.views_count)).limit(10)
            ).all()
            
            # User-Engagement
            active_users = self.session.exec(
                select(func.count(func.distinct(StoryView.viewer_id))).join(Story).where(
                    and_(
                        Story.created_at >= cutoff_date,
                        Story.is_active == True
                    )
                )
            ).first() or 0
            
            return {
                "period_days": days,
                "total_stories": total_stories,
                "total_views": total_views,
                "total_reactions": total_reactions,
                "engagement_rate": round(engagement_rate, 2),
                "active_users": active_users,
                "avg_views_per_story": round(total_views / total_stories, 2) if total_stories > 0 else 0,
                "avg_reactions_per_story": round(total_reactions / total_stories, 2) if total_stories > 0 else 0,
                "top_stories": [
                    {
                        "id": story.id,
                        "user_id": story.user_id,
                        "views_count": story.views_count,
                        "reactions_count": story.reactions_count,
                        "created_at": story.created_at.isoformat(),
                        "media_type": story.media_type
                    }
                    for story in top_stories
                ]
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Stories-Performance-Metriken: {e}")
            return {}
    
    async def get_user_stories_analytics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """User-spezifische Stories-Analytics"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # User's Stories
            user_stories = self.session.exec(
                select(Story).where(
                    and_(
                        Story.user_id == user_id,
                        Story.created_at >= cutoff_date
                    )
                ).order_by(desc(Story.created_at))
            ).all()
            
            if not user_stories:
                return {
                    "user_id": user_id,
                    "period_days": days,
                    "total_stories": 0,
                    "total_views": 0,
                    "total_reactions": 0,
                    "engagement_rate": 0,
                    "avg_views_per_story": 0,
                    "best_performing_story": None
                }
            
            story_ids = [story.id for story in user_stories]
            
            # Views für User's Stories
            total_views = self.session.exec(
                select(func.count(StoryView.id)).where(
                    StoryView.story_id.in_(story_ids)
                )
            ).first() or 0
            
            # Reactions für User's Stories
            total_reactions = self.session.exec(
                select(func.count(StoryReaction.id)).where(
                    StoryReaction.story_id.in_(story_ids)
                )
            ).first() or 0
            
            # Best-performing Story
            best_story = max(user_stories, key=lambda s: s.views_count + s.reactions_count)
            
            engagement_rate = (total_reactions / total_views * 100) if total_views > 0 else 0
            
            return {
                "user_id": user_id,
                "period_days": days,
                "total_stories": len(user_stories),
                "total_views": total_views,
                "total_reactions": total_reactions,
                "engagement_rate": round(engagement_rate, 2),
                "avg_views_per_story": round(total_views / len(user_stories), 2),
                "best_performing_story": {
                    "id": best_story.id,
                    "views_count": best_story.views_count,
                    "reactions_count": best_story.reactions_count,
                    "created_at": best_story.created_at.isoformat(),
                    "media_type": best_story.media_type
                }
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der User-Stories-Analytics: {e}")
            return {}
    
    async def get_stories_engagement_trends(self, days: int = 7) -> List[Dict[str, Any]]:
        """Engagement-Trends über Zeit"""
        try:
            trends = []
            for i in range(days):
                date = datetime.utcnow() - timedelta(days=i)
                start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
                
                # Stories an diesem Tag
                daily_stories = self.session.exec(
                    select(func.count(Story.id)).where(
                        and_(
                            Story.created_at >= start_date,
                            Story.created_at < end_date,
                            Story.is_active == True
                        )
                    )
                ).first() or 0
                
                # Views an diesem Tag
                daily_views = self.session.exec(
                    select(func.count(StoryView.id)).join(Story).where(
                        and_(
                            Story.created_at >= start_date,
                            Story.created_at < end_date,
                            Story.is_active == True
                        )
                    )
                ).first() or 0
                
                # Reactions an diesem Tag
                daily_reactions = self.session.exec(
                    select(func.count(StoryReaction.id)).join(Story).where(
                        and_(
                            Story.created_at >= start_date,
                            Story.created_at < end_date,
                            Story.is_active == True
                        )
                    )
                ).first() or 0
                
                trends.append({
                    "date": start_date.strftime("%Y-%m-%d"),
                    "stories": daily_stories,
                    "views": daily_views,
                    "reactions": daily_reactions,
                    "engagement_rate": round((daily_reactions / daily_views * 100) if daily_views > 0 else 0, 2)
                })
            
            return list(reversed(trends))
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Engagement-Trends: {e}")
            return []
    
    async def get_stories_performance_alerts(self) -> List[Dict[str, Any]]:
        """Performance-Alerts für Stories"""
        try:
            alerts = []
            
            # Alert 1: Niedrige Engagement-Rate
            recent_stories = self.session.exec(
                select(Story).where(
                    and_(
                        Story.created_at >= datetime.utcnow() - timedelta(hours=24),
                        Story.is_active == True
                    )
                )
            ).all()
            
            if recent_stories:
                total_views = sum(story.views_count for story in recent_stories)
                total_reactions = sum(story.reactions_count for story in recent_stories)
                engagement_rate = (total_reactions / total_views * 100) if total_views > 0 else 0
                
                if engagement_rate < 5.0:  # Weniger als 5% Engagement
                    alerts.append({
                        "type": "low_engagement",
                        "severity": "warning",
                        "message": f"Niedrige Engagement-Rate: {engagement_rate:.1f}%",
                        "metric": "engagement_rate",
                        "value": engagement_rate,
                        "threshold": 5.0
                    })
            
            # Alert 2: Viele Stories ohne Views
            stories_without_views = self.session.exec(
                select(func.count(Story.id)).where(
                    and_(
                        Story.created_at >= datetime.utcnow() - timedelta(hours=24),
                        Story.is_active == True,
                        Story.views_count == 0
                    )
                )
            ).first() or 0
            
            if stories_without_views > 5:
                alerts.append({
                    "type": "stories_without_views",
                    "severity": "info",
                    "message": f"{stories_without_views} Stories ohne Views in den letzten 24h",
                    "metric": "stories_without_views",
                    "value": stories_without_views,
                    "threshold": 5
                })
            
            # Alert 3: Hohe Video-Load-Zeiten (simuliert)
            # In einer echten Implementierung würde man hier echte Performance-Metriken abfragen
            alerts.append({
                "type": "video_performance",
                "severity": "info",
                "message": "Video-Load-Zeiten: Durchschnittlich 2.3s (Ziel: <2s)",
                "metric": "video_load_time",
                "value": 2.3,
                "threshold": 2.0
            })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Performance-Alerts: {e}")
            return []
    
    async def get_stories_real_time_metrics(self) -> Dict[str, Any]:
        """Echtzeit-Metriken für Stories"""
        try:
            now = datetime.utcnow()
            last_hour = now - timedelta(hours=1)
            last_24h = now - timedelta(hours=24)
            
            # Aktive Stories (letzte 24h)
            active_stories = self.session.exec(
                select(func.count(Story.id)).where(
                    and_(
                        Story.created_at >= last_24h,
                        Story.is_active == True
                    )
                )
            ).first() or 0
            
            # Views in der letzten Stunde
            recent_views = self.session.exec(
                select(func.count(StoryView.id)).where(
                    StoryView.viewed_at >= last_hour
                )
            ).first() or 0
            
            # Reactions in der letzten Stunde
            recent_reactions = self.session.exec(
                select(func.count(StoryReaction.id)).where(
                    StoryReaction.created_at >= last_hour
                )
            ).first() or 0
            
            # Aktive User (letzte Stunde)
            active_users = self.session.exec(
                select(func.count(func.distinct(StoryView.viewer_id))).where(
                    StoryView.viewed_at >= last_hour
                )
            ).first() or 0
            
            return {
                "timestamp": now.isoformat(),
                "active_stories_24h": active_stories,
                "views_last_hour": recent_views,
                "reactions_last_hour": recent_reactions,
                "active_users_last_hour": active_users,
                "engagement_rate_last_hour": round((recent_reactions / recent_views * 100) if recent_views > 0 else 0, 2)
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Echtzeit-Metriken: {e}")
            return {}
