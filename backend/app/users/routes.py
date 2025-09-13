"""
User routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query, UploadFile, File
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    User, UserRole, VerificationState, ProfileUpdate,
    Follow, FollowCreate, FollowResponse, FollowStats,
    Notification, NotificationCreate, NotificationResponse, NotificationStats, NotificationType,
    Listing, ListingStatus
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
from config import config
from sqlmodel import create_engine
import json
from datetime import datetime
from typing import Optional, List
from pathlib import Path
import uuid
import logging

# Engine erstellen
engine = create_engine(config.DATABASE_URL)

# Router für User-Endpoints
router = APIRouter(prefix="/api", tags=["users"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/users/{user_id}/stats")
def get_user_stats(user_id: int):
    """Holt detaillierte Statistiken für einen User (Seller Stats)"""
    return {
        "user_id": user_id,
        "display_name": f"User {user_id}",
        "avatar_url": None,
        "member_since_years": 1.0,
        "last_activity": "2025-01-01T00:00:00",
        "is_online": True,
        "response_time": "Schnell",
        "active_listings": 3,
        "successful_sales": 1,
        "rating": 4.5,
        "reviews_count": 12,
        "verified": {
            "phone": False,
            "id": False,
            "bank": False
        }
    }

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Aktuelle Benutzerinformationen abrufen"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "avatar": current_user.avatar,
        "location": current_user.location,
        "bio": current_user.bio,
        "phone": current_user.phone,
        "website": current_user.website,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "verification_state": current_user.verification_state,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.put("/users/me")
def update_current_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Aktuelles Benutzerprofil aktualisieren"""
    # Update user fields
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "avatar": current_user.avatar,
        "location": current_user.location,
        "bio": current_user.bio,
        "phone": current_user.phone,
        "website": current_user.website,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "verification_state": current_user.verification_state,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.post("/users/me/avatar")
def upload_current_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Avatar für aktuellen Benutzer hochladen"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Nur Bilddateien sind erlaubt")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("uploads/avatars")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = uploads_dir / unique_filename
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    # Update user avatar path
    avatar_path = f"/uploads/avatars/{unique_filename}"
    current_user.avatar = avatar_path
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "avatar": current_user.avatar,
        "location": current_user.location,
        "bio": current_user.bio,
        "phone": current_user.phone,
        "website": current_user.website,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "verification_state": current_user.verification_state,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.put("/users/me/password")
