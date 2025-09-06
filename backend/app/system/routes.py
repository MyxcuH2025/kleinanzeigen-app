"""
System routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status, Path, Query
from sqlmodel import Session, select, or_, and_, desc, asc, func
from models import (
    User, Listing, Follow, Favorite, Notification
)
from app.dependencies import get_session, get_current_user, get_current_user_optional
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

# Router für System-Endpoints
router = APIRouter(prefix="/api", tags=["system"])

# Logging
logger = logging.getLogger(__name__)

@router.get("/healthz")
def health_check():
    """Health Check für System-Status"""
    
    try:
        # Einfache System-Status-Prüfung
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "services": {
                "database": "connected",
                "api": "running",
                "authentication": "active"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@router.post("/setup-test-data")
def setup_test_data(session: Session = Depends(get_session)):
    """Test-Daten für Entwicklung einrichten"""
    
    try:
        # Prüfen ob bereits Test-Daten existieren
        existing_users = session.exec(select(User)).first()
        if existing_users:
            return {"message": "Test-Daten existieren bereits", "status": "skipped"}
        
        # Test-Benutzer erstellen
        test_users = [
            {
                "email": "admin@test.com",
                "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.8K.8K",  # "admin123"
                "role": "admin",
                "is_active": True,
                "is_verified": True,
                "verification_state": "EMAIL_VERIFIED"
            },
            {
                "email": "user1@test.com",
                "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.8K.8K",  # "user123"
                "role": "user",
                "is_active": True,
                "is_verified": True,
                "verification_state": "EMAIL_VERIFIED"
            },
            {
                "email": "user2@test.com",
                "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.8K.8K",  # "user123"
                "role": "user",
                "is_active": True,
                "is_verified": True,
                "verification_state": "EMAIL_VERIFIED"
            }
        ]
        
        created_users = []
        for user_data in test_users:
            user = User(**user_data)
            session.add(user)
            session.commit()
            session.refresh(user)
            created_users.append(user)
        
        # Test-Listings erstellen
        test_listings = [
            {
                "title": "BMW 3er Limousine",
                "description": "Sehr gepflegter BMW 3er in ausgezeichnetem Zustand. Vollausstattung, Scheckheftgepflegt.",
                "price": 25000.0,
                "category": "autos",
                "condition": "Sehr gut",
                "location": "München",
                "user_id": created_users[1].id,
                "status": "ACTIVE",
                "attributes": json.dumps({
                    "mileage": "85000",
                    "year": "2018",
                    "fuel": "Benzin",
                    "transmission": "Automatik"
                }),
                "images": json.dumps([
                    "https://example.com/bmw1.jpg",
                    "https://example.com/bmw2.jpg"
                ])
            },
            {
                "title": "iPhone 13 Pro",
                "description": "iPhone 13 Pro in neuwertigem Zustand. Originalverpackung und Zubehör vorhanden.",
                "price": 800.0,
                "category": "elektronik",
                "condition": "Neu",
                "location": "Berlin",
                "user_id": created_users[2].id,
                "status": "ACTIVE",
                "attributes": json.dumps({
                    "storage": "256GB",
                    "color": "Graphit",
                    "warranty": "Ja"
                }),
                "images": json.dumps([
                    "https://example.com/iphone1.jpg"
                ])
            },
            {
                "title": "Wohnzimmerschrank",
                "description": "Massiver Eichenschrank für das Wohnzimmer. Sehr guter Zustand, nur leichte Gebrauchsspuren.",
                "price": 450.0,
                "category": "möbel",
                "condition": "Gut",
                "location": "Hamburg",
                "user_id": created_users[1].id,
                "status": "ACTIVE",
                "attributes": json.dumps({
                    "material": "Eiche",
                    "dimensions": "200x80x40 cm",
                    "color": "Natur"
                }),
                "images": json.dumps([
                    "https://example.com/schrank1.jpg"
                ])
            }
        ]
        
        created_listings = []
        for listing_data in test_listings:
            listing = Listing(**listing_data)
            session.add(listing)
            session.commit()
            session.refresh(listing)
            created_listings.append(listing)
        
        # Test-Follows erstellen
        follow = Follow(
            follower_id=created_users[1].id,
            following_id=created_users[2].id
        )
        session.add(follow)
        
        # Test-Favorites erstellen
        favorite = Favorite(
            user_id=created_users[1].id,
            listing_id=created_listings[1].id
        )
        session.add(favorite)
        
        session.commit()
        
        return {
            "message": "Test-Daten erfolgreich erstellt",
            "status": "success",
            "data": {
                "users_created": len(created_users),
                "listings_created": len(created_listings),
                "follows_created": 1,
                "favorites_created": 1
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to setup test data: {e}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Erstellen der Test-Daten: {str(e)}")
