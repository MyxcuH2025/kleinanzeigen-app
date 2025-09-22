"""
Video-Processor-Modul für Stories
Trennt Video-Verarbeitung von den Routes
"""
import asyncio
import json
import logging
import shutil
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class VideoProcessor:
    """Hauptklasse für Video-Verarbeitung"""
    
    def __init__(self):
        self.ffmpeg_path = "ffmpeg"  # Standard FFmpeg-Pfad
    
    async def process_video_with_overlays(
        self, 
        video_path: Path, 
        text_overlays: Optional[str] = None, 
        sticker_overlays: Optional[str] = None
    ) -> Optional[Path]:
        """
        Verarbeitet Video mit Text- und Sticker-Overlays
        
        Args:
            video_path: Pfad zum Original-Video
            text_overlays: JSON-String mit Text-Overlay-Daten
            sticker_overlays: JSON-String mit Sticker-Overlay-Daten
            
        Returns:
            Pfad zum verarbeiteten Video oder None bei Fehler
        """
        try:
            # JSON-Daten parsen
            text_data = self._parse_json_data(text_overlays)
            sticker_data = self._parse_json_data(sticker_overlays)
            
            # FFmpeg-Filter generieren
            overlay_filter = self._generate_overlay_filter(text_data, sticker_data)
            
            if not overlay_filter:
                logger.warning("Keine Overlays zum Verarbeiten gefunden")
                return None
            
            # Temporäre Ausgabedatei
            temp_video_path = video_path.parent / f"temp_processed_{video_path.stem}.mp4"
            
            # FFmpeg-Command erstellen
            cmd = self._build_ffmpeg_command(video_path, temp_video_path, overlay_filter)
            
            # FFmpeg ausführen
            success = await self._execute_ffmpeg(cmd)
            
            if success and temp_video_path.exists():
                logger.info(f"Video mit Overlays erfolgreich verarbeitet: {temp_video_path}")
                return temp_video_path
            else:
                logger.error("FFmpeg-Verarbeitung fehlgeschlagen")
                return None
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler in process_video_with_overlays: {e}")
            logger.error(f"Fehler-Typ: {type(e).__name__}")
            logger.error(f"Fehler-Details: {str(e)}")
            return None
    
    def _parse_json_data(self, json_string: Optional[str]) -> List[Dict[str, Any]]:
        """Parst JSON-String zu Python-Dict"""
        if not json_string or json_string.strip() == 'null':
            return []
        
        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            logger.error(f"JSON-Parsing-Fehler: {e}")
            return []
    
    def _generate_overlay_filter(self, text_data: List[Dict], sticker_data: List[Dict]) -> str:
        """Generiert FFmpeg-Filter für Overlays"""
        filters = []
        
        # Text-Overlays hinzufügen
        for text_overlay in text_data:
            filter_text = self._create_text_filter(text_overlay)
            if filter_text:
                filters.append(filter_text)
        
        # Sticker-Overlays hinzufügen
        for sticker_overlay in sticker_data:
            filter_text = self._create_sticker_filter(sticker_overlay)
            if filter_text:
                filters.append(filter_text)
        
        if not filters:
            return ""
        
        # Filter mit Komma verbinden
        return ",".join(filters)
    
    def _create_text_filter(self, text_overlay: Dict[str, Any]) -> str:
        """Erstellt FFmpeg-Filter für Text-Overlay"""
        text = text_overlay.get('text', '').replace("'", "\\'").replace('"', '\\"')
        x = text_overlay.get('x', 0)
        y = text_overlay.get('y', 0)
        color = text_overlay.get('color', '#FFFFFF')
        size = text_overlay.get('size', 24)
        
        if text:
            # Windows-Pfad korrekt für FFmpeg formatieren (doppelte Backslashes)
            filter_text = f"drawtext=text='{text}':x={x}:y={y}:fontcolor={color}:fontsize={size}:fontfile=C\\\\:/Windows/Fonts/arial.ttf"
            logger.debug(f"Text-Overlay hinzugefügt: '{text}' bei ({x},{y}) Größe {size}")
            logger.debug(f"FFmpeg-Filter für Text: {filter_text}")
            return filter_text
        
        return ""
    
    def _create_sticker_filter(self, sticker_overlay: Dict[str, Any]) -> str:
        """Erstellt FFmpeg-Filter für Sticker-Overlay"""
        emoji = sticker_overlay.get('emoji', '')
        x = sticker_overlay.get('x', 0)
        y = sticker_overlay.get('y', 0)
        size = sticker_overlay.get('size', 32)
        
        if emoji:
            # Verwende einfache Text-Overlays statt Emojis (Windows-kompatibel)
            # Emojis werden als einfache Symbole dargestellt
            text_symbol = "●"  # Einfacher Punkt als Ersatz für Emojis
            # Windows-Pfad korrekt für FFmpeg formatieren (doppelte Backslashes)
            filter_text = f"drawtext=text='{text_symbol}':x={x}:y={y}:fontsize={size}:fontcolor=yellow:borderw=2:bordercolor=black:fontfile=C\\\\:/Windows/Fonts/arial.ttf"
            logger.debug(f"Sticker-Overlay hinzugefügt: {emoji} -> {text_symbol} bei ({x},{y}) Größe {size}")
            logger.debug(f"FFmpeg-Filter für Sticker: {filter_text}")
            return filter_text
        
        return ""
    
    def _build_ffmpeg_command(self, input_path: Path, output_path: Path, overlay_filter: str) -> List[str]:
        """Erstellt FFmpeg-Command"""
        cmd = [
            self.ffmpeg_path,
            "-i", str(input_path),
            "-vf", overlay_filter,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-y",  # Überschreiben ohne Nachfrage
            str(output_path)
        ]
        
        logger.debug(f"FFmpeg Command: {' '.join(cmd)}")
        return cmd
    
    async def _execute_ffmpeg(self, cmd: List[str]) -> bool:
        """Führt FFmpeg-Command aus"""
        try:
            # FFmpeg ausführen (Windows-kompatibel)
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                process_returncode = process.returncode
            except NotImplementedError as e:
                logger.error(f"NotImplementedError bei FFmpeg-Ausführung: {e}")
                # Fallback: Synchroner subprocess mit Unicode-Unterstützung
                import subprocess
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, encoding='utf-8', errors='replace')
                    stdout = result.stdout.encode('utf-8') if result.stdout else b""
                    stderr = result.stderr.encode('utf-8') if result.stderr else b""
                    process_returncode = result.returncode
                except Exception as fallback_error:
                    logger.error(f"Fallback subprocess auch fehlgeschlagen: {fallback_error}")
                    return False
            
            # Unicode-sichere Dekodierung für Windows
            try:
                stdout_text = stdout.decode('utf-8', errors='replace')
                stderr_text = stderr.decode('utf-8', errors='replace')
            except UnicodeDecodeError:
                stdout_text = stdout.decode('cp1252', errors='replace')
                stderr_text = stderr.decode('cp1252', errors='replace')
            
            logger.debug(f"FFmpeg stdout: {stdout_text}")
            logger.debug(f"FFmpeg stderr: {stderr_text}")
            
            if process_returncode == 0:
                logger.info("Video mit Overlays erfolgreich verarbeitet")
                return True
            else:
                logger.error(f"FFmpeg-Fehler bei Overlay-Verarbeitung (Return Code: {process_returncode})")
                logger.error(f"FFmpeg stderr: {stderr_text}")
                logger.error(f"FFmpeg stdout: {stdout_text}")
                return False
                
        except Exception as e:
            logger.error(f"Unerwarteter Fehler in _execute_ffmpeg: {e}")
            logger.error(f"Fehler-Typ: {type(e).__name__}")
            logger.error(f"Fehler-Details: {str(e)}")
            return False


