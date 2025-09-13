"""
Follow models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field, Index
from datetime import datetime
from typing import Optional

class Follow(SQLModel, table=True):
    """Follow-Beziehung zwischen Usern (User kann User oder Shop folgen)"""
    __tablename__ = "follow"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: int = Field(foreign_key="users.id", description="User der folgt")
    following_id: int = Field(foreign_key="users.id", description="User/Shop dem gefolgt wird")
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
