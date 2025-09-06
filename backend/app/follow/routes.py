"""
Follow System routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    Follow, FollowCreate, FollowResponse, FollowStats,
    User, Listing
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

# Router für Follow-Endpoints
router = APIRouter(prefix="/api", tags=["follow"])

# Logging
logger = logging.getLogger(__name__)

@router.post("/users/{user_id}/follow")
async def follow_user(
    user_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benutzer folgen"""
    
    # Prüfen ob Benutzer sich nicht selbst folgt
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Du kannst dir nicht selbst folgen")
    
    # Zielbenutzer prüfen
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    # Prüfen ob bereits gefolgt wird
    existing_follow = session.exec(
        select(Follow)
        .where(
            Follow.follower_id == current_user.id,
            Follow.following_id == user_id
        )
    ).first()
    
    if existing_follow:
        raise HTTPException(status_code=400, detail="Du folgst diesem Benutzer bereits")
    
    # Neues Follow erstellen
    follow = Follow(
        follower_id=current_user.id,
        following_id=user_id
    )
    
    session.add(follow)
    session.commit()
    session.refresh(follow)
    
    # Automatische Benachrichtigung für gefolgten User
    try:
        from app.notifications.service import NotificationService
        notification_service = NotificationService(session)
        notification_service.notify_follow(current_user.id, user_id)
        
        # WebSocket-Benachrichtigung senden
        from app.websocket.manager import manager as websocket_manager
        follower = session.get(User, current_user.id)
        if follower:
            await websocket_manager.send_follow_notification(
                user_id=user_id,
                follow_data={
                    "follower_id": current_user.id,
                    "following_id": user_id,
                    "follower_name": follower.email.split('@')[0]
                }
            )
    except Exception as e:
        logger.error(f"Fehler bei automatischer Benachrichtigung: {e}")
    
    return {
        "id": follow.id,
        "follower_id": follow.follower_id,
        "following_id": follow.following_id,
        "created_at": follow.created_at.isoformat() if follow.created_at else None
    }

@router.delete("/users/{user_id}/follow")
def unfollow_user(
    user_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benutzer entfolgen"""
    
    # Follow-Beziehung finden
    follow = session.exec(
        select(Follow)
        .where(
            Follow.follower_id == current_user.id,
            Follow.following_id == user_id
        )
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Du folgst diesem Benutzer nicht")
    
    # Follow löschen
    session.delete(follow)
    session.commit()
    
    return {"message": "Benutzer erfolgreich entfolgt"}

@router.get("/follow/following")
def get_following(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der gefolgten Benutzer pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    session: Session = Depends(get_session)
):
    """Benutzer abrufen, denen der aktuelle Benutzer folgt"""
    
    follows = session.exec(
        select(Follow)
        .where(Follow.follower_id == current_user.id)
        .order_by(Follow.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    result = []
    for follow in follows:
        # Gefolgten Benutzer abrufen
        following_user = session.get(User, follow.following_id)
        
        if following_user:
            # Anzahl der Listings des gefolgten Benutzers
            listing_count = session.exec(
                select(func.count(Listing.id))
                .where(Listing.user_id == following_user.id, Listing.status == "ACTIVE")
            ).first() or 0
            
            result.append({
                "id": follow.id,
                "user": {
                    "id": following_user.id,
                    "name": following_user.email.split('@')[0],
                    "avatar": following_user.avatar,
                    "verification_state": following_user.verification_state
                },
                "listing_count": listing_count,
                "followed_at": follow.created_at.isoformat() if follow.created_at else None
            })
    
    return {"following": result}

@router.get("/follow/followers")
def get_followers(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der Follower pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    session: Session = Depends(get_session)
):
    """Follower des aktuellen Benutzers abrufen"""
    
    follows = session.exec(
        select(Follow)
        .where(Follow.following_id == current_user.id)
        .order_by(Follow.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    result = []
    for follow in follows:
        # Follower-Benutzer abrufen
        follower_user = session.get(User, follow.follower_id)
        
        if follower_user:
            # Anzahl der Listings des Followers
            listing_count = session.exec(
                select(func.count(Listing.id))
                .where(Listing.user_id == follower_user.id, Listing.status == "ACTIVE")
            ).first() or 0
            
            result.append({
                "id": follow.id,
                "user": {
                    "id": follower_user.id,
                    "name": follower_user.email.split('@')[0],
                    "avatar": follower_user.avatar,
                    "verification_state": follower_user.verification_state
                },
                "listing_count": listing_count,
                "followed_at": follow.created_at.isoformat() if follow.created_at else None
            })
    
    return {"followers": result}

@router.get("/follow/stats/{user_id}")
def get_follow_stats(
    user_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Follow-Statistiken eines Benutzers abrufen"""
    
    # Benutzer prüfen
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    # Follower zählen
    follower_count = session.exec(
        select(func.count(Follow.id))
        .where(Follow.following_id == user_id)
    ).first() or 0
    
    # Following zählen
    following_count = session.exec(
        select(func.count(Follow.id))
        .where(Follow.follower_id == user_id)
    ).first() or 0
    
    # Anzahl der Listings
    listing_count = session.exec(
        select(func.count(Listing.id))
        .where(Listing.user_id == user_id, Listing.status == "ACTIVE")
    ).first() or 0
    
    return {
        "user": {
            "id": user.id,
            "name": user.email.split('@')[0],
            "avatar": user.avatar
        },
        "stats": {
            "followers": follower_count,
            "following": following_count,
            "listings": listing_count
        }
    }
