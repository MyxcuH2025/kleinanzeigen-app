"""
Indexing Service für Elasticsearch-Synchronisation
"""
import logging
from typing import Dict, Any, Optional, List
from sqlmodel import Session, select
from models import Listing, User
from app.search.elasticsearch_service import elasticsearch_service
from app.cache.decorators import CacheManager
import json

logger = logging.getLogger(__name__)

class IndexingService:
    """
    Service für automatische Elasticsearch-Indexierung
    """
    
    def __init__(self):
        self.elasticsearch = elasticsearch_service
    
    def index_listing(self, listing: Listing) -> bool:
        """Indexiere ein einzelnes Listing"""
        if not self.elasticsearch.is_available:
            logger.warning("Elasticsearch nicht verfügbar - Listing nicht indexiert")
            return False
        
        try:
            # Listing-Daten für Elasticsearch vorbereiten
            listing_data = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "category": listing.category,
                "condition": listing.condition,
                "location": listing.location,
                "price": listing.price,
                "attributes": json.loads(listing.attributes) if listing.attributes else {},
                "status": listing.status,
                "views": listing.views,
                "user_id": listing.user_id,
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
                "updated_at": listing.updated_at.isoformat() if listing.updated_at else None
            }
            
            # In Elasticsearch indexieren
            success = self.elasticsearch.index_listing(listing_data)
            
            if success:
                logger.info(f"✅ Listing {listing.id} erfolgreich indexiert")
            else:
                logger.error(f"❌ Fehler beim Indexieren des Listings {listing.id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Fehler beim Indexieren des Listings {listing.id}: {e}")
            return False
    
    def index_user(self, user: User) -> bool:
        """Indexiere einen einzelnen User"""
        if not self.elasticsearch.is_available:
            logger.warning("Elasticsearch nicht verfügbar - User nicht indexiert")
            return False
        
        try:
            # User-Daten für Elasticsearch vorbereiten
            user_data = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "display_name": user.display_name,
                "bio": user.bio,
                "location": user.location,
                "role": user.role,
                "verification_state": user.verification_state,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            
            # In Elasticsearch indexieren
            success = self.elasticsearch.index_user(user_data)
            
            if success:
                logger.info(f"✅ User {user.id} erfolgreich indexiert")
            else:
                logger.error(f"❌ Fehler beim Indexieren des Users {user.id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Fehler beim Indexieren des Users {user.id}: {e}")
            return False
    
    def delete_listing(self, listing_id: int) -> bool:
        """Lösche Listing aus Elasticsearch"""
        if not self.elasticsearch.is_available:
            logger.warning("Elasticsearch nicht verfügbar - Listing nicht gelöscht")
            return False
        
        try:
            success = self.elasticsearch.delete_listing(listing_id)
            
            if success:
                logger.info(f"✅ Listing {listing_id} erfolgreich aus Elasticsearch gelöscht")
            else:
                logger.error(f"❌ Fehler beim Löschen des Listings {listing_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Fehler beim Löschen des Listings {listing_id}: {e}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Lösche User aus Elasticsearch"""
        if not self.elasticsearch.is_available:
            logger.warning("Elasticsearch nicht verfügbar - User nicht gelöscht")
            return False
        
        try:
            success = self.elasticsearch.delete_user(user_id)
            
            if success:
                logger.info(f"✅ User {user_id} erfolgreich aus Elasticsearch gelöscht")
            else:
                logger.error(f"❌ Fehler beim Löschen des Users {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Fehler beim Löschen des Users {user_id}: {e}")
            return False
    
    def reindex_all_listings(self, session: Session, batch_size: int = 100) -> Dict[str, Any]:
        """Indexiere alle Listings neu (für Initial-Setup oder Re-Sync)"""
        if not self.elasticsearch.is_available:
            return {"success": False, "error": "Elasticsearch nicht verfügbar"}
        
        try:
            logger.info("🔄 Starte vollständige Re-Indexierung aller Listings...")
            
            # Zähle alle Listings
            total_count = session.exec(select(func.count(Listing.id))).one()
            logger.info(f"📊 {total_count} Listings gefunden")
            
            indexed_count = 0
            error_count = 0
            batch_count = 0
            
            # Batch-weise verarbeiten
            offset = 0
            while offset < total_count:
                # Batch von Listings laden
                listings = session.exec(
                    select(Listing)
                    .offset(offset)
                    .limit(batch_size)
                ).all()
                
                # Batch indexieren
                for listing in listings:
                    if self.index_listing(listing):
                        indexed_count += 1
                    else:
                        error_count += 1
                
                batch_count += 1
                offset += batch_size
                
                logger.info(f"📦 Batch {batch_count}: {indexed_count} indexiert, {error_count} Fehler")
            
            # Cache invalidieren
            CacheManager.invalidate_search_cache()
            
            logger.info(f"✅ Re-Indexierung abgeschlossen: {indexed_count} erfolgreich, {error_count} Fehler")
            
            return {
                "success": True,
                "total_listings": total_count,
                "indexed_count": indexed_count,
                "error_count": error_count,
                "batches_processed": batch_count
            }
            
        except Exception as e:
            logger.error(f"Fehler bei vollständiger Re-Indexierung: {e}")
            return {"success": False, "error": str(e)}
    
    def reindex_all_users(self, session: Session, batch_size: int = 100) -> Dict[str, Any]:
        """Indexiere alle Users neu (für Initial-Setup oder Re-Sync)"""
        if not self.elasticsearch.is_available:
            return {"success": False, "error": "Elasticsearch nicht verfügbar"}
        
        try:
            logger.info("🔄 Starte vollständige Re-Indexierung aller Users...")
            
            # Zähle alle aktiven Users
            total_count = session.exec(
                select(func.count(User.id)).where(User.is_active == True)
            ).one()
            logger.info(f"📊 {total_count} aktive Users gefunden")
            
            indexed_count = 0
            error_count = 0
            batch_count = 0
            
            # Batch-weise verarbeiten
            offset = 0
            while offset < total_count:
                # Batch von Users laden
                users = session.exec(
                    select(User)
                    .where(User.is_active == True)
                    .offset(offset)
                    .limit(batch_size)
                ).all()
                
                # Batch indexieren
                for user in users:
                    if self.index_user(user):
                        indexed_count += 1
                    else:
                        error_count += 1
                
                batch_count += 1
                offset += batch_size
                
                logger.info(f"📦 Batch {batch_count}: {indexed_count} indexiert, {error_count} Fehler")
            
            logger.info(f"✅ User-Re-Indexierung abgeschlossen: {indexed_count} erfolgreich, {error_count} Fehler")
            
            return {
                "success": True,
                "total_users": total_count,
                "indexed_count": indexed_count,
                "error_count": error_count,
                "batches_processed": batch_count
            }
            
        except Exception as e:
            logger.error(f"Fehler bei vollständiger User-Re-Indexierung: {e}")
            return {"success": False, "error": str(e)}
    
    def get_indexing_stats(self) -> Dict[str, Any]:
        """Hole Indexing-Statistiken"""
        if not self.elasticsearch.is_available:
            return {"elasticsearch_available": False}
        
        try:
            es_stats = self.elasticsearch.get_stats()
            
            return {
                "elasticsearch_available": True,
                "elasticsearch_stats": es_stats,
                "indexing_service_status": "active"
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Indexing-Statistiken: {e}")
            return {
                "elasticsearch_available": False,
                "error": str(e)
            }

# Globale Indexing-Service-Instanz
indexing_service = IndexingService()
