"""
Admin routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    User, UserRole, VerificationState, SellerVerification,
    SellerVerificationCreate, SellerVerificationResponse, VerificationDecision,
    Report, Listing
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime
from typing import Optional, List
import logging

# Router für Admin-Endpoints
router = APIRouter(prefix="/api", tags=["admin"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/admin/verification/{verification_id}/decision")
async def admin_verification_decision(
    verification_id: int,
    decision: str = Body(...),  # "approve" oder "reject"
    reason: Optional[str] = Body(None),
    admin_notes: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user)
):
    """Admin-Entscheidung über Verifizierung"""
    
    # Prüfen ob User Admin ist
    if current_user.role != UserRole.ADMIN and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins dürfen Verifizierungen entscheiden")
    
    if decision not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Entscheidung muss 'approve' oder 'reject' sein")
    
    with Session(engine) as session:
        verification = session.exec(
            select(SellerVerification).where(SellerVerification.id == verification_id)
        ).first()
        
        if not verification:
            raise HTTPException(status_code=404, detail="Verifizierung nicht gefunden")
        
        if verification.status != "pending":
            raise HTTPException(status_code=400, detail="Verifizierung wurde bereits entschieden")
        
        # Verifizierung aktualisieren
        verification.status = "approved" if decision == "approve" else "rejected"
        verification.reviewed_at = datetime.utcnow()
        verification.reviewed_by = current_user.id
        verification.admin_notes = admin_notes
        
        if decision == "reject":
            verification.rejection_reason = reason
        
        # User-Status aktualisieren
        user = session.exec(select(User).where(User.id == verification.user_id)).first()
        if user:
            if decision == "approve":
                user.verification_state = VerificationState.SELLER_VERIFIED
                user.seller_verified_at = datetime.utcnow()
                user.role = UserRole.SELLER
            else:
                user.verification_state = VerificationState.EMAIL_VERIFIED
                user.seller_verification_reason = reason
        
        session.commit()
        
        # E-Mail-Benachrichtigung senden
        try:
            await send_verification_decision_email(
                user.email, 
                verification.company_name, 
                decision, 
                reason if decision == "reject" else None
            )
        except Exception as e:
            logger.warning(f"E-Mail-Benachrichtigung konnte nicht gesendet werden: {e}")
        
        return {
            "message": f"Verifizierung erfolgreich {decision}d",
            "verification_id": verification.id,
            "status": verification.status,
            "user_verification_state": user.verification_state if user else None
        }

@router.get("/admin/verifications")
async def get_pending_verifications(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter nach Status: pending, approved, rejected")
):
    """Alle Verifizierungen für Admins abrufen"""
    
    if current_user.role != UserRole.ADMIN and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins dürfen alle Verifizierungen einsehen")
    
    with Session(engine) as session:
        query = select(SellerVerification)
        
        if status:
            query = query.where(SellerVerification.status == status)
        
        verifications = session.exec(query.order_by(SellerVerification.submitted_at.desc())).all()
        
        result = []
        for verification in verifications:
            user = session.exec(select(User).where(User.id == verification.user_id)).first()
            result.append({
                "id": verification.id,
                "user_id": verification.user_id,
                "user_email": user.email if user else "Unbekannt",
                "verification_type": verification.verification_type,
                "company_name": verification.company_name,
                "status": verification.status,
                "submitted_at": verification.submitted_at,
                "reviewed_at": verification.reviewed_at,
                "admin_notes": verification.admin_notes,
                "rejection_reason": verification.rejection_reason
            })
        
        return result

@router.get("/admin/reports")
async def get_admin_reports(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter nach Status: pending, resolved, dismissed"),
    limit: int = Query(20, description="Anzahl der Reports pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung")
):
    """Alle Reports für Admins abrufen"""
    
    if current_user.role != UserRole.ADMIN and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins dürfen alle Reports einsehen")
    
    with Session(engine) as session:
        query = select(Report)
        
        if status:
            query = query.where(Report.status == status)
        
        # Gesamtanzahl für Paginierung
        total_count = len(session.exec(query).all())
        
        # Paginierung anwenden
        query = query.offset(offset).limit(limit)
        
        reports = session.exec(query.order_by(Report.created_at.desc())).all()
        
        result = []
        for report in reports:
            # Reporter-Informationen abrufen
            reporter = session.exec(select(User).where(User.id == report.reporter_id)).first()
            
            # Listing-Informationen abrufen
            listing = session.exec(select(Listing).where(Listing.id == report.listing_id)).first()
            
            result.append({
                "id": report.id,
                "reporter_id": report.reporter_id,
                "reporter_email": reporter.email if reporter else "Unbekannt",
                "listing_id": report.listing_id,
                "listing_title": listing.title if listing else "Unbekannt",
                "reason": report.reason,
                "description": report.description,
                "status": report.status,
                "created_at": report.created_at,
                "resolved_at": report.resolved_at,
                "admin_notes": report.admin_notes
            })
        
        return {
            "reports": result,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }

@router.post("/admin/reports/{report_id}/resolve")
async def resolve_report(
    report_id: int,
    decision: str = Body(...),  # "resolved" oder "dismissed"
    admin_notes: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user)
):
    """Report als Admin entscheiden"""
    
    if current_user.role != UserRole.ADMIN and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins dürfen Reports entscheiden")
    
    if decision not in ["resolved", "dismissed"]:
        raise HTTPException(status_code=400, detail="Entscheidung muss 'resolved' oder 'dismissed' sein")
    
    with Session(engine) as session:
        report = session.exec(select(Report).where(Report.id == report_id)).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report nicht gefunden")
        
        if report.status != "pending":
            raise HTTPException(status_code=400, detail="Report wurde bereits entschieden")
        
        # Report aktualisieren
        report.status = decision
        report.resolved_at = datetime.utcnow()
        report.resolved_by = current_user.id
        report.admin_notes = admin_notes
        
        session.commit()
        
        return {
            "message": f"Report erfolgreich {decision}",
            "report_id": report.id,
            "status": report.status
        }

@router.get("/admin/statistics")
async def get_admin_statistics(
    current_user: User = Depends(get_current_user)
):
    """Admin-Statistiken abrufen"""
    
    if current_user.role != UserRole.ADMIN and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nur Admins dürfen Statistiken einsehen")
    
    with Session(engine) as session:
        # Benutzer-Statistiken
        total_users = session.exec(select(func.count(User.id))).first()
        active_users = session.exec(select(func.count(User.id)).where(User.is_active == True)).first()
        verified_users = session.exec(select(func.count(User.id)).where(User.verification_state == VerificationState.EMAIL_VERIFIED)).first()
        seller_verified_users = session.exec(select(func.count(User.id)).where(User.verification_state == VerificationState.SELLER_VERIFIED)).first()
        
        # Listing-Statistiken
        total_listings = session.exec(select(func.count(Listing.id))).first()
        active_listings = session.exec(select(func.count(Listing.id)).where(Listing.status == ListingStatus.ACTIVE)).first()
        inactive_listings = session.exec(select(func.count(Listing.id)).where(Listing.status == ListingStatus.INACTIVE)).first()
        sold_listings = session.exec(select(func.count(Listing.id)).where(Listing.status == ListingStatus.SOLD)).first()
        
        # Report-Statistiken
        total_reports = session.exec(select(func.count(Report.id))).first()
        pending_reports = session.exec(select(func.count(Report.id)).where(Report.status == "pending")).first()
        resolved_reports = session.exec(select(func.count(Report.id)).where(Report.status == "resolved")).first()
        dismissed_reports = session.exec(select(func.count(Report.id)).where(Report.status == "dismissed")).first()
        
        # Verifizierungs-Statistiken
        pending_verifications = session.exec(select(func.count(SellerVerification.id)).where(SellerVerification.status == "pending")).first()
        approved_verifications = session.exec(select(func.count(SellerVerification.id)).where(SellerVerification.status == "approved")).first()
        rejected_verifications = session.exec(select(func.count(SellerVerification.id)).where(SellerVerification.status == "rejected")).first()
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "verified": verified_users,
                "seller_verified": seller_verified_users
            },
            "listings": {
                "total": total_listings,
                "active": active_listings,
                "inactive": inactive_listings,
                "sold": sold_listings
            },
            "reports": {
                "total": total_reports,
                "pending": pending_reports,
                "resolved": resolved_reports,
                "dismissed": dismissed_reports
            },
            "verifications": {
                "pending": pending_verifications,
                "approved": approved_verifications,
                "rejected": rejected_verifications
            }
        }

@router.get("/seller/verification/status")
async def get_seller_verification_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Status der Seller-Verifizierung abrufen"""
    
    verification = session.exec(
        select(SellerVerification)
        .where(SellerVerification.user_id == current_user.id)
        .order_by(SellerVerification.submitted_at.desc())
    ).first()
    
    if not verification:
        return {
            "verification_state": current_user.verification_state,
            "verification": None
        }
    
    return {
        "verification_state": current_user.verification_state,
        "verification": {
            "id": verification.id,
            "verification_type": verification.verification_type,
            "company_name": verification.company_name,
            "status": verification.status,
            "submitted_at": verification.submitted_at,
            "reviewed_at": verification.reviewed_at,
            "rejection_reason": verification.rejection_reason
        }
    }


