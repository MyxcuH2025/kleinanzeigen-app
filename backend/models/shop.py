"""
Shop models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

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
    owner_id: int = Field(foreign_key="users.id")
    owner: Optional["User"] = Relationship(back_populates="shops")
    
    # Beziehung zu den Anzeigen des Shops
    listings: List["Listing"] = Relationship(back_populates="shop")
    
    # Beziehung zu den Bewertungen des Shops
    reviews: List["ShopReview"] = Relationship(back_populates="shop")

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

class ShopReview(SQLModel, table=True):
    __tablename__ = "shopreview"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    shop_id: int = Field(foreign_key="shop.id")
    user_id: int = Field(foreign_key="users.id")
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
