"""
Chat models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listing.id")
    buyer_id: int = Field(foreign_key="users.id")
    seller_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    sender_id: int = Field(foreign_key="users.id")
    content: str = Field(max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)
    
    # Beziehungen
    sender: Optional["User"] = Relationship(back_populates="messages")
