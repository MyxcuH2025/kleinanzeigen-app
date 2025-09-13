"""
Report and Rating models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    reporter_id: int = Field(foreign_key="users.id")
    reason: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="pending")  # pending, reviewed, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen
    reporter: Optional["User"] = Relationship(back_populates="reports")

class Rating(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rater_id: int = Field(foreign_key="users.id")
    rated_user_id: int = Field(foreign_key="users.id")
    rating: int = Field(..., ge=1, le=5)  # 1-5 Sterne
    comment: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReportCreate(SQLModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Grund für die Meldung")
    description: Optional[str] = Field(None, max_length=1000, description="Zusätzliche Beschreibung")

class RatingCreate(SQLModel):
    rating: int = Field(..., ge=1, le=5, description="Bewertung von 1-5")
    comment: Optional[str] = Field(None, max_length=500, description="Kommentar zur Bewertung")
