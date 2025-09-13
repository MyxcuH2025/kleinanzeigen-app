"""
Event models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime

class Event(SQLModel, table=True):
    """Modell für Events/Veranstaltungen"""
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, description="Titel des Events")
    description: str = Field(max_length=2000, description="Beschreibung des Events")
    category: str = Field(max_length=100, description="Kategorie des Events")
    event_type: str = Field(max_length=50, description="Art des Events: concert, festival, workshop, etc.")
    start_date: datetime = Field(description="Startdatum und -zeit")
    end_date: datetime = Field(description="Enddatum und -zeit")
    location_name: str = Field(max_length=200, description="Name des Veranstaltungsorts")
    address: str = Field(max_length=500, description="Vollständige Adresse")
    city: str = Field(max_length=100, description="Stadt")
    postal_code: str = Field(max_length=10, description="PLZ")
    coordinates: Optional[str] = Field(default=None, max_length=100, description="GPS-Koordinaten")
    price: Optional[float] = Field(default=None, ge=0, description="Eintrittspreis in Euro")
    currency: str = Field(default="EUR", max_length=3, description="Währung")
    max_attendees: Optional[int] = Field(default=None, ge=1, description="Maximale Teilnehmerzahl")
    current_attendees: int = Field(default=0, ge=0, description="Aktuelle Teilnehmerzahl")
    images: str = Field(default="[]", description="JSON-Array mit Bild-URLs")
    banner: Optional[str] = Field(default=None, max_length=500, description="Banner-URL")
    tags: str = Field(default="[]", description="JSON-Array mit Tags")
    is_featured: bool = Field(default=False, description="Hervorgehobenes Event")
    is_free: bool = Field(default=False, description="Kostenloses Event")
    requires_registration: bool = Field(default=False, description="Anmeldung erforderlich")
    status: str = Field(default="upcoming", description="Status: draft, upcoming, ongoing, completed, cancelled")
    
    # Beziehungen
    organizer_id: int = Field(foreign_key="users.id", description="Veranstalter des Events")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def get_tags(self) -> List[str]:
        """Gibt die Tags als Liste zurück"""
        import json
        try:
            return json.loads(self.tags) if self.tags else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_tags(self, tags: List[str]):
        """Setzt die Tags aus einer Liste"""
        import json
        self.tags = json.dumps(tags)