class ThumbnailGenerator:
    """Klasse für Thumbnail-Generierung"""
    
    def __init__(self):
        self.ffmpeg_path = "ffmpeg"
    
    async def generate_video_thumbnail(self, video_path: Path, thumbnail_path: Path, time_offset: float = 1.0) -> bool:
        """
        Generiert Thumbnail für Video
        
        Args:
            video_path: Pfad zum Video
            thumbnail_path: Pfad für Thumbnail
            time_offset: Zeitpunkt für Thumbnail (in Sekunden)
            
        Returns:
            True bei Erfolg, False bei Fehler
        """
        try:
            cmd = [
                self.ffmpeg_path,
                "-i", str(video_path),
                "-ss", str(time_offset),
                "-vframes", "1",
                "-vf", "scale=400:400:force_original_aspect_ratio=decrease,pad=400:400:(ow-iw)/2:(oh-ih)/2",
                "-y",
                str(thumbnail_path)
            ]
            
            logger.debug(f"Thumbnail-Command: {' '.join(cmd)}")
            
            # FFmpeg ausführen
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                process_returncode = process.returncode
            except NotImplementedError:
                # Fallback: Synchroner subprocess
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace')
                stdout = result.stdout.encode('utf-8') if result.stdout else b""
                stderr = result.stderr.encode('utf-8') if result.stderr else b""
                process_returncode = result.returncode
            
            if process_returncode == 0 and thumbnail_path.exists():
                logger.info(f"Thumbnail erfolgreich generiert: {thumbnail_path}")
                return True
            else:
                logger.error(f"Thumbnail-Generierung fehlgeschlagen (Return Code: {process_returncode})")
                return False
                
        except Exception as e:
            logger.error(f"Fehler bei Video-Thumbnail-Generierung: {e}")
            logger.error(f"Thumbnail-Fehler Details: {type(e).__name__}: {str(e)}")
            return False
