"""
Template models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class TemplateFolder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    name: str = Field(max_length=100)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Template(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
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
