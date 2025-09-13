from sqlmodel import SQLModel, Field, Relationship, Index
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================

class ListingStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SOLD = "sold"

class UserRole(str, Enum):
    USER = "USER"
    SELLER = "SELLER"  # NEU: Verkäufer-Rolle
    ADMIN = "ADMIN"

class VerificationState(str, Enum):
    UNVERIFIED = "unverified"           # Registriert, aber E-Mail nicht bestätigt
    EMAIL_VERIFIED = "email_verified"   # E-Mail bestätigt, Basisfeatures erlaubt
    SELLER_PENDING = "seller_pending"   # Verifizierungsantrag gestellt, Prüfung läuft
    SELLER_VERIFIED = "seller_verified" # Geprüft und akzeptiert → bekommt Badge
    SELLER_REVOKED = "seller_revoked"   # Verifizierung entzogen (Dokument abgelaufen oder Verstoß)
    BANNED = "banned"                   # Gesperrt

# ============================================================================
# USER MODEL
# ============================================================================

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    role: UserRole = Field(default=UserRole.USER)
    verification_state: VerificationState = Field(default=VerificationState.UNVERIFIED)
    
    # Verifizierungs-Timestamps
    email_verified_at: Optional[datetime] = Field(default=None)
    seller_verified_at: Optional[datetime] = Field(default=None)
    seller_verification_reason: Optional[str] = Field(default=None, max_length=500)
    
    # Profil-Felder (falls nicht vorhanden)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    bio: Optional[str] = Field(default=None, max_length=500)
    location: Optional[str] = Field(default=None, max_length=100)
    website: Optional[str] = Field(default=None, max_length=200)
    avatar: Optional[str] = Field(default=None, max_length=500)
    preferences: Optional[str] = Field(default="{}")  # JSON-String
    notification_settings: Optional[str] = Field(default="{}")  # JSON-String
    privacy_settings: Optional[str] = Field(default="{}")  # JSON-String
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = Field(default=None)  # Für Online-Status
    
    # Beziehungen
    listings: List["Listing"] = Relationship(back_populates="seller")
    favorites: List["Favorite"] = Relationship(back_populates="user")
    # conversations: List["Conversation"] = Relationship(back_populates="user1")  # Temporär deaktiviert wegen AmbiguousForeignKeysError
    # conversations2: List["Conversation"] = Relationship(back_populates="user2")  # Temporär deaktiviert wegen AmbiguousForeignKeysError
    messages: List["Message"] = Relationship(back_populates="sender")
    reports: List["Report"] = Relationship(back_populates="reporter")
    # ratings: List["Rating"] = Relationship(back_populates="rater")  # Temporär deaktiviert wegen AmbiguousForeignKeysError
    # seller_verifications: List["SellerVerification"] = Relationship(back_populates="user")  # Temporär deaktiviert wegen AmbiguousForeignKeysError
    shops: List["Shop"] = Relationship(back_populates="owner")
    shop_reviews: List["ShopReview"] = Relationship(back_populates="user")

# ============================================================================
# SELLER VERIFICATION MODEL
# ============================================================================

