"""
User request models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field
from typing import Optional, Dict

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
