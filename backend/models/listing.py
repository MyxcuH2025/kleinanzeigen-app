"""
Listing models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict, List
from datetime import datetime
from .enums import ListingStatus

class Listing(SQLModel, table=True):
    """Universelles Listing-Modell für Autos und Kleinanzeigen"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Grundlegende Felder (immer erforderlich)
    title: str = Field(max_length=200, description="Titel der Anzeige")
    description: str = Field(max_length=2000, description="Beschreibung")
    category: str = Field(max_length=50, description="Hauptkategorie: autos oder kleinanzeigen")
    condition: Optional[str] = Field(default=None, max_length=50, description="Zustand: Neu, Gebraucht, Defekt")
    location: str = Field(max_length=100, description="Standort")
    price: Optional[float] = Field(default=None, ge=0, description="Preis in Euro")
    
    # Dynamische Attribute für kategoriespezifische Felder
    attributes: str = Field(default="{}", description="JSON-String mit kategoriespezifischen Attributen")
    
    # Bilder und Status
    images: str = Field(default="[]", description="JSON-Array mit Bild-URLs")
    status: ListingStatus = Field(default=ListingStatus.ACTIVE)
    views: int = Field(default=0)
    highlighted: bool = Field(default=False, description="Ist die Anzeige hervorgehoben?")
    
    # Beziehungen
    user_id: int = Field(foreign_key="users.id")
    seller: Optional["User"] = Relationship(back_populates="listings")
    shop_id: Optional[int] = Field(default=None, foreign_key="shop.id")
    shop: Optional["Shop"] = Relationship(back_populates="listings")
    favorites: List["Favorite"] = Relationship(back_populates="listing")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def get_attributes(self) -> Dict[str, any]:
        """Gibt die Attribute als Dictionary zurück"""
        import json
        try:
            return json.loads(self.attributes) if self.attributes else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_attributes(self, attributes: Dict[str, any]):
        """Setzt die Attribute aus einem Dictionary"""
        import json
        self.attributes = json.dumps(attributes)

class ListingCreate(SQLModel):
    """Model für das Erstellen von Anzeigen"""
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str = Field(..., max_length=50)
    condition: Optional[str] = Field(default=None, max_length=50)
    location: str = Field(..., max_length=100)
    price: Optional[float] = Field(default=None, ge=0)
    attributes: Optional[Dict] = Field(default={})
    images: Optional[List[str]] = Field(default=[])

class ListingUpdate(SQLModel):
    """Model für das Aktualisieren von Anzeigen"""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    condition: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    status: Optional[ListingStatus] = Field(None)
    attributes: Optional[Dict] = Field(None)
    images: Optional[List[str]] = Field(None)

class ListingResponse(SQLModel):
    """Model für API-Responses"""
    id: int
    title: str
    description: str
    category: str
    condition: Optional[str]
    location: str
    price: Optional[float]
    attributes: Dict
    images: List[str]
    status: ListingStatus
    views: int
    user_id: int
    created_at: datetime
    updated_at: datetime

# ============================================================================
# KATEGORIE-SPEZIFISCHE ATTRIBUTE (nach dem Plan)
# ============================================================================

# Auto-spezifische Attribute
AUTO_ATTRIBUTES = {
    "marke": "string",  # BMW, Mercedes, Audi, etc.
    "modell": "string",  # 3er, C-Klasse, A4, etc.
    "erstzulassung": "integer",  # 2020, 2019, etc.
    "kilometerstand": "integer",  # 50000, 100000, etc.
    "kraftstoff": "string",  # Benzin, Diesel, Elektro, Hybrid
    "getriebe": "string",  # Manuell, Automatik
    "farbe": "string",  # Schwarz, Weiß, Blau, etc.
    "leistung": "integer",  # PS
    "unfallfrei": "boolean"  # true/false
}

# Kleinanzeigen-spezifische Attribute
KLEINANZEIGEN_ATTRIBUTES = {
    "kategorie": "string",  # Elektronik, Möbel, Kleidung, etc.
    "zustand": "string",  # Neu, Gebraucht, Defekt
    "versand": "boolean",  # true/false
    "garantie": "boolean",  # true/false
    "abholung": "boolean",  # true/false
    "verhandelbar": "boolean"  # true/false
}

def get_category_attributes(category: str) -> Dict[str, str]:
    """Gibt die Attribute für eine Kategorie zurück"""
    if category == "autos":
        return AUTO_ATTRIBUTES
    elif category == "kleinanzeigen":
        return KLEINANZEIGEN_ATTRIBUTES
    else:
        return {}
