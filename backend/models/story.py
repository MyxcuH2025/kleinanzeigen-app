"""
Stories-Modelle für Instagram-Style Stories Feature
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Literal
from datetime import datetime, timedelta
from enum import Enum

class StoryMediaType(str, Enum):
    """Media-Typen für Stories"""
    IMAGE = "image"
    VIDEO = "video"

class StoryReactionType(str, Enum):
    """Reaktions-Typen für Stories"""
    LIKE = "like"
    LOVE = "love"
    LAUGH = "laugh"
    WOW = "wow"
    SAD = "sad"
    ANGRY = "angry"

class StoryBase(SQLModel):
    """Basis-Story-Modell"""
    user_id: int = Field(foreign_key="users.id")
    media_url: str = Field(description="URL zum Media-File")
    media_type: StoryMediaType = Field(description="Typ des Media-Contents")
    thumbnail_url: Optional[str] = Field(default=None, description="Thumbnail-URL für Videos")
    caption: Optional[str] = Field(default=None, max_length=500, description="Story-Beschreibung")
    duration: int = Field(default=15, ge=5, le=60, description="Dauer in Sekunden (für Videos)")
    views_count: int = Field(default=0, ge=0, description="Anzahl der Views")
    reactions_count: int = Field(default=0, ge=0, description="Anzahl der Reaktionen")
    is_active: bool = Field(default=True, description="Story ist aktiv")
    is_highlighted: bool = Field(default=False, description="Story ist als Highlight gespeichert")
    
    # Overlay-Daten für Videos
    text_overlays: Optional[str] = Field(default=None, description="JSON-String mit Text-Overlay-Daten")
    sticker_overlays: Optional[str] = Field(default=None, description="JSON-String mit Sticker-Overlay-Daten")

class Story(StoryBase, table=True):
    """Stories-Tabelle"""
    __tablename__ = "stories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(hours=24),
        description="Story läuft nach 24h ab"
    )
    
    # Relationships (Forward references werden später aufgelöst)
    user: Optional["User"] = Relationship(back_populates="stories")
    views: List["StoryView"] = Relationship(back_populates="story")
    reactions: List["StoryReaction"] = Relationship(back_populates="story")
    comments: List["StoryComment"] = Relationship(back_populates="story")

class StoryCreate(SQLModel):
    """Story-Erstellung"""
    media_type: StoryMediaType
    caption: Optional[str] = Field(default=None, max_length=500)
    duration: Optional[int] = Field(default=15, ge=5, le=60)

class StoryUpdate(SQLModel):
    """Story-Update"""
    caption: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None

class StoryResponse(SQLModel):
    """Story-Response für API"""
    id: int
    user_id: int
    media_url: str
    media_type: StoryMediaType
    thumbnail_url: Optional[str]
    caption: Optional[str]
    duration: int
    views_count: int
    reactions_count: int
    created_at: datetime
    expires_at: datetime
    is_active: bool
    
    # Overlay-Daten für Videos
    text_overlays: Optional[str] = None
    sticker_overlays: Optional[str] = None
    
    # User-Info
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    
    # Viewer-Info
    has_viewed: bool = False
    user_reaction: Optional[StoryReactionType] = None

class StoryViewBase(SQLModel):
    """Basis-Story-View-Modell"""
    story_id: int = Field(foreign_key="stories.id")
    viewer_id: int = Field(foreign_key="users.id")

class StoryView(StoryViewBase, table=True):
    """Story-Views-Tabelle"""
    __tablename__ = "story_views"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    viewed_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    story: Optional[Story] = Relationship(back_populates="views")
    viewer: Optional["User"] = Relationship()

class StoryReactionBase(SQLModel):
    """Basis-Story-Reaction-Modell"""
    story_id: int = Field(foreign_key="stories.id")
    user_id: int = Field(foreign_key="users.id")
    reaction_type: StoryReactionType

class StoryReaction(StoryReactionBase, table=True):
    """Story-Reactions-Tabelle"""
    __tablename__ = "story_reactions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    story: Optional[Story] = Relationship(back_populates="reactions")
    user: Optional["User"] = Relationship()

class StoryCommentBase(SQLModel):
    """Basis-Story-Comment-Modell"""
    story_id: int = Field(foreign_key="stories.id")
    user_id: int = Field(foreign_key="users.id")
    comment: str = Field(max_length=500)

class StoryComment(StoryCommentBase, table=True):
    """Story-Comments-Tabelle"""
    __tablename__ = "story_comments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = Field(default=False)
    
    # Relationships
    story: Optional[Story] = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship()

class StoryCommentResponse(SQLModel):
    """Story-Comment-Response für API"""
    id: int
    story_id: int
    user_id: int
    comment: str
    created_at: datetime
    
    # User-Info
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

class StoryHighlightBase(SQLModel):
    """Basis-Story-Highlight-Modell"""
    user_id: int = Field(foreign_key="users.id")
    title: str = Field(max_length=100, description="Highlight-Titel")
    cover_image_url: Optional[str] = Field(default=None, description="Cover-Bild für Highlight")
    description: Optional[str] = Field(default=None, max_length=200, description="Highlight-Beschreibung")
    is_active: bool = Field(default=True, description="Highlight ist aktiv")

class StoryHighlight(StoryHighlightBase, table=True):
    """Story-Highlights Tabelle"""
    __tablename__ = "story_highlights"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional["User"] = Relationship()
    stories: List["StoryHighlightStory"] = Relationship(back_populates="highlight")

class StoryHighlightStoryBase(SQLModel):
    """Basis-Story-Highlight-Zuordnung"""
    highlight_id: int = Field(foreign_key="story_highlights.id")
    story_id: int = Field(foreign_key="stories.id")
    order_index: int = Field(default=0, description="Reihenfolge im Highlight")

class StoryHighlightStory(StoryHighlightStoryBase, table=True):
    """Story-Highlight-Zuordnung Tabelle"""
    __tablename__ = "story_highlight_stories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    highlight: Optional["StoryHighlight"] = Relationship(back_populates="stories")
    story: Optional["Story"] = Relationship()

class StoriesFeedResponse(SQLModel):
    """Stories-Feed-Response"""
    stories: List[StoryResponse]
    total_count: int
    has_more: bool

class StoryStatsResponse(SQLModel):
    """Story-Statistiken"""
    story_id: int
    views_count: int
    reactions_count: int
    comments_count: int
    unique_viewers: int
    top_reactions: dict  # {reaction_type: count}
