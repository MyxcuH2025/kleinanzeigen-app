"""
User models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from .enums import UserRole, VerificationState

class User(SQLModel, table=True):
    __tablename__ = "users"
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
    
    # Profil-Felder (mit Default Values für Deployment)
    first_name: str = Field(default="User", max_length=100, description="Vorname")
    last_name: str = Field(default="", max_length=100, description="Nachname")
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
    messages: List["Message"] = Relationship(back_populates="sender")
    reports: List["Report"] = Relationship(back_populates="reporter")
    shops: List["Shop"] = Relationship(back_populates="owner")
    shop_reviews: List["ShopReview"] = Relationship(back_populates="user")
    stories: List["Story"] = Relationship(back_populates="user")  # Stories-Relationship

class SellerVerification(SQLModel, table=True):
    """Modell für Verkäufer-Verifizierung"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    
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
    reviewed_by: Optional[int] = Field(default=None, foreign_key="users.id")
    
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