@router.get("/admin/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Hole Admin-Dashboard Statistiken"""
    
    # Prüfe Admin-Berechtigung
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Administratoren können Statistiken abrufen"
        )
    
    try:
        # Gesamt User
        total_users = session.exec(select(func.count(User.id))).first() or 0
        
        # Gesamt Anzeigen
        total_listings = session.exec(select(func.count(Listing.id))).first() or 0
        
        # Offene Reports
        open_reports = session.exec(
            select(func.count(Report.id))
            .where(Report.status == "open")
        ).first() or 0
        
        # Aktive Chats (vereinfacht - alle User mit letzter Aktivität in den letzten 5 Minuten)
        from datetime import datetime, timedelta
        online_threshold = datetime.utcnow() - timedelta(minutes=5)
        active_chats = session.exec(
            select(func.count(User.id))
            .where(User.last_activity >= online_threshold)
        ).first() or 0
        
        # Heute registrierte User
        today = datetime.utcnow().date()
        users_today = session.exec(
            select(func.count(User.id))
            .where(func.date(User.created_at) == today)
        ).first() or 0
        
        # Heute erstellte Anzeigen
        listings_today = session.exec(
            select(func.count(Listing.id))
            .where(func.date(Listing.created_at) == today)
        ).first() or 0
        
        return {
            "total_users": total_users,
            "total_listings": total_listings,
            "open_reports": open_reports,
            "active_chats": active_chats,
            "users_today": users_today,
            "listings_today": listings_today,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Fehler beim Laden der Admin-Statistiken: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fehler beim Laden der Statistiken"
        )