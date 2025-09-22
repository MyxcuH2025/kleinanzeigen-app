"""
Stories-Validierungs-Modul
Trennt Validierungslogik von den Routes
"""
from fastapi import HTTPException, UploadFile
from typing import Optional

class StoriesValidator:
    """Validierungsklasse für Stories-Inputs"""
    
    # Konstante für Upload-Limits
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    MAX_CAPTION_LENGTH = 500
    MIN_DURATION = 1
    MAX_DURATION = 60
    
    @classmethod
    def validate_file_size(cls, media: UploadFile) -> None:
        """Validiert Dateigröße"""
        if media.size and media.size > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Datei zu groß. Maximum: {cls.MAX_FILE_SIZE // (1024*1024)}MB"
            )
    
    @classmethod
    def validate_file_type(cls, media: UploadFile) -> None:
        """Validiert Dateityp"""
        if media.content_type not in cls.ALLOWED_MEDIA_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Nicht unterstützter Dateityp. Erlaubt: {', '.join(cls.ALLOWED_MEDIA_TYPES)}"
            )
    
    @classmethod
    def validate_duration(cls, duration: Optional[int]) -> None:
        """Validiert Story-Dauer"""
        if duration and (duration < cls.MIN_DURATION or duration > cls.MAX_DURATION):
            raise HTTPException(
                status_code=400,
                detail=f"Story-Dauer muss zwischen {cls.MIN_DURATION} und {cls.MAX_DURATION} Sekunden liegen"
            )
    
    @classmethod
    def validate_caption(cls, caption: Optional[str]) -> None:
        """Validiert Caption-Länge"""
        if caption and len(caption) > cls.MAX_CAPTION_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Caption zu lang. Maximum: {cls.MAX_CAPTION_LENGTH} Zeichen"
            )
    
    @classmethod
    def validate_story_inputs(cls, media: UploadFile, caption: Optional[str], duration: Optional[int]) -> None:
        """Validiert alle Story-Inputs auf einmal"""
        cls.validate_file_size(media)
        cls.validate_file_type(media)
        cls.validate_caption(caption)
        cls.validate_duration(duration)
