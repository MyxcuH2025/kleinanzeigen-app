"""
Favorite models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Favorite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    listing_id: int = Field(foreign_key="listing.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Beziehungen
    user: Optional["User"] = Relationship(back_populates="favorites")
    listing: Optional["Listing"] = Relationship(back_populates="favorites")
