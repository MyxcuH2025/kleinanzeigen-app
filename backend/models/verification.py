"""
Verification models for the Kleinanzeigen API
"""
from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime

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