class SellerVerification(SQLModel, table=True):
    """Modell für Verkäufer-Verifizierung"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    # Verifizierungsdetails
    verification_type: str = Field(max_length=50, description="private, shop, service")
    company_name: Optional[str] = Field(default=None, max_length=200)
    tax_id: Optional[str] = Field(default=None, max_length=50)
    
    # Dokumente (verschlüsselt gespeichert)
    documents: str = Field(default="[]", description="JSON-Array mit Dokument-URLs")
    document_types: str = Field(default="[]", description="JSON-Array mit Dokument-Typen")
    
    # Status und Admin-Notizen
    status: str = Field(default="pending", description="pending, approved, rejected")
    admin_notes: Optional[str] = Field(default=None, max_length=1000)
    rejection_reason: Optional[str] = Field(default=None, max_length=500)
    
    # Timestamps
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = Field(default=None)
    reviewed_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Beziehungen (temporär deaktiviert wegen AmbiguousForeignKeysError)
    # user: Optional["User"] = Relationship(back_populates="seller_verifications")
    
    def get_documents(self) -> List[str]:
        """Gibt die Dokumente als Liste zurück"""
        import json
        try:
            return json.loads(self.documents) if self.documents else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_documents(self, documents: List[str]):
        """Setzt die Dokumente aus einer Liste"""
        import json
        self.documents = json.dumps(documents)
    
    def get_document_types(self) -> List[str]:
        """Gibt die Dokument-Typen als Liste zurück"""
        import json
        try:
            return json.loads(self.document_types) if self.document_types else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_document_types(self, document_types: List[str]):
        """Setzt die Dokument-Typen aus einer Liste"""
        import json
        self.document_types = json.dumps(document_types)

# ============================================================================
# LISTING MODEL (nach dem Plan)
# ============================================================================

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
    user_id: int = Field(foreign_key="user.id")
    seller: Optional["User"] = Relationship(back_populates="listings")
    shop_id: Optional[int] = Field(default=None, foreign_key="shop.id")
    shop: Optional["Shop"] = Relationship(back_populates="listings")
    favorites: List["Favorite"] = Relationship(back_populates="listing")
    
    # Category-Relationships (temporär deaktiviert bis Migration)
    # category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    # category_obj: Optional["Category"] = Relationship(back_populates="listings")
    # subcategory_id: Optional[int] = Field(default=None, foreign_key="subcategory.id")
    # subcategory_obj: Optional["Subcategory"] = Relationship(back_populates="listings")
    
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

# ============================================================================
# FAVORITE MODEL
# ============================================================================

class Favorite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    listing_id: int = Field(foreign_key="listing.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen
    user: Optional["User"] = Relationship(back_populates="favorites")
    listing: Optional["Listing"] = Relationship(back_populates="favorites")

# ============================================================================
# EVENT MODEL
# ============================================================================

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
    organizer_id: int = Field(foreign_key="user.id", description="Veranstalter des Events")
    
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





# ============================================================================
# PYDANTIC MODELS FÜR API
# ============================================================================

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

# ============================================================================
# TEMPLATE MODELS
# ============================================================================

class TemplateFolder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str = Field(max_length=100)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Template(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(max_length=200)
    description: str = Field(max_length=2000)
    category: str = Field(max_length=50)  # "autos" oder "kleinanzeigen"
    condition: Optional[str] = Field(default=None, max_length=50)
    location: str = Field(max_length=100)
    price: Optional[float] = Field(default=None, ge=0)
    
    # Dynamische Attribute je nach Kategorie
    attributes: str = Field(default="{}")  # JSON string für dynamische Felder
    
    # Zusätzliche Details
    images: str = Field(default="[]")  # JSON array
    status: str = Field(default="draft")  # draft, active, paused
    folder_id: Optional[int] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# CHAT MODELS
# ============================================================================

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    buyer_id: int = Field(foreign_key="user.id")
    seller_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen (temporär deaktiviert wegen AmbiguousForeignKeysError)
    # user1: Optional["User"] = Relationship(back_populates="conversations")
    # user2: Optional["User"] = Relationship(back_populates="conversations2")

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    sender_id: int = Field(foreign_key="user.id")
    content: str = Field(max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)
    
    # Beziehungen
    sender: Optional["User"] = Relationship(back_populates="messages")

# ============================================================================
# REPORT & RATING MODELS
# ============================================================================

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    reporter_id: int = Field(foreign_key="user.id")
    reason: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="pending")  # pending, reviewed, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen
    reporter: Optional["User"] = Relationship(back_populates="reports")

class Rating(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rater_id: int = Field(foreign_key="user.id")
    rated_user_id: int = Field(foreign_key="user.id")
    rating: int = Field(..., ge=1, le=5)  # 1-5 Sterne
    comment: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen (temporär deaktiviert wegen AmbiguousForeignKeysError)
    # rater: Optional["User"] = Relationship(back_populates="ratings")

# ============================================================================
# ADDITIONAL PYDANTIC MODELS
# ============================================================================

class UserCreate(SQLModel):
    email: str = Field(..., description="E-Mail-Adresse")
    password: str = Field(..., min_length=6, max_length=100)

class LoginRequest(SQLModel):
    email: str = Field(..., description="E-Mail-Adresse")
    password: str = Field(..., min_length=1)

class ProfileUpdate(SQLModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    avatar: Optional[str] = Field(None, max_length=500)
    preferences: Optional[Dict] = Field(None)
    notification_settings: Optional[Dict] = Field(None)
    privacy_settings: Optional[Dict] = Field(None)

class TemplateCreate(SQLModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str = Field(..., max_length=50)
    condition: Optional[str] = Field(None, max_length=50)
    location: str = Field(..., max_length=100)
    price: Optional[float] = Field(None, ge=0)
    attributes: Optional[Dict] = Field(default={})
    images: Optional[List[str]] = Field(default=[])
    folder_id: Optional[int] = Field(None)

class TemplateUpdate(SQLModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    condition: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    attributes: Optional[Dict] = Field(None)
    images: Optional[List[str]] = Field(None)
    status: Optional[str] = Field(None)
    folder_id: Optional[int] = Field(None)

class TemplateFolderCreate(SQLModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=7)

class TemplateFolderUpdate(SQLModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=7)

class ReportCreate(SQLModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Grund für die Meldung")
    description: Optional[str] = Field(None, max_length=1000, description="Zusätzliche Beschreibung")

class RatingCreate(SQLModel):
    rating: int = Field(..., ge=1, le=5, description="Bewertung von 1-5")
    comment: Optional[str] = Field(None, max_length=500, description="Kommentar zur Bewertung") 

# ============================================================================
# VERIFICATION MODELS
# ============================================================================

class SellerVerificationCreate(SQLModel):
    """Model für Verkäufer-Verifizierungsantrag"""
    verification_type: str = Field(..., description="private, shop, service")
    company_name: Optional[str] = Field(None, max_length=200)
    tax_id: Optional[str] = Field(None, max_length=50)
    documents: List[str] = Field(default=[], description="Liste der Dokument-URLs")
    document_types: List[str] = Field(default=[], description="Liste der Dokument-Typen")

class SellerVerificationResponse(SQLModel):
    """Model für Verifizierungs-Response"""
    id: int
    user_id: int
    verification_type: str
    company_name: Optional[str]
    tax_id: Optional[str]
    documents: List[str]
    document_types: List[str]
    status: str
    admin_notes: Optional[str]
    rejection_reason: Optional[str]
    submitted_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[int]

class VerificationDecision(SQLModel):
    """Model für Admin-Entscheidung"""
    decision: str = Field(..., description="approve oder reject")
    reason: Optional[str] = Field(None, max_length=500, description="Grund für Ablehnung")
    admin_notes: Optional[str] = Field(None, max_length=1000)

class EmailVerificationRequest(SQLModel):
    """Model für E-Mail-Verifizierung"""
    token: str = Field(..., description="Verifizierungs-Token")

class ResendVerificationRequest(SQLModel):
    """Model für erneutes Senden der Verifizierung"""
    email: str = Field(..., description="E-Mail-Adresse") 

# Shop Models
class Shop(SQLModel, table=True):
    __tablename__ = "shop"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, description="Name des Shops")
    description: str = Field(max_length=1000, description="Beschreibung des Shops")
    category: str = Field(max_length=50, description="Kategorie des Shops")
    location: str = Field(max_length=100, description="Standort des Shops")
    address: str = Field(max_length=200, description="Vollständige Adresse")
    phone: Optional[str] = Field(max_length=20, description="Telefonnummer")
    email: str = Field(max_length=100, description="E-Mail-Adresse")
    website: Optional[str] = Field(max_length=200, description="Website-URL")
    image: Optional[str] = Field(max_length=500, description="Profilbild-URL")
    banner: Optional[str] = Field(max_length=500, description="Banner-URL")
    verified: bool = Field(default=False, description="Verifizierungsstatus")
    featured: bool = Field(default=False, description="Hervorgehobener Shop")
    rating: float = Field(default=0.0, description="Durchschnittsbewertung")
    review_count: int = Field(default=0, description="Anzahl der Bewertungen")
    listing_count: int = Field(default=0, description="Anzahl der Anzeigen")
    opening_hours: Optional[str] = Field(max_length=500, description="Öffnungszeiten als JSON")
    social_media: Optional[str] = Field(max_length=500, description="Social Media Links als JSON")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehung zum User (Shop-Besitzer)
    owner_id: int = Field(foreign_key="user.id")
    owner: Optional["User"] = Relationship(back_populates="shops")
    
    # Beziehung zu den Anzeigen des Shops
    listings: List["Listing"] = Relationship(back_populates="shop")
    
    # Beziehung zu den Bewertungen des Shops
    reviews: List["ShopReview"] = Relationship(back_populates="shop")

# Shop Pydantic Models
class ShopCreate(SQLModel):
    name: str
    description: str
    category: str
    location: str
    address: str
    phone: Optional[str] = None
    email: str
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    social_media: Optional[str] = None

class ShopUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    social_media: Optional[str] = None

class ShopResponse(SQLModel):
    id: int
    name: str
    description: str
    category: str
    location: str
    address: str
    phone: Optional[str]
    email: str
    website: Optional[str]
    image: Optional[str]
    banner: Optional[str]
    verified: bool
    featured: bool
    rating: float
    review_count: int
    listing_count: int
    opening_hours: Optional[str]
    social_media: Optional[str]
    created_at: datetime
    updated_at: datetime
    owner_id: int

# Shop Review Models
class ShopReview(SQLModel, table=True):
    __tablename__ = "shopreview"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    shop_id: int = Field(foreign_key="shop.id")
    user_id: int = Field(foreign_key="user.id")
    rating: int = Field(ge=1, le=5, description="Bewertung von 1-5")
    comment: Optional[str] = Field(max_length=1000, description="Kommentar zur Bewertung")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen
    shop: Optional["Shop"] = Relationship(back_populates="reviews")
    user: Optional["User"] = Relationship(back_populates="shop_reviews")

class ShopReviewCreate(SQLModel):
    shop_id: int
    rating: int
    comment: Optional[str] = None

class ShopReviewResponse(SQLModel):
    id: int
    shop_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user_name: str 

# ============================================================================
# FOLLOW SYSTEM MODELS
# ============================================================================

class Follow(SQLModel, table=True):
    """Follow-Beziehung zwischen Usern (User kann User oder Shop folgen)"""
    __tablename__ = "follow"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: int = Field(foreign_key="user.id", description="User der folgt")
    following_id: int = Field(foreign_key="user.id", description="User/Shop dem gefolgt wird")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Wann gefolgt wurde")
    
    # Indizes für Performance
    __table_args__ = (
        Index("idx_follower_following", "follower_id", "following_id", unique=True),
        Index("idx_following", "following_id"),
        Index("idx_follower", "follower_id"),
    )

class FollowCreate(SQLModel):
    """Request-Model für Follow-Erstellung"""
    following_id: int

class FollowResponse(SQLModel):
    """Response-Model für Follow-Informationen"""
    id: int
    follower_id: int
    following_id: int
    created_at: datetime
    is_following: bool = True

class FollowStats(SQLModel):
    """Statistiken für Followers/Following"""
    followers_count: int
    following_count: int
    is_following: bool = False  # Ob der aktuelle User diesem Account folgt

# ============================================================================
# NOTIFICATION SYSTEM MODELS
# ============================================================================

class NotificationType(str, Enum):
    NEW_LISTING = "new_listing"           # Neue Anzeige von gefolgtem Account
    FOLLOW = "follow"                     # Jemand folgt dir
    LISTING_VIEW = "listing_view"         # Deine Anzeige wurde angeschaut
    LISTING_FAVORITE = "listing_favorite" # Jemand hat deine Anzeige favorisiert
    MESSAGE = "message"                   # Neue Nachricht
    SYSTEM = "system"                     # System-Benachrichtigung
    LISTING_SOLD = "listing_sold"         # Anzeige verkauft
    LISTING_EXPIRED = "listing_expired"   # Anzeige abgelaufen
    LISTING_REPORTED = "listing_reported" # Anzeige gemeldet
    USER_VERIFIED = "user_verified"       # User verifiziert
    PAYMENT_RECEIVED = "payment_received" # Zahlung erhalten
    REVIEW_RECEIVED = "review_received"   # Bewertung erhalten
    OFFER_RECEIVED = "offer_received"     # Angebot erhalten
    OFFER_ACCEPTED = "offer_accepted"     # Angebot angenommen
    OFFER_DECLINED = "offer_declined"     # Angebot abgelehnt

class Notification(SQLModel, table=True):
    """Benachrichtigungen für User"""
    __tablename__ = "notification"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="Empfänger der Benachrichtigung")
    type: NotificationType = Field(description="Art der Benachrichtigung")
    title: str = Field(max_length=200, description="Titel der Benachrichtigung")
    message: str = Field(max_length=500, description="Nachricht der Benachrichtigung")
    is_read: bool = Field(default=False, description="Ob die Benachrichtigung gelesen wurde")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Wann erstellt")
    
    # Optional: Referenzen zu anderen Entitäten
    related_user_id: Optional[int] = Field(foreign_key="user.id", default=None, description="Verwandter User (z.B. wer gefolgt hat)")
    related_listing_id: Optional[int] = Field(foreign_key="listing.id", default=None, description="Verwandte Anzeige")
    related_entity_id: Optional[int] = Field(default=None, description="Verwandte Entität (Shop, etc.)")
    
    # Indizes für Performance
    __table_args__ = (
        Index("idx_notification_user", "user_id"),
        Index("idx_notification_read", "is_read"),
        Index("idx_notification_created", "created_at"),
    )

class NotificationCreate(SQLModel):
    """Request-Model für Notification-Erstellung"""
    user_id: int
    type: NotificationType
    title: str
    message: str
    related_user_id: Optional[int] = None
    related_listing_id: Optional[int] = None
    related_entity_id: Optional[int] = None

class NotificationResponse(SQLModel):
    """Response-Model für Notification"""
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime
    related_user_id: Optional[int]
    related_listing_id: Optional[int]
    related_entity_id: Optional[int]

class NotificationStats(SQLModel):
    """Statistiken für Benachrichtigungen"""
    total_notifications: int
    unread_notifications: int
    read_notifications: int
    notifications_by_type: Dict[str, int]

class NotificationPreferences(SQLModel, table=True):
    """Benutzer-Benachrichtigungseinstellungen"""
    __tablename__ = "notification_preferences"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, description="User ID")
    
    # E-Mail Benachrichtigungen
    email_new_listing: bool = Field(default=True, description="E-Mail bei neuen Anzeigen von gefolgten Accounts")
    email_follow: bool = Field(default=True, description="E-Mail bei neuen Followern")
    email_message: bool = Field(default=True, description="E-Mail bei neuen Nachrichten")
    email_favorite: bool = Field(default=True, description="E-Mail bei Favoriten")
    email_system: bool = Field(default=True, description="E-Mail bei System-Benachrichtigungen")
    
    # Push Benachrichtigungen
    push_new_listing: bool = Field(default=True, description="Push bei neuen Anzeigen")
    push_follow: bool = Field(default=True, description="Push bei neuen Followern")
    push_message: bool = Field(default=True, description="Push bei neuen Nachrichten")
    push_favorite: bool = Field(default=True, description="Push bei Favoriten")
    push_system: bool = Field(default=False, description="Push bei System-Benachrichtigungen")
    
    # In-App Benachrichtigungen
    inapp_new_listing: bool = Field(default=True, description="In-App bei neuen Anzeigen")
    inapp_follow: bool = Field(default=True, description="In-App bei neuen Followern")
    inapp_message: bool = Field(default=True, description="In-App bei neuen Nachrichten")
    inapp_favorite: bool = Field(default=True, description="In-App bei Favoriten")
    inapp_system: bool = Field(default=True, description="In-App bei System-Benachrichtigungen")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationPreferencesUpdate(SQLModel):
    """Update-Model für Benachrichtigungseinstellungen"""
    email_new_listing: Optional[bool] = None
    email_follow: Optional[bool] = None
    email_message: Optional[bool] = None
    email_favorite: Optional[bool] = None
    email_system: Optional[bool] = None
    push_new_listing: Optional[bool] = None
    push_follow: Optional[bool] = None
    push_message: Optional[bool] = None
    push_favorite: Optional[bool] = None
    push_system: Optional[bool] = None
    inapp_new_listing: Optional[bool] = None
    inapp_follow: Optional[bool] = None
    inapp_message: Optional[bool] = None
    inapp_favorite: Optional[bool] = None
    inapp_system: Optional[bool] = None

# ============================================================================
# CATEGORY MODELS
# ============================================================================

class Category(SQLModel, table=True):
    """Hauptkategorien"""
    id: Optional[int] = Field(default=None, primary_key=True)
    value: str = Field(unique=True, index=True, max_length=100)  # z.B. "auto-rad-boot"
    label: str = Field(max_length=200)  # z.B. "Auto, Rad & Boot"
    icon: str = Field(max_length=10)  # z.B. "🚗"
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    subcategories: List["Subcategory"] = Relationship(back_populates="category")
    # listings: List["Listing"] = Relationship(back_populates="category_obj")  # Temporär deaktiviert
    
    __table_args__ = (
        Index("idx_category_value", "value"),
        Index("idx_category_active", "is_active"),
        Index("idx_category_sort", "sort_order"),
    )

class Subcategory(SQLModel, table=True):
    """Unterkategorien"""
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id")
    value: str = Field(max_length=100)  # z.B. "autos"
    label: str = Field(max_length=200)  # z.B. "Autos"
    icon: Optional[str] = Field(default=None, max_length=10)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    category: Category = Relationship(back_populates="subcategories")
    # listings: List["Listing"] = Relationship(back_populates="subcategory_obj")  # Temporär deaktiviert
    
    __table_args__ = (
        Index("idx_subcategory_category", "category_id"),
        Index("idx_subcategory_value", "value"),
        Index("idx_subcategory_active", "is_active"),
        Index("idx_subcategory_sort", "sort_order"),
    )

class CategoryItem(SQLModel, table=True):
    """Kategorie-Items (z.B. "BMW", "Mercedes" für Autos)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    subcategory_id: int = Field(foreign_key="subcategory.id")
    value: str = Field(max_length=100)  # z.B. "bmw"
    label: str = Field(max_length=200)  # z.B. "BMW"
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    subcategory: Subcategory = Relationship()
    
    __table_args__ = (
        Index("idx_categoryitem_subcategory", "subcategory_id"),
        Index("idx_categoryitem_value", "value"),
        Index("idx_categoryitem_active", "is_active"),
    )

# Request/Response Models für Categories
class CategoryCreate(SQLModel):
    """Request-Model für Category-Erstellung"""
    value: str
    label: str
    icon: str
    description: Optional[str] = None
    sort_order: int = 0

class CategoryUpdate(SQLModel):
    """Request-Model für Category-Update"""
    label: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class CategoryResponse(SQLModel):
    """Response-Model für Category"""
    id: int
    value: str
    label: str
    icon: str
    description: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

class SubcategoryCreate(SQLModel):
    """Request-Model für Subcategory-Erstellung"""
    category_id: int
    value: str
    label: str
    icon: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0

class SubcategoryResponse(SQLModel):
    """Response-Model für Subcategory"""
    id: int
    category_id: int
    value: str
    label: str
    icon: Optional[str]
    description: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

class CategoryWithSubcategories(CategoryResponse):
    """Category mit Subcategories"""
    subcategories: List[SubcategoryResponse] = []
 