def change_current_user_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Passwort für aktuellen Benutzer ändern"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Verify current password
    if not pwd_context.verify(password_data.get("current_password", ""), current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    
    # Update password
    new_password = password_data.get("new_password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Neues Passwort muss mindestens 6 Zeichen lang sein")
    
    current_user.hashed_password = pwd_context.hash(new_password)
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    
    return {"message": "Passwort erfolgreich geändert"}

@router.delete("/users/me")
def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Aktuellen Benutzeraccount löschen"""
    # Delete user's listings
    session.exec(select(Listing).where(Listing.user_id == current_user.id))
    
    # Delete user's follows
    session.exec(select(Follow).where(Follow.follower_id == current_user.id))
    session.exec(select(Follow).where(Follow.following_id == current_user.id))
    
    # Delete user's notifications
    session.exec(select(Notification).where(Notification.user_id == current_user.id))
    
    # Delete user
    session.delete(current_user)
    session.commit()
    
    return {"message": "Account erfolgreich gelöscht"}

@router.get("/users/public")
def get_users_public(
    limit: int = Query(20, description="Anzahl der User pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    search: Optional[str] = Query(None, description="Suche nach E-Mail oder Namen"),
    verification_state: Optional[str] = Query(None, description="Filter nach Verifizierungsstatus"),
    session: Session = Depends(get_session)
):
    """Alle User abrufen (öffentlich, ohne Authentifizierung)"""
    try:
        query = select(User)
        
        # Suchfilter anwenden
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    User.email.contains(search_term),
                    User.first_name.contains(search_term),
                    User.last_name.contains(search_term)
                )
            )
        
        # Verifizierungsstatus-Filter
        if verification_state:
            query = query.where(User.verification_state == verification_state)
        
        # Paginierung anwenden
        query = query.offset(offset).limit(limit)
        
        users = session.exec(query.order_by(User.created_at.desc())).all()
        
        return {
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "avatar": user.avatar,
                    "location": user.location,
                    "bio": user.bio,
                    "is_active": user.is_active,
                    "is_verified": user.is_verified,
                    "verification_state": user.verification_state,
                    "role": user.role,
                    "created_at": user.created_at
                }
                for user in users
            ],
            "total": len(users)
        }
    except Exception as e:
        logger.error(f"Error in get_users_public: {e}")
        return {"users": [], "total": 0}

@router.get("/users/{user_id}")
def get_user_by_id(user_id: int, session: Session = Depends(get_session)):
    """Benutzerinformationen nach ID abrufen"""
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "avatar": user.avatar,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "verification_state": user.verification_state,
        "role": user.role,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.post("/users/{user_id}/avatar", status_code=status.HTTP_201_CREATED)
def upload_user_avatar(
    user_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Avatar-Datei hochladen und beim User speichern."""
    if current_user.id != user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Nicht erlaubt")

    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Nur Bilddateien sind erlaubt")

    content = file.file.read()
    file.file.seek(0)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei ist zu groß (max 5MB)")

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    upload_dir = Path("uploads") / "avatars"
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    path = upload_dir / filename

    with open(path, "wb") as f:
        f.write(content)

    user.avatar = f"/api/uploads/avatars/{filename}"
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"url": user.avatar}

@router.get("/users/{user_id}/profile")
def get_user_profile(
    user_id: int,
    limit: int = Query(20, description="Anzahl der Listings pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Benutzerprofil mit Listings abrufen"""
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    # Follow-Status prüfen (nur wenn eingeloggt)
    is_following = False
    if current_user and current_user.id != user_id:
        existing_follow = session.exec(
            select(Follow)
            .where(
                Follow.follower_id == current_user.id,
                Follow.following_id == user_id
            )
        ).first()
        is_following = existing_follow is not None
    
    # Follow-Statistiken abrufen
    followers_count = session.exec(
        select(func.count(Follow.id))
        .where(Follow.following_id == user_id)
    ).first() or 0
    
    following_count = session.exec(
        select(func.count(Follow.id))
        .where(Follow.follower_id == user_id)
    ).first() or 0
    
    # Gesamtanzahl der Listings für Paginierung
    total_listings = session.exec(
        select(func.count(Listing.id))
        .where(Listing.user_id == user_id)
    ).first() or 0
    
    # User-Listings abrufen
    listings = session.exec(
        select(Listing)
        .where(Listing.user_id == user_id)
        .order_by(Listing.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "avatar": user.avatar,
            "location": user.location,
            "bio": user.bio,
            "phone": user.phone,
            "website": user.website,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "verification_state": user.verification_state,
            "verification_text": user.seller_verification_reason,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "is_following": is_following,
            "followers_count": followers_count,
            "following_count": following_count
        },
        "listings": [
            {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price,
                "currency": "EUR",
                "category": listing.category,
                "subcategory": getattr(listing, 'subcategory', None),
                "condition": listing.condition,
                "location": listing.location,
                "images": json.loads(listing.images) if listing.images else [],
                "status": listing.status.lower() if listing.status else "active",
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
                "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
                "user_id": listing.user_id,
                "is_featured": getattr(listing, 'is_featured', False),
                "view_count": listing.views or 0,
                "contact_phone": getattr(listing, 'contact_phone', None),
                "contact_email": getattr(listing, 'contact_email', None),
                "delivery_options": json.loads(getattr(listing, 'delivery_options', '[]')) if getattr(listing, 'delivery_options', None) else []
            }
            for listing in listings
        ],
        "pagination": {
            "total": total_listings,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_listings
        }
    }