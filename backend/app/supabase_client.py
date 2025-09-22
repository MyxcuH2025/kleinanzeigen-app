"""
Supabase Storage Client für Kleinanzeigen-Plattform
Optimiert für 40.000+ User
"""

import os
import logging
from typing import Optional, Dict, Any
from supabase import create_client, Client
from config import config

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    """Supabase Storage Service für Bild-Uploads und -Verwaltung"""
    
    def __init__(self):
        """Initialisiere Supabase-Client"""
        self.client: Optional[Client] = None
        self.bucket_name = "kleinanzeigen-images"
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialisiere Supabase-Client mit Konfiguration"""
        try:
            # Supabase-URL und Key aus Umgebungsvariablen
            supabase_url = os.getenv("SUPABASE_URL", "https://hcwilqiczkmesxmetprm.supabase.co")
            supabase_key = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd2lscWljemttZXN4bWV0cHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjc1ODQsImV4cCI6MjA3MzIwMzU4NH0.3nCn2FyAVXQ4tltfrSL6VfedKsIS3nRPgADapYPGnI8")
            
            if not supabase_key:
                logger.warning("SUPABASE_KEY nicht gesetzt - Storage deaktiviert")
                return
            
            # Supabase-Client erstellen
            self.client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase-Client erfolgreich initialisiert")
            
            # Bucket erstellen falls nicht vorhanden
            self._ensure_bucket_exists()
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Initialisieren des Supabase-Clients: {e}")
            self.client = None
    
    def _ensure_bucket_exists(self):
        """Stelle sicher, dass der Storage-Bucket existiert"""
        if not self.client:
            return
        
        try:
            # Prüfe ob Bucket existiert
            buckets = self.client.storage.list_buckets()
            bucket_names = [bucket.name for bucket in buckets]
            
            if self.bucket_name not in bucket_names:
                # Bucket erstellen
                self.client.storage.create_bucket(
                    self.bucket_name,
                    options={"public": True}
                )
                logger.info(f"✅ Bucket '{self.bucket_name}' erstellt")
            else:
                logger.info(f"✅ Bucket '{self.bucket_name}' existiert bereits")
                
        except Exception as e:
            logger.error(f"❌ Fehler beim Erstellen des Buckets: {e}")
    
    def upload_image(self, file_content: bytes, filename: str, content_type: str = "image/jpeg") -> Optional[str]:
        """Lade ein Bild zu Supabase Storage hoch"""
        if not self.client:
            logger.warning("Supabase-Client nicht verfügbar")
            return None
        
        try:
            # Upload zu Supabase Storage
            result = self.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            if result.get("error"):
                logger.error(f"❌ Upload-Fehler: {result['error']}")
                return None
            
            # Öffentliche URL generieren
            public_url = f"{os.getenv('SUPABASE_URL', 'https://hcwilqiczkmesxmetprm.supabase.co')}/storage/v1/object/public/{self.bucket_name}/{filename}"
            logger.info(f"✅ Bild erfolgreich hochgeladen: {filename}")
            
            return public_url
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Upload: {e}")
            return None
    
    def delete_image(self, filename: str) -> bool:
        """Lösche ein Bild aus Supabase Storage"""
        if not self.client:
            return False
        
        try:
            result = self.client.storage.from_(self.bucket_name).remove([filename])
            
            if result.get("error"):
                logger.error(f"❌ Lösch-Fehler: {result['error']}")
                return False
            
            logger.info(f"✅ Bild gelöscht: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Löschen: {e}")
            return False
    
    def get_image_url(self, filename: str) -> str:
        """Generiere öffentliche URL für ein Bild"""
        if not self.client:
            # Fallback auf lokalen Server
            return f"http://localhost:8000/api/images/{filename}"
        
        try:
            return self.client.storage.from_(self.bucket_name).get_public_url(filename)
        except Exception as e:
            logger.error(f"❌ Fehler beim Generieren der URL: {e}")
            return f"http://localhost:8000/api/images/{filename}"
    
    def list_images(self, folder: str = "") -> list:
        """Liste alle Bilder in einem Ordner"""
        if not self.client:
            return []
        
        try:
            result = self.client.storage.from_(self.bucket_name).list(folder)
            return [item["name"] for item in result if item["name"].endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]
        except Exception as e:
            logger.error(f"❌ Fehler beim Auflisten: {e}")
            return []
    
    def is_available(self) -> bool:
        """Prüfe ob Supabase Storage verfügbar ist"""
        return self.client is not None

# Globale Instanz
supabase_storage = SupabaseStorageService()
