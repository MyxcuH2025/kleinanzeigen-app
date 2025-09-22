"""
Media-Processor-Modul für Stories
Trennt Media-Upload und File-Management von den Routes
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class MediaProcessor:
    """Hauptklasse für Media-Verarbeitung"""
    
    def __init__(self, upload_dir: Path):
        self.upload_dir = upload_dir
        self.ensure_upload_dir()
    
    def ensure_upload_dir(self) -> None:
        """Stellt sicher, dass Upload-Verzeichnis existiert"""
        if not self.upload_dir.exists():
            self.upload_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Upload-Verzeichnis erstellt: {self.upload_dir}")
    
    def save_uploaded_file(self, media, filename: str) -> Tuple[Path, str]:
        """
        Speichert hochgeladene Datei
        
        Args:
            media: UploadFile-Objekt
            filename: Gewünschter Dateiname
            
        Returns:
            Tuple von (file_path, media_url)
        """
        try:
            # Eindeutige Datei-ID generieren
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix
            unique_filename = f"{file_id}{file_extension}"
            
            # Vollständiger Pfad
            file_path = self.upload_dir / unique_filename
            
            # Datei speichern
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(media.file, buffer)
            
            # Media-URL generieren
            media_url = f"/api/images/stories/{unique_filename}"
            
            logger.info(f"Datei erfolgreich gespeichert: {unique_filename}")
            return file_path, media_url
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Datei: {e}")
            raise
    
    def get_media_type(self, file_path: Path) -> str:
        """
        Bestimmt Media-Typ basierend auf Dateierweiterung
        
        Args:
            file_path: Pfad zur Datei
            
        Returns:
            Media-Typ ('image' oder 'video')
        """
        extension = file_path.suffix.lower()
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv'}
        
        if extension in image_extensions:
            return "image"
        elif extension in video_extensions:
            return "video"
        else:
            raise ValueError(f"Unbekannter Dateityp: {extension}")
    
    def get_file_size(self, file_path: Path) -> int:
        """
        Gibt Dateigröße in Bytes zurück
        
        Args:
            file_path: Pfad zur Datei
            
        Returns:
            Dateigröße in Bytes
        """
        try:
            return file_path.stat().st_size
        except Exception as e:
            logger.error(f"Fehler beim Ermitteln der Dateigröße: {e}")
            return 0
    
    def move_processed_file(self, source_path: Path, target_filename: str) -> Path:
        """
        Verschiebt verarbeitete Datei an Zielort
        
        Args:
            source_path: Quellpfad
            target_filename: Ziel-Dateiname
            
        Returns:
            Zielpfad
        """
        try:
            target_path = self.upload_dir / target_filename
            shutil.move(str(source_path), str(target_path))
            
            logger.info(f"Verarbeitete Datei verschoben: {target_filename}")
            return target_path
            
        except Exception as e:
            logger.error(f"Fehler beim Verschieben der Datei: {e}")
            raise
    
    def delete_file(self, file_path: Path) -> bool:
        """
        Löscht Datei
        
        Args:
            file_path: Pfad zur zu löschenden Datei
            
        Returns:
            True bei Erfolg, False bei Fehler
        """
        try:
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Datei gelöscht: {file_path.name}")
                return True
            else:
                logger.warning(f"Datei existiert nicht: {file_path.name}")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Löschen der Datei: {e}")
            return False
    
    def cleanup_temp_files(self, file_pattern: str = "temp_*") -> int:
        """
        Bereinigt temporäre Dateien
        
        Args:
            file_pattern: Datei-Muster für Bereinigung
            
        Returns:
            Anzahl gelöschter Dateien
        """
        try:
            deleted_count = 0
            for file_path in self.upload_dir.glob(file_pattern):
                if file_path.is_file():
                    file_path.unlink()
                    deleted_count += 1
                    logger.debug(f"Temporäre Datei gelöscht: {file_path.name}")
            
            if deleted_count > 0:
                logger.info(f"{deleted_count} temporäre Dateien bereinigt")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Fehler bei der Bereinigung temporärer Dateien: {e}")
            return 0


class PathManager:
    """Klasse für Pfad-Management"""
    
    @staticmethod
    def generate_unique_filename(original_filename: str, prefix: str = "") -> str:
        """
        Generiert eindeutigen Dateinamen
        
        Args:
            original_filename: Ursprünglicher Dateiname
            prefix: Optionaler Präfix
            
        Returns:
            Eindeutiger Dateiname
        """
        file_id = str(uuid.uuid4())
        file_extension = Path(original_filename).suffix
        
        if prefix:
            return f"{prefix}_{file_id}{file_extension}"
        else:
            return f"{file_id}{file_extension}"
    
    @staticmethod
    def get_processed_filename(original_filename: str) -> str:
        """
        Generiert Dateiname für verarbeitete Datei
        
        Args:
            original_filename: Ursprünglicher Dateiname
            
        Returns:
            Dateiname für verarbeitete Datei
        """
        return f"processed_{original_filename}"
    
    @staticmethod
    def get_thumbnail_filename(video_filename: str) -> str:
        """
        Generiert Thumbnail-Dateiname
        
        Args:
            video_filename: Video-Dateiname
            
        Returns:
            Thumbnail-Dateiname
        """
        video_stem = Path(video_filename).stem
        return f"thumb_{video_stem}.jpg"
    
    @staticmethod
    def ensure_directory(path: Path) -> None:
        """
        Stellt sicher, dass Verzeichnis existiert
        
        Args:
            path: Pfad zum Verzeichnis
        """
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Verzeichnis erstellt: {path}")


class FileValidator:
    """Klasse für Datei-Validierung"""
    
    # Konstante für Upload-Limits
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
    ALLOWED_VIDEO_TYPES = {'video/mp4'}
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.mp4'}
    
    @classmethod
    def validate_file_size(cls, file_size: int) -> bool:
        """
        Validiert Dateigröße
        
        Args:
            file_size: Dateigröße in Bytes
            
        Returns:
            True wenn gültig, False wenn zu groß
        """
        return file_size <= cls.MAX_FILE_SIZE
    
    @classmethod
    def validate_file_type(cls, content_type: str) -> bool:
        """
        Validiert Dateityp
        
        Args:
            content_type: MIME-Type der Datei
            
        Returns:
            True wenn gültig, False wenn nicht unterstützt
        """
        return content_type in (cls.ALLOWED_IMAGE_TYPES | cls.ALLOWED_VIDEO_TYPES)
    
    @classmethod
    def validate_file_extension(cls, filename: str) -> bool:
        """
        Validiert Dateierweiterung
        
        Args:
            filename: Dateiname
            
        Returns:
            True wenn gültig, False wenn nicht unterstützt
        """
        extension = Path(filename).suffix.lower()
        return extension in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def get_file_type_category(cls, content_type: str) -> Optional[str]:
        """
        Bestimmt Dateityp-Kategorie
        
        Args:
            content_type: MIME-Type der Datei
            
        Returns:
            'image', 'video' oder None
        """
        if content_type in cls.ALLOWED_IMAGE_TYPES:
            return "image"
        elif content_type in cls.ALLOWED_VIDEO_TYPES:
            return "video"
        else:
            return None
