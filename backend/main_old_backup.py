import json
import os
import uuid
import logging
from fastapi import FastAPI, HTTPException, Depends, Body, status, Path, Request, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from sqlmodel import SQLModel, Field, Session, create_engine, select, text, update, func
from models import (
    ListingStatus, User, UserRole, Listing, Favorite, TemplateFolder, Template, 
    Conversation, Message, Report, Rating, ListingCreate, ListingUpdate, 
    ListingResponse, TemplateCreate, TemplateUpdate, TemplateFolderCreate, 
    TemplateFolderUpdate, UserCreate, LoginRequest, ProfileUpdate, 
    ReportCreate, RatingCreate, VerificationState, SellerVerification,
    SellerVerificationCreate, SellerVerificationResponse, VerificationDecision,
    EmailVerificationRequest, ResendVerificationRequest, Shop, ShopCreate, ShopUpdate, ShopResponse, ShopReview, ShopReviewCreate, ShopReviewResponse,
    Follow, FollowCreate, FollowResponse, FollowStats,
    Notification, NotificationCreate, NotificationResponse, NotificationStats, NotificationType
)

# Dynamische Formular-Models importieren
from models_dynamic import (
    CategoryResponse, AttributeResponse, AttributeOptionResponse, 
    CategoryAttributeResponse, FormFieldSchema, CategoryFormSchema,
    CategoryCreate, CategoryUpdate, AttributeCreate, AttributeUpdate,
    AttributeOptionCreate, CategoryAttributeCreate, AttributeValue,
    ListingAttributesValidation
)

# AI Service importieren
from ai_service import ai_service
from typing import Optional, List, Dict
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from pydantic import BaseModel, field_validator
from sqlalchemy import or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload
from config import config
import secrets
import uuid
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pathlib import Path as PathLib

# Kategorie-Definitionen für Backend und Frontend
CATEGORIES = {
    "kleinanzeigen": [
        {"id": 1, "name": "Elektronik", "slug": "elektronik", "icon": "/images/categories/iphone_electronics_icon.png", "color": "#3B82F6", "bgColor": "#EFF6FF"},
        {"id": 2, "name": "Haus & Garten", "slug": "haus-garten", "icon": "/images/categories/Haus.png", "color": "#10B981", "bgColor": "#ECFDF5"},
        {"id": 3, "name": "Mode & Beauty", "slug": "mode-beauty", "icon": "/images/categories/Mode.png", "color": "#F59E0B", "bgColor": "#FFFBEB"},
        {"id": 4, "name": "Sport & Hobby", "slug": "sport-hobby", "icon": "/images/categories/sport.webp", "color": "#EF4444", "bgColor": "#FEF2F2"},
        {"id": 5, "name": "Immobilien", "slug": "immobilien", "icon": "/images/categories/Haus.png", "color": "#8B5CF6", "bgColor": "#F5F3FF"},
        {"id": 6, "name": "Bücher & Medien", "slug": "buecher-medien", "icon": "/images/categories/Familie.png", "color": "#EC4899", "bgColor": "#FDF2F8"},
        {"id": 7, "name": "Tiere", "slug": "tiere", "icon": "/images/categories/Haustiere.png", "color": "#06B6D4", "bgColor": "#ECFEFF"},
        {"id": 8, "name": "Dienstleistungen", "slug": "dienstleistungen", "icon": "/images/categories/Jobs.png", "color": "#84CC16", "bgColor": "#F7FEE7"}
    ],
    "autos": [
        {"id": 1, "name": "Autos", "slug": "autos", "icon": "/images/categories/bmw_156x90_enhanced.png", "color": "#3B82F6", "bgColor": "#EFF6FF"},
        {"id": 2, "name": "Motorräder", "slug": "motorraeder", "icon": "/images/categories/bmw_156x90_enhanced.png", "color": "#10B981", "bgColor": "#ECFDF5"},
        {"id": 3, "name": "Auto Teile", "slug": "auto-teile", "icon": "/images/categories/Heimwerk.png", "color": "#F59E0B", "bgColor": "#FFFBEB"},
        {"id": 4, "name": "Zubehör", "slug": "zubehoer", "icon": "/images/categories/Heimwerk.png", "color": "#EF4444", "bgColor": "#FEF2F2"},
        {"id": 5, "name": "Reifen", "slug": "reifen", "icon": "/images/categories/Heimwerk.png", "color": "#8B5CF6", "bgColor": "#F5F3FF"},
        {"id": 6, "name": "Werkzeuge", "slug": "werkzeuge", "icon": "/images/categories/Heimwerk.png", "color": "#EC4899", "bgColor": "#FDF2F8"}
    ]
}

# Logging-Konfiguration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# E-Mail-Konfiguration
mail_config = ConnectionConfig(
    MAIL_USERNAME=config.MAIL_USERNAME,
    MAIL_PASSWORD=config.MAIL_PASSWORD,
    MAIL_FROM=config.MAIL_FROM,
    MAIL_PORT=config.MAIL_PORT,
    MAIL_SERVER=config.MAIL_SERVER,
    MAIL_STARTTLS=config.MAIL_STARTTLS,
    MAIL_SSL_TLS=config.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=PathLib(__file__).parent / 'email_templates'
)

fastmail = FastMail(mail_config)

# Verifizierungs-Token speichern (in Produktion: Redis verwenden)
verification_tokens = {}

# Engine erstellen
engine = create_engine(config.DATABASE_URL)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Konfiguration
SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")
optional_oauth2_scheme = HTTPBearer(auto_error=False)



# ============================================================================
# MODELS (SQLModel) - Importiert aus models.py
# ============================================================================

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("✅ Alle Tabellen erfolgreich erstellt (inkl. Notification-Tabelle)")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            raise credentials_exception
        return user

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_oauth2_scheme)):
    """Optional authentication - returns None if no valid token"""
    print(f"DEBUG: get_current_user_optional called with credentials = {credentials}")
    if not credentials:
        print("DEBUG: No credentials provided")
        return None
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        print(f"DEBUG: Decoded email = {email}")
        if email is None:
            print("DEBUG: No email in payload")
            return None
    except JWTError as e:
        print(f"DEBUG: JWT decode error: {e}")
        return None
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        print(f"DEBUG: Found user = {user}")
        return user

def get_session():
    with Session(engine) as session:
        yield session

def filter_by_json_attribute(query, attribute_name: str, value: any, operator: str = "equals"):
    """Filtert nach JSON-Attributen mit verschiedenen Operatoren"""
    if value is None:
        return query
    
    if operator == "equals":
        if isinstance(value, str):
            return query.where(Listing.attributes.contains(f'"{attribute_name}": "{value}"'))
        else:
            return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    elif operator == "contains":
        return query.where(Listing.attributes.contains(f'"{attribute_name}": "{value}"'))
    elif operator == "range_min":
        # Für Bereichsfilter müssen wir alle Werte <= value finden
        # Das ist komplex mit JSON, daher verwenden wir eine einfachere Lösung
        return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    elif operator == "range_max":
        # Für Bereichsfilter müssen wir alle Werte <= value finden
        return query.where(Listing.attributes.contains(f'"{attribute_name}": {value}'))
    
    return query

# ============================================================================
# FASTAPI APP
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    logger.info("Datenbank-Tabellen erstellt")
    
    yield
    # Shutdown
    logger.info("Anwendung wird beendet")

app = FastAPI(
    title="Kleinanzeigen API",
    description="API für Kleinanzeigen-Plattform mit Autos und Kleinanzeigen",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://127.0.0.1:5178",
        "http://127.0.0.1:5179",
        "http://127.0.0.1:5180",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/images", StaticFiles(directory="../frontend/public/images"), name="images")

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/uploads/{filename:path}")
async def serve_upload_file(filename: str):
    """Serve uploaded files with fallback to placeholder"""
    file_path = f"uploads/{filename}"
    
    # Prüfe ob die Datei existiert
    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    else:
        # Fallback auf Placeholder-Bild
        placeholder_path = "uploads/placeholder-image.jpg"
        if os.path.exists(placeholder_path):
            return FileResponse(
                placeholder_path,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            )
        else:
            # Wenn auch kein Placeholder existiert, 404
            raise HTTPException(status_code=404, detail="File not found")

@app.get("/placeholder-image.jpg")
async def get_placeholder_image():
    """Serve placeholder image"""
    placeholder_path = "uploads/placeholder-image.jpg"
    if os.path.exists(placeholder_path):
        return FileResponse(
            placeholder_path,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    else:
        raise HTTPException(status_code=404, detail="Placeholder image not found")

@app.get("/api/images/{filename:path}")
async def serve_image_with_fallback(filename: str):
    """Serve images with intelligent fallback"""
    # Entferne Leerzeichen aus dem Dateinamen
    clean_filename = filename.replace(" ", "_")
    
    # Versuche verschiedene Pfade
    possible_paths = [
        f"uploads/{clean_filename}",
        f"uploads/{filename}",
        f"uploads/{clean_filename.lower()}",
        f"uploads/{filename.lower()}"
    ]
    
    for file_path in possible_paths:
        if os.path.exists(file_path):
            return FileResponse(
                file_path,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            )
    
    # Fallback auf Picsum statt Placeholder
    # Verwende einen zufälligen Picsum-URL als Fallback
    import random
    random_id = random.randint(1, 1000)
    fallback_url = f"https://picsum.photos/400/300?random={random_id}"
    
    # Redirect zu Picsum
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=fallback_url, status_code=302)

# ============================================================================
# LISTING ENDPOINTS
# ============================================================================

@app.get("/api/listings/user")
def get_user_listings(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Holt alle Anzeigen des eingeloggten Benutzers"""
    try:
        # Hole alle Anzeigen (temporär für Testzwecke)
        query = select(Listing).order_by(Listing.id.desc())
        listings = session.exec(query).all()
        
        # Konvertiere die Daten in das erwartete Format
        user_listings = []
        for listing in listings:
            # Parse JSON-Felder
            try:
                attributes = json.loads(listing.attributes) if listing.attributes else {}
                images = json.loads(listing.images) if listing.images else []
            except json.JSONDecodeError:
                attributes = {}
                images = []
            
            # Konvertiere relative Bildpfade zu absoluten URLs
            if images and isinstance(images, list):
                images = [f"http://localhost:8000{image}" if image.startswith('/') else image for image in images]
            
            # Bestimme den Status
            status = listing.status
            if status == "ACTIVE":
                status = "active"
            elif status == "INACTIVE":
                status = "paused"
            elif status == "SOLD":
                status = "expired"
            else:
                status = "draft"
            
            # Erstelle das Listing-Objekt
            user_listing = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price or 0,
                "category": listing.category,
                "location": listing.location,
                "images": images,
                "user_id": listing.user_id,
                "created_at": listing.created_at.isoformat() if listing.created_at else None,
                "status": status,
                "views": listing.views or 0,
                "messages": 0,
                "favorites": 0,
                "highlighted": attributes.get("highlighted", False),
                "attributes": attributes
            }
            
            # Füge Fahrzeugdetails hinzu, falls es sich um ein Auto handelt
            if listing.category == "autos" and attributes:
                user_listing["vehicleDetails"] = {
                    "marke": attributes.get("marke", ""),
                    "erstzulassung": attributes.get("erstzulassung", ""),
                    "kilometerstand": attributes.get("kilometerstand", ""),
                    "kraftstoff": attributes.get("kraftstoff", ""),
                    "getriebe": attributes.get("getriebe", ""),
                    "leistung": attributes.get("leistung", ""),
                    "farbe": attributes.get("farbe", ""),
                    "unfallfrei": attributes.get("unfallfrei", True)
                }
            
            user_listings.append(user_listing)
        
        return {"listings": user_listings}
        
    except Exception as e:
        logger.error(f"Fehler beim Laden der Benutzer-Anzeigen: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Anzeigen")

@app.get("/api/analytics/user")
def get_user_analytics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Holt Analytics-Daten für den eingeloggten Benutzer"""
    try:
        # Hole alle Anzeigen des Benutzers
        query = select(Listing).where(Listing.user_id == current_user.id)
        listings = session.exec(query).all()
        
        # Berechne Analytics
        total_views = sum(listing.views or 0 for listing in listings)
        
        # Zähle Nachrichten für alle Anzeigen des Benutzers
        total_messages = 0
        listing_messages = {}  # Dictionary für Nachrichten pro Anzeige
        
        for listing in listings:
            # Zähle Nachrichten für diese Anzeige
            messages_query = select(Message).join(Conversation).where(
                Conversation.listing_id == listing.id
            )
            messages = session.exec(messages_query).all()
            message_count = len(messages)
            total_messages += message_count
            listing_messages[listing.id] = message_count
        
        # Zähle Favoriten für alle Anzeigen des Benutzers
        total_favorites = 0
        for listing in listings:
            favorites_query = select(Favorite).where(Favorite.listing_id == listing.id)
            favorites = session.exec(favorites_query).all()
            total_favorites += len(favorites)
        
        # Berechne durchschnittliche Antwortzeit basierend auf echten Daten
        if total_messages > 0:
            total_response_time = 0
            response_count = 0
            
            for listing in listings:
                conversations_query = select(Conversation).where(Conversation.listing_id == listing.id)
                conversations = session.exec(conversations_query).all()
                
                for conversation in conversations:
                    # Hole alle Nachrichten in dieser Konversation, sortiert nach Zeit
                    messages_query = select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at)
                    messages = session.exec(messages_query).all()
                    
                    if len(messages) >= 2:
                        # Berechne Antwortzeit zwischen der ersten Nachricht und der Antwort des Benutzers
                        first_message = messages[0]
                        user_response = None
                        
                        for message in messages[1:]:
                            if message.sender_id == current_user.id:
                                user_response = message
                                break
                        
                        if user_response:
                            response_time = (user_response.created_at - first_message.created_at).total_seconds() / 3600  # In Stunden
                            total_response_time += response_time
                            response_count += 1
            
            if response_count > 0:
                avg_response_time = round(total_response_time / response_count, 1)
            else:
                avg_response_time = 0
        else:
            avg_response_time = 0
        
        # Berechne Antwortrate basierend auf echten Daten
        if total_messages > 0:
            # Zähle Konversationen, auf die der Benutzer geantwortet hat
            responded_conversations = 0
            total_conversations = 0
            
            for listing in listings:
                conversations_query = select(Conversation).where(Conversation.listing_id == listing.id)
                conversations = session.exec(conversations_query).all()
                
                for conversation in conversations:
                    total_conversations += 1
                    # Prüfe, ob der Benutzer auf diese Konversation geantwortet hat
                    user_messages_query = select(Message).where(
                        and_(Message.conversation_id == conversation.id, Message.sender_id == current_user.id)
                    )
                    user_messages = session.exec(user_messages_query).all()
                    
                    if user_messages:
                        responded_conversations += 1
            
            if total_conversations > 0:
                response_rate = round((responded_conversations / total_conversations) * 100)
            else:
                response_rate = 0
        else:
            response_rate = 0
        
        # Top-Performing Listings mit echten Daten
        top_performing = []
        for listing in listings[:5]:  # Top 5
            # Zähle Favoriten für diese Anzeige
            favorites_query = select(Favorite).where(Favorite.listing_id == listing.id)
            favorites = session.exec(favorites_query).all()
            favorite_count = len(favorites)
            
            top_performing.append({
                "id": listing.id,
                "title": listing.title,
                "views": listing.views or 0,
                "messages": listing_messages.get(listing.id, 0),
                "favorites": favorite_count
            })
        
        # Sortiere nach Views
        top_performing.sort(key=lambda x: x["views"], reverse=True)
        
        # Monatliche Statistiken mit echten Daten
        monthly_stats = []
        current_year = datetime.now().year
        
        for month in range(1, 7):  # Januar bis Juni
            month_name = datetime(current_year, month, 1).strftime('%b')
            
            # Zähle Anzeigen, die in diesem Monat erstellt wurden
            month_start = datetime(current_year, month, 1)
            month_end = datetime(current_year, month + 1, 1) if month < 12 else datetime(current_year + 1, 1, 1)
            
            month_listings = [l for l in listings if month_start <= l.created_at < month_end]
            
            month_views = sum(l.views or 0 for l in month_listings)
            month_messages = sum(listing_messages.get(l.id, 0) for l in month_listings)
            
            # Zähle Favoriten für Anzeigen in diesem Monat
            month_favorites = 0
            for listing in month_listings:
                favorites_query = select(Favorite).where(Favorite.listing_id == listing.id)
                favorites = session.exec(favorites_query).all()
                month_favorites += len(favorites)
            
            monthly_stats.append({
                "month": month_name,
                "views": month_views,
                "messages": month_messages,
                "favorites": month_favorites
            })
        
        return {
            "totalViews": total_views,
            "totalMessages": total_messages,
            "totalFavorites": total_favorites,
            "avgResponseTime": avg_response_time,
            "responseRate": response_rate,
            "topPerformingListings": top_performing,
            "monthlyStats": monthly_stats
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Laden der Benutzer-Analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Analytics")

@app.get("/api/listings/simple")
def get_listings_simple(session: Session = Depends(get_session)):
    """Einfacher Test-Endpoint für Listings"""
    try:
        listings = session.exec(select(Listing)).all()
        return {"listings": [], "message": "Test erfolgreich", "count": len(listings)}
    except Exception as e:
        return {"error": str(e), "message": "Test fehlgeschlagen"}

@app.get("/api/listings")
def get_listings(
    # Grundlegende Filter
    category: Optional[str] = Query(None, description="Kategorie: autos oder kleinanzeigen"),
    price_min: Optional[float] = Query(None, description="Minimaler Preis"),
    price_max: Optional[float] = Query(None, description="Maximaler Preis"),
    condition: Optional[str] = Query(None, description="Zustand"),
    location: Optional[str] = Query(None, description="Standort"),
    search: Optional[str] = Query(None, description="Freitext-Suche in Titel und Beschreibung"),
    
    # Auto-spezifische Filter
    marke: Optional[str] = Query(None, description="Marke (nur für Autos)"),
    modell: Optional[str] = Query(None, description="Modell (nur für Autos)"),
    erstzulassung_min: Optional[int] = Query(None, description="Minimale Erstzulassung (nur für Autos)"),
    erstzulassung_max: Optional[int] = Query(None, description="Maximale Erstzulassung (nur für Autos)"),
    kilometerstand_min: Optional[int] = Query(None, description="Minimaler Kilometerstand (nur für Autos)"),
    kilometerstand_max: Optional[int] = Query(None, description="Maximaler Kilometerstand (nur für Autos)"),
    getriebe: Optional[str] = Query(None, description="Getriebe (nur für Autos)"),
    kraftstoff: Optional[str] = Query(None, description="Kraftstoff (nur für Autos)"),
    fahrzeugtyp: Optional[str] = Query(None, description="Fahrzeugtyp: auto, motorrad, wohnmobil, lkw"),
    
    # Kleinanzeigen-spezifische Filter
    zustand: Optional[str] = Query(None, description="Zustand (nur für Kleinanzeigen)"),
    versand: Optional[bool] = Query(None, description="Versand möglich (nur für Kleinanzeigen)"),
    garantie: Optional[bool] = Query(None, description="Garantie (nur für Kleinanzeigen)"),
    kategorie: Optional[str] = Query(None, description="Kategorie (nur für Kleinanzeigen)"),
    
    # Sortierung und Pagination
    sort_by: str = Query("created_at", description="Sortierung: price, created_at, title"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    
    session: Session = Depends(get_session)
):
    """Alle Listings abrufen mit Filtern"""
    
    # Basis-Query
    query = select(Listing).where(Listing.status == ListingStatus.ACTIVE)
    
    # Kategorie-Filter
    if category:
        query = query.where(Listing.category == category)
    
    # Preis-Filter
    if price_min is not None:
        query = query.where(Listing.price >= price_min)
    if price_max is not None:
        query = query.where(Listing.price <= price_max)
    
    # Zustand-Filter
    if condition:
        query = query.where(Listing.condition == condition)
    
    # Standort-Filter
    if location:
        query = query.where(Listing.location.contains(location))
    
    # Freitext-Suche
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Listing.title.contains(search_term),
                Listing.description.contains(search_term)
            )
        )
    
    # Auto-spezifische Filter
    if category == "autos":
        if marke:
            query = filter_by_json_attribute(query, "marke", marke)
        if modell:
            query = filter_by_json_attribute(query, "modell", modell)
        if erstzulassung_min is not None:
            query = filter_by_json_attribute(query, "erstzulassung", erstzulassung_min, "gte")
        if erstzulassung_max is not None:
            query = filter_by_json_attribute(query, "erstzulassung", erstzulassung_max, "lte")
        if kilometerstand_min is not None:
            query = filter_by_json_attribute(query, "kilometerstand", kilometerstand_min, "gte")
        if kilometerstand_max is not None:
            query = filter_by_json_attribute(query, "kilometerstand", kilometerstand_max, "lte")
        if getriebe:
            query = filter_by_json_attribute(query, "getriebe", getriebe)
        if kraftstoff:
            query = filter_by_json_attribute(query, "kraftstoff", kraftstoff)
        if fahrzeugtyp:
            query = filter_by_json_attribute(query, "fahrzeugtyp", fahrzeugtyp)
    
    # Kleinanzeigen-spezifische Filter
    if category == "kleinanzeigen":
        if zustand:
            query = filter_by_json_attribute(query, "zustand", zustand)
        if versand is not None:
            query = filter_by_json_attribute(query, "versand", versand)
        if garantie is not None:
            query = filter_by_json_attribute(query, "garantie", garantie)
        if kategorie:
            query = filter_by_json_attribute(query, "kategorie", kategorie)
    
    # Sortierung
    if sort_by == "price":
        if sort_order == "asc":
            query = query.order_by(Listing.price.asc())
        else:
            query = query.order_by(Listing.price.desc())
    elif sort_by == "title":
        if sort_order == "asc":
            query = query.order_by(Listing.title.asc())
        else:
            query = query.order_by(Listing.title.desc())
    else:  # created_at
        if sort_order == "asc":
            query = query.order_by(Listing.created_at.asc())
        else:
            query = query.order_by(Listing.created_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    # Ausführen
    listings = session.exec(query).all()
    
    # Response formatieren
    response_listings = []
    for listing in listings:
        listing_data = listing.dict()
        try:
            listing_data["attributes"] = json.loads(listing.attributes)
            listing_data["images"] = json.loads(listing.images)
        except:
            listing_data["attributes"] = {}
            listing_data["images"] = []
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if user.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            listing_data["seller"] = {
                "id": user.id,  # WICHTIG: User-ID hinzufügen
                "name": user.email.split('@')[0],
                "avatar": None,
                "rating": 4.5,
                "reviewCount": 12,
                "userType": user.verification_state.value if user.verification_state else "unverified",
                "badge": seller_badge
            }
        else:
            listing_data["seller"] = {
                "id": None,  # Keine ID wenn User nicht gefunden
                "name": "Unbekannt",
                "avatar": None,
                "rating": 0.0,
                "reviewCount": 0,
                "userType": "unverified",
                "badge": None
            }
        
        response_listings.append(listing_data)
    
    return response_listings

@app.post("/api/listings")
def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Listing erstellen"""
    
    # Neues Listing erstellen
    new_listing = Listing(
        title=listing.title,
        description=listing.description,
        category=listing.category,
        condition=listing.condition,
        location=listing.location,
        price=listing.price,
        attributes=json.dumps(listing.attributes) if listing.attributes else "{}",
        images=json.dumps(listing.images) if listing.images else "[]",
        user_id=current_user.id
    )
    
    session.add(new_listing)
    session.commit()
    session.refresh(new_listing)
    
    # Response formatieren
    response = new_listing.dict()
    response["attributes"] = listing.attributes
    response["images"] = listing.images
    
    return response

@app.get("/api/listings/{listing_id}")
def get_listing_by_id(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Einzelnes Listing abrufen"""
    
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Views erhöhen
    listing.views += 1
    session.add(listing)
    session.commit()
    
    # Response formatieren - manuell alle Felder extrahieren
    response = {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "price": listing.price,
        "category": listing.category,
        "location": listing.location,
        "status": listing.status,
        "views": listing.views,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
        "user_id": listing.user_id
    }
    
    try:
        response["attributes"] = json.loads(listing.attributes) if listing.attributes else {}
        response["images"] = json.loads(listing.images) if listing.images else []
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            # Badge für verifizierte Verkäufer
            seller_badge = None
            if user.verification_state == VerificationState.SELLER_VERIFIED:
                seller_badge = "verified_seller"
            
            # Follow-Status prüfen (nur wenn User eingeloggt ist)
            is_following = False
            print(f"DEBUG: current_user = {current_user}")
            print(f"DEBUG: listing.user_id = {listing.user_id}")
            if current_user:  # Gleiche Logik wie Profil-API
                print(f"DEBUG: Checking follow status for user {current_user.id} -> {user.id}")
                follow_exists = session.exec(
                    select(Follow).where(
                        and_(
                            Follow.follower_id == current_user.id,
                            Follow.following_id == user.id
                        )
                    )
                ).first()
                is_following = follow_exists is not None
                print(f"DEBUG: Follow exists = {follow_exists}, is_following = {is_following}")
            else:
                print(f"DEBUG: No current_user, is_following = {is_following}")
            
            response["seller"] = {
                "id": user.id,  # WICHTIG: User-ID hinzufügen für Follow-Button
                "name": user.email.split('@')[0],  # Name aus E-Mail extrahieren
                "avatar": None,  # Platzhalter für Avatar
                "rating": 4.5,   # Platzhalter-Rating
                "reviewCount": 12,  # Platzhalter-Review-Count
                "userType": user.verification_state.value if user.verification_state else "unverified",
                "badge": seller_badge,
                "isFollowing": is_following  # Follow-Status hinzufügen
            }
        else:
            response["seller"] = {
                "id": None,  # Keine ID wenn User nicht gefunden
                "name": "Unbekannt",
                "avatar": None,
                "rating": 0.0,
                "reviewCount": 0,
                "userType": "unverified",
                "badge": None,
                "isFollowing": False  # Follow-Status hinzufügen
            }
    except Exception as e:
        print(f"Fehler beim Parsen der JSON-Felder: {e}")
        response["attributes"] = {}
        response["images"] = []
        response["seller"] = {
            "id": None,  # Keine ID bei Fehler
            "name": "Unbekannt",
            "avatar": None,
            "rating": 0.0,
            "reviewCount": 0,
            "userType": "unverified",
            "badge": None,
            "isFollowing": False  # Follow-Status hinzufügen
        }
    
    return response

@app.put("/api/listings/{listing_id}")
def update_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    listing_update: ListingUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing bearbeiten"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann bearbeiten
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Bearbeiten dieses Listings")
    
    # Felder aktualisieren
    update_data = listing_update.dict(exclude_unset=True)
    
    if "attributes" in update_data:
        update_data["attributes"] = json.dumps(update_data["attributes"])
    if "images" in update_data:
        update_data["images"] = json.dumps(update_data["images"])
    
    # Timestamp aktualisieren
    update_data["updated_at"] = datetime.utcnow()
    
    # Listing aktualisieren
    for field, value in update_data.items():
        if hasattr(listing, field):
            setattr(listing, field, value)
    
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Response formatieren
    response = listing.dict()
    try:
        response["attributes"] = json.loads(listing.attributes)
        response["images"] = json.loads(listing.images)
    except:
        response["attributes"] = {}
        response["images"] = []
    
    return response

@app.patch("/api/listings/{listing_id}/status")
def toggle_listing_status(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing-Status umschalten (active/paused)"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann Status ändern
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Ändern des Status dieses Listings")
    
    # Status umschalten
    if listing.status == "active":
        listing.status = "inactive"  # Frontend erwartet "paused", aber DB speichert "inactive"
    else:
        listing.status = "active"
    
    listing.updated_at = datetime.utcnow()
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    # Status für Frontend konvertieren
    frontend_status = "active" if listing.status == "active" else "paused"
    
    return {
        "message": f"Listing-Status erfolgreich auf '{frontend_status}' gesetzt",
        "status": frontend_status,
        "listing_id": listing.id
    }

@app.patch("/api/listings/{listing_id}/highlight")
def toggle_listing_highlight(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing-Hervorhebung umschalten"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann Hervorhebung ändern
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Ändern der Hervorhebung dieses Listings")
    
    # Hervorhebung umschalten (wir speichern es in den Attributen)
    try:
        attributes = json.loads(listing.attributes) if listing.attributes else {}
    except json.JSONDecodeError:
        attributes = {}
    
    current_highlight = attributes.get("highlighted", False)
    attributes["highlighted"] = not current_highlight
    
    listing.attributes = json.dumps(attributes)
    listing.updated_at = datetime.utcnow()
    session.add(listing)
    session.commit()
    session.refresh(listing)
    
    new_highlight_status = attributes["highlighted"]
    
    return {
        "message": f"Listing-Hervorhebung erfolgreich {'aktiviert' if new_highlight_status else 'deaktiviert'}",
        "highlighted": new_highlight_status,
        "listing_id": listing.id
    }

@app.delete("/api/listings/{listing_id}")
def delete_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Listing löschen"""
    
    # Listing finden
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Berechtigung prüfen: Nur Ersteller oder Admin kann löschen
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Löschen dieses Listings")
    
    # Alle zugehörigen Favoriten löschen
    favorites = session.exec(select(Favorite).where(Favorite.listing_id == listing_id)).all()
    for favorite in favorites:
        session.delete(favorite)
    
    # Alle zugehörigen Konversationen löschen
    conversations = session.exec(select(Conversation).where(Conversation.listing_id == listing_id)).all()
    for conversation in conversations:
        # Alle Nachrichten der Konversation löschen
        messages = session.exec(select(Message).where(Message.conversation_id == conversation.id)).all()
        for message in messages:
            session.delete(message)
        session.delete(conversation)
    
    # Listing löschen
    session.delete(listing)
    session.commit()
    
    return {"message": "Listing erfolgreich gelöscht"}

# ============================================================================
# AUTHENTIFIZIERUNG
# ============================================================================

@app.post("/api/register")
async def register(email: str = Body(...), password: str = Body(...)):
    """Benutzer registrieren"""
    
    with Session(engine) as session:
        # Prüfen ob E-Mail bereits existiert
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
        
        # Neuen Benutzer erstellen
        hashed_password = get_password_hash(password)
        new_user = User(
            email=email, 
            hashed_password=hashed_password,
            verification_state=VerificationState.UNVERIFIED
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        # Verifizierungs-Token generieren und E-Mail senden
        verification_token = secrets.token_urlsafe(32)
        verification_tokens[verification_token] = {
            "user_id": new_user.id,
            "email": email,
            "expires": datetime.utcnow() + timedelta(hours=24)
        }
        
        # Verifizierungs-E-Mail senden
        verification_url = f"http://localhost:5174/verify-email?token={verification_token}"
        
        try:
            message = MessageSchema(
                subject="E-Mail-Adresse bestätigen - tüka",
                recipients=[email],
                template_body={
                    "verification_url": verification_url
                },
                subtype="html"
            )
            await fastmail.send_message(message, template_name="verification.html")
        except Exception as e:
            logger.error(f"Fehler beim Senden der Verifizierungs-E-Mail: {e}")
            # E-Mail-Fehler sollte die Registrierung nicht blockieren
        
        return {
            "message": "Benutzer erfolgreich registriert. Bitte bestätigen Sie Ihre E-Mail-Adresse.",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "role": new_user.role,
                "verification_state": new_user.verification_state
            }
        }

@app.post("/api/login")
def login(login_data: LoginRequest):
    """Benutzer anmelden"""
    
    try:
        logger.info(f"LOGIN DEBUG: Starting login for email={login_data.email}")
        
        with Session(engine) as session:
            logger.info("LOGIN DEBUG: Session created successfully")
            
            user = session.exec(select(User).where(User.email == login_data.email)).first()
            logger.info(f"LOGIN DEBUG: email={login_data.email}, user_found={user is not None}")
            
            if user:
                logger.info(f"LOGIN DEBUG: user_id={user.id}, is_active={user.is_active}")
                password_valid = verify_password(login_data.password, user.hashed_password)
                logger.info(f"LOGIN DEBUG: password_valid={password_valid}")
            else:
                logger.info("LOGIN DEBUG: user not found")
            
            if not user or not verify_password(login_data.password, user.hashed_password):
                logger.info("LOGIN DEBUG: Authentication failed - raising 401")
                raise HTTPException(status_code=401, detail="Ungültige E-Mail oder Passwort")
            
            if not user.is_active:
                logger.info("LOGIN DEBUG: User inactive - raising 400")
                raise HTTPException(status_code=400, detail="Benutzer ist deaktiviert")
            
            # Access Token erstellen
            logger.info("LOGIN DEBUG: Creating access token")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )
            logger.info("LOGIN DEBUG: Access token created successfully")
            
            result = {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role
                }
            }
            logger.info("LOGIN DEBUG: Login successful - returning result")
            return result
            
    except HTTPException as e:
        logger.info(f"LOGIN DEBUG: HTTPException raised: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"LOGIN DEBUG: Unexpected error: {str(e)}")
        logger.error(f"LOGIN DEBUG: Error type: {type(e).__name__}")
        import traceback
        logger.error(f"LOGIN DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    """Aktueller Benutzer"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "verification_state": current_user.verification_state
    }

# ============================================================================
# E-MAIL VERIFIZIERUNG
# ============================================================================

@app.post("/api/auth/verify-email")
async def verify_email(token: str = Body(...)):
    """E-Mail-Verifizierung mit Token"""
    
    if token not in verification_tokens:
        raise HTTPException(status_code=400, detail="Ungültiger oder abgelaufener Token")
    
    token_data = verification_tokens[token]
    
    # Prüfen ob Token abgelaufen ist
    if datetime.utcnow() > token_data["expires"]:
        del verification_tokens[token]
        raise HTTPException(status_code=400, detail="Token ist abgelaufen")
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == token_data["user_id"])).first()
        if not user:
            raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        
        # E-Mail als verifiziert markieren
        user.verification_state = VerificationState.EMAIL_VERIFIED
        user.email_verified_at = datetime.utcnow()
        user.is_verified = True
        
        session.commit()
        
        # Token löschen
        del verification_tokens[token]
        
        return {
            "message": "E-Mail-Adresse erfolgreich bestätigt",
            "verification_state": user.verification_state
        }

@app.post("/api/auth/resend-verification")
async def resend_verification(email: str = Body(...)):
    """Verifizierungs-E-Mail erneut senden"""
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        
        if user.verification_state == VerificationState.EMAIL_VERIFIED:
            raise HTTPException(status_code=400, detail="E-Mail ist bereits verifiziert")
        
        # Neuen Verifizierungs-Token generieren
        verification_token = secrets.token_urlsafe(32)
        verification_tokens[verification_token] = {
            "user_id": user.id,
            "email": email,
            "expires": datetime.utcnow() + timedelta(hours=24)
        }
        
        # Verifizierungs-E-Mail senden
        verification_url = f"http://localhost:5174/verify-email?token={verification_token}"
        
        try:
            message = MessageSchema(
                subject="E-Mail-Adresse bestätigen - tüka",
                recipients=[email],
                template_body={
                    "verification_url": verification_url
                },
                subtype="html"
            )
            await fastmail.send_message(message, template_name="verification.html")
            
            return {"message": "Verifizierungs-E-Mail wurde erneut gesendet"}
        except Exception as e:
            logger.error(f"Fehler beim Senden der Verifizierungs-E-Mail: {e}")
            raise HTTPException(status_code=500, detail="Fehler beim Senden der E-Mail")

# ============================================================================
# SELLER VERIFIZIERUNG
# ============================================================================

@app.post("/api/seller/verification")
async def submit_seller_verification(
    verification_type: str = Form(...),
    company_name: str = Form(...),
    tax_id: str = Form(...),
    documents: List[UploadFile] = File(...),
    document_types: List[str] = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Verkäufer-Verifizierung einreichen"""
    
    # Prüfen ob User bereits verifiziert ist
    if current_user.verification_state != VerificationState.EMAIL_VERIFIED:
        raise HTTPException(
            status_code=400, 
            detail="E-Mail-Adresse muss zuerst verifiziert werden"
        )
    
    # Prüfen ob bereits ein Verifizierungsantrag läuft
    with Session(engine) as session:
        existing_verification = session.exec(
            select(SellerVerification)
            .where(SellerVerification.user_id == current_user.id)
            .where(SellerVerification.status.in_(["pending", "approved"]))
        ).first()
        
        if existing_verification:
            raise HTTPException(
                status_code=400, 
                detail="Verifizierungsantrag läuft bereits oder ist bereits genehmigt"
            )
        
        # Neue Verifizierung erstellen
        new_verification = SellerVerification(
            user_id=current_user.id,
            verification_type=verification_data.verification_type,
            company_name=verification_data.company_name,
            tax_id=verification_data.tax_id
        )
        
        # Dokumente setzen
        new_verification.set_documents(verification_data.documents)
        new_verification.set_document_types(verification_data.document_types)
        
        session.add(new_verification)
        session.commit()
        session.refresh(new_verification)
        
        # User-Status auf SELLER_PENDING setzen
        current_user.verification_state = VerificationState.SELLER_PENDING
        session.commit()
        
        return {
            "message": "Verifizierungsantrag erfolgreich eingereicht",
            "verification_id": new_verification.id,
            "status": new_verification.status,
            "verification_state": current_user.verification_state
        }

@app.get("/api/seller/verification/status")
async def get_seller_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Status der Seller-Verifizierung abrufen"""
    
    with Session(engine) as session:
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

@app.post("/api/admin/verification/{verification_id}/decision")
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

@app.get("/api/admin/verifications")
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

# ============================================================================
# USER MANAGEMENT
# ============================================================================

@app.get("/api/users/public")
async def get_users_public(
    limit: int = Query(20, description="Anzahl der User pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    search: Optional[str] = Query(None, description="Suche nach E-Mail oder Namen"),
    verification_state: Optional[str] = Query(None, description="Filter nach Verifizierungsstatus")
):
    """Alle User abrufen (öffentlich, ohne Authentifizierung)"""
    
    with Session(engine) as session:
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
        
        # Gesamtanzahl für Paginierung
        total_count = len(session.exec(query).all())
        
        # Paginierung anwenden
        query = query.offset(offset).limit(limit)
        
        users = session.exec(query.order_by(User.created_at.desc())).all()
        
        result = []
        for user in users:
            # Verifizierungsstatus-Text
            verification_text = "Unverifiziert"
            if user.verification_state == VerificationState.EMAIL_VERIFIED:
                verification_text = "E-Mail verifiziert"
            elif user.verification_state == VerificationState.SELLER_PENDING:
                verification_text = "Verkäufer-Verifizierung läuft"
            elif user.verification_state == VerificationState.SELLER_VERIFIED:
                verification_text = "Verkäufer verifiziert"
            elif user.verification_state == VerificationState.SELLER_REVOKED:
                verification_text = "Verkäufer-Verifizierung entzogen"
            elif user.verification_state == VerificationState.BANNED:
                verification_text = "Gesperrt"
            
            result.append({
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name or "Nicht angegeben",
                "last_name": user.last_name or "Nicht angegeben",
                "role": user.role.value if user.role else "user",
                "verification_state": user.verification_state.value if user.verification_state else "unverified",
                "verification_text": verification_text,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
                "seller_verified_at": user.seller_verified_at.isoformat() if user.seller_verified_at else None,
                "location": user.location or "Nicht angegeben",
                "phone": user.phone or "Nicht angegeben",
                "bio": user.bio or "Keine Beschreibung",
                "website": user.website,
                "avatar": user.avatar
            })
        
        return {
            "users": result,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }

@app.get("/api/users")
async def get_users(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der User pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    search: Optional[str] = Query(None, description="Suche nach E-Mail oder Namen"),
    verification_state: Optional[str] = Query(None, description="Filter nach Verifizierungsstatus")
):
    """Alle User abrufen (mit Paginierung und Filtern)"""
    
    with Session(engine) as session:
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
        
        # Gesamtanzahl für Paginierung
        total_count = len(session.exec(query).all())
        
        # Paginierung anwenden
        query = query.offset(offset).limit(limit)
        
        users = session.exec(query.order_by(User.created_at.desc())).all()
        
        result = []
        for user in users:
            # Verifizierungsstatus-Text
            verification_text = "Unverifiziert"
            if user.verification_state == VerificationState.EMAIL_VERIFIED:
                verification_text = "E-Mail verifiziert"
            elif user.verification_state == VerificationState.SELLER_PENDING:
                verification_text = "Verkäufer-Verifizierung läuft"
            elif user.verification_state == VerificationState.SELLER_VERIFIED:
                verification_text = "Verkäufer verifiziert"
            elif user.verification_state == VerificationState.SELLER_REVOKED:
                verification_text = "Verkäufer-Verifizierung entzogen"
            elif user.verification_state == VerificationState.BANNED:
                verification_text = "Gesperrt"
            
            result.append({
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name or "Nicht angegeben",
                "last_name": user.last_name or "Nicht angegeben",
                "role": user.role.value if user.role else "user",
                "verification_state": user.verification_state.value if user.verification_state else "unverified",
                "verification_text": verification_text,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
                "seller_verified_at": user.seller_verified_at.isoformat() if user.seller_verified_at else None,
                "location": user.location or "Nicht angegeben",
                "phone": user.phone or "Nicht angegeben",
                "bio": user.bio or "Keine Beschreibung"
            })
        
        return {
            "users": result,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }

@app.get("/api/users/{user_id}")
async def get_user_by_id(
    user_id: int = Path(..., description="ID des Users"),
    current_user: User = Depends(get_current_user)
):
    """Einzelnen User abrufen"""
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == user_id)).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        
        # Verifizierungsstatus-Text
        verification_text = "Unverifiziert"
        if user.verification_state == VerificationState.EMAIL_VERIFIED:
            verification_text = "E-Mail verifiziert"
        elif user.verification_state == VerificationState.SELLER_PENDING:
            verification_text = "Verkäufer-Verifizierung läuft"
        elif user.verification_state == VerificationState.SELLER_VERIFIED:
            verification_text = "Verkäufer verifiziert"
        elif user.verification_state == VerificationState.SELLER_REVOKED:
            verification_text = "Verkäufer-Verifizierung entzogen"
        elif user.verification_state == VerificationState.BANNED:
            verification_text = "Gesperrt"
        
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name or "Nicht angegeben",
            "last_name": user.last_name or "Nicht angegeben",
            "role": user.role.value if user.role else "user",
            "verification_state": user.verification_state.value if user.verification_state else "unverified",
            "verification_text": verification_text,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
            "seller_verified_at": user.seller_verified_at.isoformat() if user.seller_verified_at else None,
            "location": user.location or "Nicht angegeben",
            "phone": user.phone or "Nicht angegeben",
            "bio": user.bio or "Keine Beschreibung",
            "website": user.website,
            "avatar": user.avatar
    }

@app.get("/api/users/{user_id}/profile")
async def get_user_profile_public(
    user_id: int = Path(..., description="ID des Users"),
    limit: int = Query(20, description="Anzahl der Listings pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Öffentliches User-Profil mit allen Listings abrufen (ohne Authentifizierung)"""
    
    try:
        with Session(engine) as session:
            # User, Shop oder Dienstleister abrufen
            user = session.exec(select(User).where(User.id == user_id)).first()
            shop = session.exec(select(Shop).where(Shop.id == user_id)).first()
            
            # Entität bestimmen
            entity = None
            entity_type = "user"
            
            if user:
                entity = user
                entity_type = "user"
            elif shop:
                entity = shop
                entity_type = "shop"
            else:
                raise HTTPException(status_code=404, detail=f"Entität mit ID {user_id} nicht gefunden")
            
            # Alle Listings des Users abrufen
            listings_query = select(Listing).where(
                Listing.user_id == user_id
            ).order_by(desc(Listing.created_at))
            
            # Paginierung anwenden
            listings_query = listings_query.offset(offset).limit(limit)
            listings = session.exec(listings_query).all()
            
            # Gesamtanzahl der Listings für Paginierung
            total_count = session.exec(
                select(func.count(Listing.id)).where(
                    Listing.user_id == user_id
                )
            ).first()
            
            # Verifizierungsstatus-Text basierend auf Entitätstyp
            verification_text = "Unverifiziert"
            is_verified = False
            
            if entity_type == "user":
                if user.verification_state == VerificationState.EMAIL_VERIFIED:
                    verification_text = "E-Mail verifiziert"
                    is_verified = True
                elif user.verification_state == VerificationState.SELLER_PENDING:
                    verification_text = "Verkäufer-Verifizierung läuft"
                elif user.verification_state == VerificationState.SELLER_VERIFIED:
                    verification_text = "Verkäufer verifiziert"
                    is_verified = True
                elif user.verification_state == VerificationState.SELLER_REVOKED:
                    verification_text = "Verkäufer-Verifizierung entzogen"
                elif user.verification_state == VerificationState.BANNED:
                    verification_text = "Gesperrt"
            elif entity_type == "shop":
                if shop.verified:
                    verification_text = "Shop verifiziert"
                    is_verified = True
            
            # Listings in Response-Format konvertieren
            listings_data = []
            for listing in listings:
                try:
                    # Bilder als Array parsen
                    import json
                    try:
                        images = json.loads(listing.images) if listing.images else []
                    except (json.JSONDecodeError, TypeError):
                        images = []
                    
                    listings_data.append({
                        "id": listing.id,
                        "title": listing.title or "Kein Titel",
                        "description": listing.description or "Keine Beschreibung",
                        "price": listing.price or 0,
                        "currency": "EUR",
                        "category": listing.category or "Unbekannt",
                        "subcategory": None,
                        "location": listing.location or "Unbekannt",
                        "images": images,
                        "status": listing.status.value if listing.status else "unknown",
                        "created_at": listing.created_at.isoformat() if listing.created_at else None,
                        "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
                        "user_id": listing.user_id,
                        "is_featured": False,
                        "view_count": listing.views or 0,
                        "contact_phone": None,
                        "contact_email": None,
                        "condition": listing.condition,
                        "delivery_options": []
                    })
                except Exception as e:
                    # Skip problematic listings
                    continue
            
            # Follow-Statistiken abrufen
            followers_count = session.exec(
                select(func.count(Follow.id)).where(Follow.following_id == user_id)
            ).first() or 0
            
            # Following-Count (nur für Users, nicht für Shops)
            following_count = 0
            if entity_type == "user":
                following_count = session.exec(
                    select(func.count(Follow.id)).where(Follow.follower_id == user_id)
                ).first() or 0
            
            # Prüfen ob aktueller User diesem Account folgt
            is_following = False
            if current_user:
                existing_follow = session.exec(
                    select(Follow).where(
                        Follow.follower_id == current_user.id,
                        Follow.following_id == user_id
                    )
                ).first()
                is_following = existing_follow is not None
            
            # Response basierend auf Entitätstyp erstellen
            if entity_type == "user":
                user_data = {
                    "id": user.id,
                    "first_name": user.first_name or "Nicht angegeben",
                    "last_name": user.last_name or "Nicht angegeben",
                    "verification_state": user.verification_state.value if user.verification_state else "unverified",
                    "verification_text": verification_text,
                    "is_verified": is_verified,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "location": user.location or "Nicht angegeben",
                    "phone": user.phone or "Nicht angegeben",
                    "bio": user.bio or "Keine Beschreibung",
                    "website": user.website,
                    "avatar": user.avatar,
                    "followers_count": followers_count,
                    "following_count": following_count,
                    "is_following": is_following
                }
            elif entity_type == "shop":
                user_data = {
                    "id": shop.id,
                    "first_name": shop.name or "Nicht angegeben",
                    "last_name": "",  # Shops haben keinen Nachnamen
                    "verification_state": "verified" if shop.verified else "unverified",
                    "verification_text": verification_text,
                    "is_verified": is_verified,
                    "created_at": shop.created_at.isoformat() if shop.created_at else None,
                    "location": shop.location or "Nicht angegeben",
                    "phone": shop.phone or "Nicht angegeben",
                    "bio": shop.description or "Keine Beschreibung",
                    "website": shop.website,
                    "avatar": shop.image,
                    "followers_count": followers_count,
                    "following_count": following_count,
                    "is_following": is_following
                }
            
            return {
                "user": user_data,
                "listings": listings_data,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < total_count
                }
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")

@app.get("/api/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Benutzerprofil abrufen"""
    try:
        # JSON-Felder parsen
        preferences = json.loads(current_user.preferences) if current_user.preferences else {}
        notification_settings = json.loads(current_user.notification_settings) if current_user.notification_settings else {}
        privacy_settings = json.loads(current_user.privacy_settings) if current_user.privacy_settings else {}
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "phone": current_user.phone,
            "bio": current_user.bio,
            "location": current_user.location,
            "website": current_user.website,
            "avatar": current_user.avatar,
            "role": current_user.role,
            "is_verified": current_user.is_verified,
            "preferences": preferences,
            "notification_settings": notification_settings,
            "privacy_settings": privacy_settings,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Laden des Profils: {str(e)}")

@app.put("/api/profile")
def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Benutzerprofil aktualisieren"""
    try:
        # Aktualisiere nur die gesendeten Felder
        if profile_data.first_name is not None:
            current_user.first_name = profile_data.first_name
        if profile_data.last_name is not None:
            current_user.last_name = profile_data.last_name
        if profile_data.phone is not None:
            current_user.phone = profile_data.phone
        if profile_data.bio is not None:
            current_user.bio = profile_data.bio
        if profile_data.location is not None:
            current_user.location = profile_data.location
        if profile_data.website is not None:
            current_user.website = profile_data.website
        if profile_data.avatar is not None:
            current_user.avatar = profile_data.avatar
        if profile_data.preferences is not None:
            current_user.preferences = json.dumps(profile_data.preferences)
        if profile_data.notification_settings is not None:
            current_user.notification_settings = json.dumps(profile_data.notification_settings)
        if profile_data.privacy_settings is not None:
            current_user.privacy_settings = json.dumps(profile_data.privacy_settings)
        
        current_user.updated_at = datetime.utcnow()
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
        # JSON-Felder parsen für Response
        preferences = json.loads(current_user.preferences) if current_user.preferences else {}
        notification_settings = json.loads(current_user.notification_settings) if current_user.notification_settings else {}
        privacy_settings = json.loads(current_user.privacy_settings) if current_user.privacy_settings else {}
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "phone": current_user.phone,
            "bio": current_user.bio,
            "location": current_user.location,
            "website": current_user.website,
            "avatar": current_user.avatar,
            "role": current_user.role,
            "is_verified": current_user.is_verified,
            "preferences": preferences,
            "notification_settings": notification_settings,
            "privacy_settings": privacy_settings,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren des Profils: {str(e)}")

# ============================================================================
# FAVORITEN
# ============================================================================

@app.post("/api/favorites/{listing_id}")
def add_favorite(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Favorit hinzufügen"""
    
    # Prüfen ob Listing existiert
    listing = session.exec(select(Listing).where(Listing.id == listing_id)).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing nicht gefunden")
    
    # Prüfen ob bereits Favorit
    existing_favorite = session.exec(
        select(Favorite).where(
            and_(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id)
        )
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Bereits als Favorit markiert")
    
    # Favorit hinzufügen
    new_favorite = Favorite(user_id=current_user.id, listing_id=listing_id)
    session.add(new_favorite)
    session.commit()
    
    return {"message": "Favorit hinzugefügt"}

@app.delete("/api/favorites/{listing_id}")
def remove_favorite(
    listing_id: int = Path(..., description="ID des Listings"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Favorit entfernen"""
    
    favorite = session.exec(
        select(Favorite).where(
            and_(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id)
        )
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorit nicht gefunden")
    
    session.delete(favorite)
    session.commit()
    
    return {"message": "Favorit entfernt"}

@app.get("/api/favorites")
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Favoriten des Benutzers"""
    
    favorites = session.exec(
        select(Favorite, Listing)
        .join(Listing)
        .where(Favorite.user_id == current_user.id)
    ).all()
    
    results = []
    for favorite, listing in favorites:
        # Struktur wie Frontend erwartet: {favorite_id, created_at, listing: {...}}
        favorite_dict = {
            "favorite_id": favorite.id,
            "created_at": favorite.created_at.isoformat(),
            "listing": {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price,
                "category": listing.category,
                "location": listing.location,
                "images": listing.images,
                "user_id": listing.user_id,
                "created_at": listing.created_at.isoformat()
            }
        }
        
        # JSON-Felder parsen - sicherer mit None-Check
        if listing.attributes and listing.attributes.strip():
            try:
                favorite_dict["listing"]["attributes"] = json.loads(listing.attributes)
            except (json.JSONDecodeError, TypeError):
                favorite_dict["listing"]["attributes"] = {}
        else:
            favorite_dict["listing"]["attributes"] = {}
            
        if listing.images and listing.images.strip():
            try:
                favorite_dict["listing"]["images"] = json.loads(listing.images)
            except (json.JSONDecodeError, TypeError):
                favorite_dict["listing"]["images"] = []
        else:
            favorite_dict["listing"]["images"] = []
            
        results.append(favorite_dict)
    
    return {"favorites": results}

# ============================================================================
# VORLAGEN
# ============================================================================

@app.get("/api/templates")
def get_user_templates(
    search: Optional[str] = Query(None, description="Suchbegriff"),
    category: Optional[str] = Query(None, description="Kategorie: autos oder kleinanzeigen"),
    folder_id: Optional[int] = Query(None, description="Ordner ID"),
    status: Optional[str] = Query(None, description="Status: draft, active, paused"),
    sort_by: str = Query("created_at", description="Sortierung: created_at, title, price"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Vorlagen des Benutzers abrufen"""
    
    # Basis-Query
    query = select(Template).where(Template.user_id == current_user.id)
    
    # Filter anwenden
    if search:
        query = query.where(
            or_(
                Template.title.contains(search),
                Template.description.contains(search)
            )
        )
    
    if category:
        query = query.where(Template.category == category)
    
    if folder_id:
        query = query.where(Template.folder_id == folder_id)
    
    if status:
        query = query.where(Template.status == status)
    
    # Sortierung
    if sort_by == "title":
        query = query.order_by(Template.title.desc() if sort_order == "desc" else Template.title.asc())
    elif sort_by == "price":
        query = query.order_by(Template.price.desc() if sort_order == "desc" else Template.price.asc())
    else:
        query = query.order_by(Template.created_at.desc() if sort_order == "desc" else Template.created_at.asc())
    
    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    templates = session.exec(query).all()
    
    results = []
    for template in templates:
        template_dict = template.dict()
        try:
            template_dict["attributes"] = json.loads(template.attributes)
            template_dict["images"] = json.loads(template.images)
        except:
            template_dict["attributes"] = {}
            template_dict["images"] = []
        results.append(template_dict)
    
    return {
        "templates": results,
        "total": len(results),
        "page": page,
        "limit": limit
    }

@app.post("/api/templates")
def create_template(
    template_data: TemplateCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Vorlage erstellen"""
    
    new_template = Template(
        user_id=current_user.id,
        title=template_data.title,
        description=template_data.description,
        category=template_data.category,
        condition=template_data.condition,
        location=template_data.location,
        price=template_data.price,
        attributes=json.dumps(template_data.attributes or {}),
        images=json.dumps(template_data.images or []),
        folder_id=template_data.folder_id
    )
    
    session.add(new_template)
    session.commit()
    session.refresh(new_template)
    
    return {
        "message": "Vorlage erfolgreich erstellt",
        "template": {
            "id": new_template.id,
            "title": new_template.title,
            "category": new_template.category
        }
    }

@app.get("/api/templates/{template_id}")
def get_template_by_id(
    template_id: int = Path(..., description="ID der Vorlage"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Einzelne Vorlage abrufen"""
    
    template = session.exec(
        select(Template).where(
            and_(Template.id == template_id, Template.user_id == current_user.id)
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    
    template_dict = template.dict()
    try:
        template_dict["attributes"] = json.loads(template.attributes)
        template_dict["images"] = json.loads(template.images)
    except:
        template_dict["attributes"] = {}
        template_dict["images"] = []
    
    return template_dict

@app.put("/api/templates/{template_id}")
def update_template(
    template_id: int = Path(..., description="ID der Vorlage"),
    template_data: TemplateUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Vorlage aktualisieren"""
    
    template = session.exec(
        select(Template).where(
            and_(Template.id == template_id, Template.user_id == current_user.id)
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    
    # Aktualisiere nur die gesendeten Felder
    if template_data.title is not None:
        template.title = template_data.title
    if template_data.description is not None:
        template.description = template_data.description
    if template_data.category is not None:
        template.category = template_data.category
    if template_data.condition is not None:
        template.condition = template_data.condition
    if template_data.location is not None:
        template.location = template_data.location
    if template_data.price is not None:
        template.price = template_data.price
    if template_data.attributes is not None:
        template.attributes = json.dumps(template_data.attributes)
    if template_data.images is not None:
        template.images = json.dumps(template_data.images)
    if template_data.status is not None:
        template.status = template_data.status
    if template_data.folder_id is not None:
        template.folder_id = template_data.folder_id
    
    template.updated_at = datetime.utcnow()
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return {"message": "Vorlage erfolgreich aktualisiert"}

@app.delete("/api/templates/{template_id}")
def delete_template(
    template_id: int = Path(..., description="ID der Vorlage"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Vorlage löschen"""
    
    template = session.exec(
        select(Template).where(
            and_(Template.id == template_id, Template.user_id == current_user.id)
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    
    session.delete(template)
    session.commit()
    
    return {"message": "Vorlage erfolgreich gelöscht"}

@app.post("/api/templates/{template_id}/create-listing")
def create_listing_from_template(
    template_id: int = Path(..., description="ID der Vorlage"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Anzeige aus Vorlage erstellen"""
    
    template = session.exec(
        select(Template).where(
            and_(Template.id == template_id, Template.user_id == current_user.id)
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    
    # Neue Anzeige aus Vorlage erstellen
    new_listing = Listing(
        user_id=current_user.id,
        title=template.title,
        description=template.description,
        category=template.category,
        condition=template.condition,
        location=template.location,
        price=template.price,
        attributes=template.attributes,
        images=template.images,
        status="active"
    )
    
    session.add(new_listing)
    session.commit()
    session.refresh(new_listing)
    
    return {
        "message": "Anzeige erfolgreich aus Vorlage erstellt",
        "listing_id": new_listing.id
    }

# ============================================================================
# VORLAGEN-ORDNER
# ============================================================================

@app.get("/api/template-folders")
def get_user_template_folders(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Ordner des Benutzers abrufen"""
    
    folders = session.exec(
        select(TemplateFolder).where(TemplateFolder.user_id == current_user.id)
    ).all()
    
    return [folder.dict() for folder in folders]

@app.post("/api/template-folders")
def create_template_folder(
    folder_data: TemplateFolderCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neuen Ordner erstellen"""
    
    new_folder = TemplateFolder(
        user_id=current_user.id,
        name=folder_data.name,
        color=folder_data.color
    )
    
    session.add(new_folder)
    session.commit()
    session.refresh(new_folder)
    
    return {
        "message": "Ordner erfolgreich erstellt",
        "folder": new_folder.dict()
    }

# ============================================================================
# BILDUPLOAD
# ============================================================================

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Bild hochladen"""
    
    try:
        # Validierung
        if file.content_type is None:
            # Fallback: Prüfe Dateiendung
            if not file.filename or not any(file.filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                raise HTTPException(status_code=400, detail="Nur Bilder erlaubt")
        elif not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Nur Bilder erlaubt")
        
        if file.size and file.size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(status_code=400, detail="Datei zu groß (max 5MB)")
        
        # Uploads-Ordner erstellen falls nicht vorhanden
        uploads_dir = "uploads"
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            print(f"✅ Uploads-Ordner erstellt: {uploads_dir}")
        
        # Dateiname generieren
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(uploads_dir, filename)
        
        print(f"📁 Speichere Datei: {file_path}")
        
        # Datei speichern
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        print(f"✅ Bild erfolgreich gespeichert: {file_path}")
        
        return {"filename": filename, "url": f"/uploads/{filename}"}
        
    except Exception as e:
        print(f"❌ Fehler im Upload-Endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Fehler beim Upload: {str(e)}")

# ============================================================================
# SEARCH API
# ============================================================================

@app.get("/api/search")
def search_listings(
    query: Optional[str] = Query(None, description="Suchbegriff"),
    price_min: Optional[float] = Query(None, description="Minimaler Preis"),
    price_max: Optional[float] = Query(None, description="Maximaler Preis"),
    sort_by: str = Query("createdAt", description="Sortierung: price, createdAt, title"),
    sort_order: str = Query("desc", description="Sortierreihenfolge: asc, desc"),
    page: int = Query(1, ge=1, description="Seite"),
    limit: int = Query(20, ge=1, le=100, description="Anzahl pro Seite"),
    session: Session = Depends(get_session)
):
    """Such-Endpoint für das Frontend"""
    
    # Basis-Query
    query_builder = select(Listing)
    
    # Suchbegriff-Filter
    if query:
        search_filter = or_(
            Listing.title.ilike(f"%{query}%"),
            Listing.description.ilike(f"%{query}%"),
            Listing.location.ilike(f"%{query}%")
        )
        query_builder = query_builder.where(search_filter)
    
    # Preis-Filter
    if price_min is not None:
        query_builder = query_builder.where(Listing.price >= price_min)
    if price_max is not None:
        query_builder = query_builder.where(Listing.price <= price_max)
    
    # Sortierung
    if sort_by == "price":
        if sort_order == "asc":
            query_builder = query_builder.order_by(Listing.price.asc())
        else:
            query_builder = query_builder.order_by(Listing.price.desc())
    elif sort_by == "title":
        if sort_order == "asc":
            query_builder = query_builder.order_by(Listing.title.asc())
        else:
            query_builder = query_builder.order_by(Listing.title.desc())
    else:  # createdAt
        if sort_order == "asc":
            query_builder = query_builder.order_by(Listing.created_at.asc())
        else:
            query_builder = query_builder.order_by(Listing.created_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    query_builder = query_builder.offset(offset).limit(limit)
    
    # Ausführen
    listings = session.exec(query_builder).all()
    
    # Ergebnisse formatieren
    results = []
    for listing in listings:
        listing_dict = listing.dict()
        try:
            listing_dict["attributes"] = json.loads(listing.attributes)
            listing_dict["images"] = json.loads(listing.images)
        except:
            listing_dict["attributes"] = {}
            listing_dict["images"] = []
        results.append(listing_dict)
    
    # Frontend erwartet { listings: [...], pagination: { total: X } } Format
    return {
        "listings": results,
        "pagination": {
            "total": len(results),
            "page": page,
            "limit": limit,
            "pages": (len(results) + limit - 1) // limit
        }
    }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/healthz")
def health_check():
    """Health Check"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/setup-test-data")
def setup_test_data():
    """Erstellt Test-Daten für Entwicklungszwecke"""
    try:
        with Session(engine) as session:
            # Prüfe, ob bereits Anzeigen existieren
            existing_listings = session.exec(select(Listing)).all()
            if existing_listings:
                return {"message": f"Bereits {len(existing_listings)} Anzeigen vorhanden", "status": "exists"}
            
            # Erstelle einen Test-Benutzer, falls keiner existiert
            test_user = session.exec(select(User).where(User.email == "test@example.com")).first()
            if not test_user:
                test_user = User(
                    email="test@example.com",
                    hashed_password=get_password_hash("test123"),
                    is_active=True,
                    is_verified=True,
                    role="user"
                )
                session.add(test_user)
                session.commit()
                logger.info("Test-Benutzer erstellt: test@example.com / test123")
            
            # Erstelle Test-Anzeigen
            create_test_listings(session, test_user.id)
            
            return {"message": "Test-Daten erfolgreich erstellt", "status": "created"}
            
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Test-Daten: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Erstellen der Test-Daten: {str(e)}")

# API-Endpoints für Kategorien
@app.get("/api/categories")
async def get_categories():
    """Alle Kategorien für kleinanzeigen abrufen"""
    # Gib nur die Kleinanzeigen-Kategorienamen zurück
    kleinanzeigen_categories = [cat["name"] for cat in CATEGORIES["kleinanzeigen"]]
    return kleinanzeigen_categories

@app.get("/api/categories/{theme}")
async def get_categories_by_theme(theme: str):
    """Kategorien nach Theme abrufen (kleinanzeigen oder autos)"""
    if theme not in CATEGORIES:
        raise HTTPException(status_code=404, detail="Theme nicht gefunden")
    return {"categories": CATEGORIES[theme]}

@app.get("/api/locations")
async def get_locations():
    """Get all unique locations from listings"""
    session = next(get_session())
    try:
        # Hole alle einzigartigen Standorte aus der Datenbank
        locations = session.exec(
            select(Listing.location)
            .where(Listing.location.is_not(None))
            .distinct()
        ).all()
        
        # Sortiere alphabetisch und entferne leere Werte
        locations = sorted([loc for loc in locations if loc and loc.strip()])
        
        return locations
    finally:
        session.close()

@app.get("/api/price-options")
async def get_price_options():
    """Get predefined price options for dropdowns"""
    return [
        50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000
    ]

@app.get("/api/conditions")
async def get_conditions():
    """Get predefined condition options"""
    return [
        "Neu",
        "Wie neu", 
        "Sehr gut",
        "Gut",
        "Akzeptabel",
        "Für Bastler"
    ]

@app.get("/api/listings/category/{category_slug}")
async def get_listings_by_category(category_slug: str, session: Session = Depends(get_session)):
    """Anzeigen nach Kategorie abrufen"""
    # Spezielle Behandlung für Theme-basierte URLs
    if category_slug in ["kleinanzeigen", "autos"]:
        # Wenn es ein Theme ist, alle Kategorien dieses Themes zurückgeben
        theme = category_slug
        if theme not in CATEGORIES:
            raise HTTPException(status_code=404, detail="Theme nicht gefunden")
        
        # Alle Listings für dieses Theme abrufen
        listings = session.exec(
            select(Listing).where(Listing.category == theme)
        ).all()
        
        listings_data = []
        for listing in listings:
            listing_dict = listing.dict()
            
            # JSON-Felder korrekt parsen
            try:
                listing_dict["attributes"] = json.loads(listing.attributes)
                listing_dict["images"] = json.loads(listing.images)
            except:
                listing_dict["attributes"] = {}
                listing_dict["images"] = []
            
            # User-Informationen hinzufügen
            user = session.get(User, listing.user_id)
            if user:
                listing_dict["seller"] = {
                    "name": user.email.split('@')[0],
                    "avatar": None,
                    "rating": 4.5,
                    "reviewCount": 12
                }
            else:
                listing_dict["seller"] = {
                    "name": "Unbekannt",
                    "avatar": None,
                    "rating": 0.0,
                    "reviewCount": 0
                }
            listings_data.append(listing_dict)
        
        # Theme-Informationen erstellen
        theme_info = {
            "id": 0,
            "name": "Kleinanzeigen" if theme == "kleinanzeigen" else "Autos & Fahrzeuge",
            "slug": theme,
            "icon": "/images/categories/general.png",
            "color": "#3B82F6",
            "bgColor": "#EFF6FF"
        }
        
        return {
            "category": theme_info,
            "listings": listings_data,
            "count": len(listings_data)
        }
    
    # Normale Kategorie-Suche
    all_categories = []
    for theme, categories in CATEGORIES.items():
        for category in categories:
            if category["slug"] == category_slug:
                all_categories.append(category)
    
    if not all_categories:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    category = all_categories[0]
    
    # Anzeigen mit dieser Kategorie abrufen
    listings = session.exec(
        select(Listing).where(Listing.category == category_slug)
    ).all()
    
    listings_data = []
    for listing in listings:
        listing_dict = listing.dict()
        
        # JSON-Felder korrekt parsen
        try:
            listing_dict["attributes"] = json.loads(listing.attributes)
            listing_dict["images"] = json.loads(listing.images)
        except:
            listing_dict["attributes"] = {}
            listing_dict["images"] = []
        
        # User-Informationen hinzufügen
        user = session.get(User, listing.user_id)
        if user:
            listing_dict["seller"] = {
                "name": user.email.split('@')[0],
                "avatar": None,
                "rating": 4.5,
                "reviewCount": 12
            }
        else:
            listing_dict["seller"] = {
                "name": "Unbekannt",
                "avatar": None,
                "rating": 0.0,
                "reviewCount": 0
            }
        listings_data.append(listing_dict)
    
    return {
        "category": category,
        "listings": listings_data,
        "count": len(listings_data)
    }

# Chat API Endpoints
@app.get("/api/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all conversations for the current user"""
    try:
        # Get conversations where user is either buyer or seller
        conversations = session.exec(
            select(Conversation)
            .where(
                or_(
                    Conversation.buyer_id == current_user.id,
                    Conversation.seller_id == current_user.id
                )
            )
            .order_by(desc(Conversation.updated_at))
        ).all()
        
        # Add listing and other user info
        result = []
        for conv in conversations:
            # Get listing info
            listing = session.exec(
                select(Listing).where(Listing.id == conv.listing_id)
            ).first()
            
            # Get other user info
            other_user_id = conv.seller_id if conv.buyer_id == current_user.id else conv.buyer_id
            other_user = session.exec(
                select(User).where(User.id == other_user_id)
            ).first()
            
            # Get last message
            last_message = session.exec(
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(desc(Message.created_at))
                .limit(1)
            ).first()
            
            # Get unread count
            unread_count = session.exec(
                select(func.count(Message.id))
                .where(
                    and_(
                        Message.conversation_id == conv.id,
                        Message.sender_id != current_user.id,
                        Message.is_read == False
                    )
                )
            ).first() or 0
            
            if listing and other_user:
                result.append({
                    "id": conv.id,
                    "listing": {
                        "id": listing.id,
                        "title": listing.title,
                        "price": listing.price,
                        "images": listing.images if listing.images else []
                    },
                    "other_user": {
                        "id": other_user.id,
                        "email": other_user.email,
                        "name": other_user.first_name + " " + other_user.last_name,
                        "avatar": other_user.first_name[0] + other_user.last_name[0] if other_user.first_name and other_user.last_name else "U"
                    },
                    "last_message": {
                        "content": last_message.content if last_message else "",
                        "created_at": last_message.created_at.isoformat() if last_message else conv.updated_at.isoformat(),
                        "sender_id": last_message.sender_id if last_message else None
                    },
                    "unread_count": unread_count,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                })
        
        return {"conversations": result}
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        return {"conversations": []}

@app.get("/api/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int = Path(..., description="ID der Konversation"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all messages for a specific conversation"""
    try:
        # Verify user is part of conversation
        conversation = session.exec(
            select(Conversation).where(
                and_(
                    Conversation.id == conversation_id,
                    or_(
                        Conversation.buyer_id == current_user.id,
                        Conversation.seller_id == current_user.id
                    )
                )
            )
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get messages
        messages = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(asc(Message.created_at))
        ).all()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "is_read": msg.is_read
            })
        
        return {"messages": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int = Path(..., description="ID der Konversation"),
    content: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Send a message in a conversation"""
    try:
        # Verify user is part of conversation
        conversation = session.exec(
            select(Conversation).where(
                and_(
                    Conversation.id == conversation_id,
                    or_(
                        Conversation.buyer_id == current_user.id,
                        Conversation.seller_id == current_user.id
                    )
                )
            )
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Create message
        message = Message(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            content=content
        )
        session.add(message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        
        session.commit()
        session.refresh(message)
        
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
            "is_read": message.is_read
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/conversations")
def create_conversation(
    listing_id: int = Body(..., embed=True),
    seller_id: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new conversation"""
    try:
        # Check if conversation already exists
        existing = session.exec(
            select(Conversation).where(
                and_(
                    Conversation.listing_id == listing_id,
                    Conversation.buyer_id == current_user.id,
                    Conversation.seller_id == seller_id
                )
            )
        ).first()
        
        if existing:
            return {"id": existing.id, "message": "Conversation already exists"}
        
        # Create new conversation
        conversation = Conversation(
            listing_id=listing_id,
            buyer_id=current_user.id,
            seller_id=seller_id
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        
        return {"id": conversation.id, "message": "Conversation created"}
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Neue Modelle für Melden und Bewertung
class ReportCreate(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Grund für die Meldung")
    description: Optional[str] = Field(None, max_length=1000, description="Zusätzliche Beschreibung")

class RatingCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Bewertung von 1-5")
    comment: Optional[str] = Field(None, max_length=500, description="Kommentar zur Bewertung")

# Melden-Funktion
@app.post("/api/report/{listing_id}")
def report_listing(
    listing_id: int = Path(..., description="ID des Listings"),
    report_data: ReportCreate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Report a listing"""
    try:
        # Check if listing exists
        listing = session.exec(
            select(Listing).where(Listing.id == listing_id)
        ).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Check if user already reported this listing
        existing_report = session.exec(
            select(Report).where(
                and_(
                    Report.listing_id == listing_id,
                    Report.reporter_id == current_user.id
                )
            )
        ).first()
        
        if existing_report:
            raise HTTPException(status_code=400, detail="Listing already reported by this user")
        
        # Create report
        report = Report(
            listing_id=listing_id,
            reporter_id=current_user.id,
            reason=report_data.reason,
            description=report_data.description,
            status="pending"  # pending, reviewed, resolved
        )
        session.add(report)
        session.commit()
        
        return {"message": "Listing reported successfully", "report_id": report.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reporting listing: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Listing-Bewertungsfunktion
@app.post("/api/listings/{listing_id}/rate")
def rate_listing(
    listing_id: int = Path(..., description="ID des zu bewertenden Listings"),
    rating_data: RatingCreate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Rate a listing"""
    try:
        # Check if listing exists
        listing = session.exec(
            select(Listing).where(Listing.id == listing_id)
        ).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Check if user is rating their own listing
        if listing.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot rate your own listing")
        
        # Check if user already rated this listing
        existing_rating = session.exec(
            select(Rating).where(
                and_(
                    Rating.rater_id == current_user.id,
                    Rating.rated_user_id == listing.user_id
                )
            )
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating_data.rating
            existing_rating.comment = rating_data.comment
            existing_rating.updated_at = datetime.utcnow()
            session.commit()
            return {"message": "Rating updated successfully"}
        
        # Create new rating
        rating = Rating(
            rater_id=current_user.id,
            rated_user_id=listing.user_id,
            rating=rating_data.rating,
            comment=rating_data.comment
        )
        session.add(rating)
        session.commit()
        
        return {"message": "Rating created successfully", "rating_id": rating.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rating listing: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# User-Bewertungsfunktion
@app.post("/api/ratings/{user_id}")
def rate_user(
    user_id: int = Path(..., description="ID des zu bewertenden Users"),
    rating_data: RatingCreate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Rate a user"""
    try:
        # Check if user exists
        target_user = session.exec(
            select(User).where(User.id == user_id)
        ).first()
        
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is rating themselves
        if current_user.id == user_id:
            raise HTTPException(status_code=400, detail="Cannot rate yourself")
        
        # Check if user already rated this user
        existing_rating = session.exec(
            select(Rating).where(
                and_(
                    Rating.rater_id == current_user.id,
                    Rating.rated_user_id == user_id
                )
            )
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating_data.rating
            existing_rating.comment = rating_data.comment
            existing_rating.updated_at = datetime.utcnow()
            session.commit()
            return {"message": "Rating updated successfully"}
        
        # Create new rating
        rating = Rating(
            rater_id=current_user.id,
            rated_user_id=user_id,
            rating=rating_data.rating,
            comment=rating_data.comment
        )
        session.add(rating)
        session.commit()
        
        return {"message": "Rating created successfully", "rating_id": rating.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/ratings/{user_id}")
def get_user_ratings(
    user_id: int = Path(..., description="ID des Users"),
    session: Session = Depends(get_session)
):
    """Get ratings for a user"""
    try:
        # Check if user exists
        user = session.exec(
            select(User).where(User.id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all ratings for this user
        ratings = session.exec(
            select(Rating).where(Rating.rated_user_id == user_id)
        ).all()
        
        # Calculate average rating
        if ratings:
            avg_rating = sum(r.rating for r in ratings) / len(ratings)
        else:
            avg_rating = 0
        
        return {
            "user_id": user_id,
            "average_rating": round(avg_rating, 2),
            "total_ratings": len(ratings),
            "ratings": [
                {
                    "id": r.id,
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at.isoformat(),
                    "rater_id": r.rater_id
                }
                for r in ratings
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user ratings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin-Endpoint für gemeldete Listings
@app.get("/api/admin/reports")
def get_reports(
    status: Optional[str] = Query(None, description="Status: pending, reviewed, resolved"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all reports (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Build query
        query = select(Report)
        if status:
            query = query.where(Report.status == status)
        
        reports = session.exec(query).all()
        
        return {
            "reports": [
                {
                    "id": r.id,
                    "listing_id": r.listing_id,
                    "reporter_id": r.reporter_id,
                    "reason": r.reason,
                    "description": r.description,
                    "status": r.status,
                    "created_at": r.created_at.isoformat()
                }
                for r in reports
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reports: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# TEST DATA CREATION
# ============================================================================

def create_test_listings(session: Session, user_id: int):
    """Erstellt Test-Anzeigen mit echten Bildern für Entwicklungszwecke"""
    try:
        # Prüfe, ob bereits Test-Anzeigen existieren
        existing_listings = session.exec(select(Listing).where(Listing.user_id == user_id)).all()
        if existing_listings:
            print(f"✅ Test-Anzeigen existieren bereits: {len(existing_listings)} Anzeigen gefunden")
            return
        
        # Test-Anzeigen mit echten Bildern
        test_listings = [
            {
                "title": "iPhone 13 Pro 128GB",
                "description": "Top Zustand, nur 1 Jahr alt, alle Funktionen funktionieren einwandfrei.",
                "category": "kleinanzeigen",
                "condition": "Gebraucht",
                "location": "Berlin",
                "price": 699.0,
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=face"
                ]),
                "attributes": json.dumps({
                    "highlighted": True,
                    "zustand": "Gebraucht",
                    "versand": True,
                    "garantie": False,
                    "kategorie": "Elektronik"
                }),
                "status": "active",
                "views": 156,
                "user_id": user_id
            },
            {
                "title": "MacBook Air M1 13\" 256GB",
                "description": "Apple MacBook Air mit M1 Chip, 13 Zoll, 256GB SSD, perfekter Zustand.",
                "category": "kleinanzeigen",
                "condition": "Gebraucht",
                "location": "München",
                "price": 850.0,
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=face"
                ]),
                "attributes": json.dumps({
                    "highlighted": False,
                    "zustand": "Gebraucht",
                    "versand": True,
                    "garantie": True,
                    "kategorie": "Elektronik"
                }),
                "status": "active",
                "views": 89,
                "user_id": user_id
            },
            {
                "title": "BMW 320d E90",
                "description": "BMW 320d E90, Baujahr 2008, 150.000 km, Diesel, Automatik, unfallfrei.",
                "category": "autos",
                "condition": "Gebraucht",
                "location": "Hamburg",
                "price": 8500.0,
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=400&fit=crop&crop=face"
                ]),
                "attributes": json.dumps({
                    "highlighted": True,
                    "marke": "BMW",
                    "modell": "320d",
                    "erstzulassung": 2008,
                    "kilometerstand": 150000,
                    "kraftstoff": "Diesel",
                    "getriebe": "Automatik",
                    "leistung": 163,
                    "farbe": "Schwarz",
                    "unfallfrei": True
                }),
                "status": "active",
                "views": 234,
                "user_id": user_id
            },
            {
                "title": "Mercedes C200 AMG",
                "description": "Mercedes C200 AMG Line, Baujahr 2019, 45.000 km, Benzin, Automatik.",
                "category": "autos",
                "condition": "Gebraucht",
                "location": "Stuttgart",
                "price": 32000.0,
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=400&fit=crop&crop=face"
                ]),
                "attributes": json.dumps({
                    "highlighted": False,
                    "marke": "Mercedes",
                    "modell": "C200",
                    "erstzulassung": 2019,
                    "kilometerstand": 45000,
                    "kraftstoff": "Benzin",
                    "getriebe": "Automatik",
                    "leistung": 197,
                    "farbe": "Weiß",
                    "unfallfrei": True
                }),
                "status": "active",
                "views": 178,
                "user_id": user_id
            },
            {
                "title": "Sony WH-1000XM4 Kopfhörer",
                "description": "Sony WH-1000XM4 Noise Cancelling Kopfhörer, wie neu, nur 2 Monate alt.",
                "category": "kleinanzeigen",
                "condition": "Gebraucht",
                "location": "Köln",
                "price": 250.0,
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=face"
                ]),
                "attributes": json.dumps({
                    "highlighted": False,
                    "zustand": "Gebraucht",
                    "versand": True,
                    "garantie": True,
                    "kategorie": "Elektronik"
                }),
                "status": "draft",
                "views": 45,
                "user_id": user_id
            }
        ]
        
        # Erstelle die Test-Anzeigen
        for listing_data in test_listings:
            listing = Listing(**listing_data)
            session.add(listing)
        
        session.commit()
        print(f"✅ {len(test_listings)} Test-Anzeigen erfolgreich erstellt")
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen der Test-Anzeigen: {str(e)}")
        session.rollback()


# ============================================================================
# DYNAMISCHE FORMULARE API
# ============================================================================

@app.get("/api/dynamic/categories")
async def get_dynamic_categories():
    raise HTTPException(status_code=410, detail="Dynamic forms disabled")


@app.get("/api/dynamic/categories/{category_id}")
async def get_dynamic_category_by_id(category_id: int):
    raise HTTPException(status_code=410, detail="Dynamic forms disabled")


@app.get("/api/dynamic/attributes")
async def get_dynamic_attributes():
    raise HTTPException(status_code=410, detail="Dynamic forms disabled")


@app.get("/api/dynamic/forms/{category_id}")
async def get_category_form_schema(category_id: int):
    raise HTTPException(status_code=410, detail="Dynamic forms disabled")


@app.post("/api/dynamic/validate-attributes")
async def validate_listing_attributes():
    raise HTTPException(status_code=410, detail="Dynamic forms disabled")


# ============================================================================
# ADMIN API FÜR DYNAMISCHE FORMULARE
# ============================================================================

@app.post("/api/admin/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Kategorie erstellen (nur für Admins)"""
    try:
        from models_dynamic import Category
        
        # Admin-Berechtigung prüfen (vereinfacht)
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Slug-Uniqueness prüfen
        existing = session.exec(
            select(Category).where(Category.slug == category_data.slug)
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Slug bereits vergeben")
        
        # Kategorie erstellen
        category = Category(**category_data.dict())
        session.add(category)
        session.commit()
        session.refresh(category)
        
        return category
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Kategorie: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen der Kategorie")


@app.put("/api/admin/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int = Path(..., description="ID der Kategorie"),
    category_data: CategoryUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Kategorie aktualisieren (nur für Admins)"""
    try:
        from models_dynamic import Category
        
        # Admin-Berechtigung prüfen
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Kategorie finden
        category = session.exec(
            select(Category).where(Category.id == category_id)
        ).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
        
        # Aktualisieren
        update_data = category_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        category.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(category)
        
        return category
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Kategorie {category_id}: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Aktualisieren der Kategorie")


@app.post("/api/admin/attributes", response_model=AttributeResponse)
async def create_attribute(
    attribute_data: AttributeCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neues Attribut erstellen (nur für Admins)"""
    try:
        from models_dynamic import Attribute
        
        # Admin-Berechtigung prüfen
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Key-Uniqueness prüfen
        existing = session.exec(
            select(Attribute).where(Attribute.key == attribute_data.key)
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Attribut-Key bereits vergeben")
        
        # Attribut erstellen
        attribute = Attribute(**attribute_data.dict())
        session.add(attribute)
        session.commit()
        session.refresh(attribute)
        
        return attribute
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Attributs: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen des Attributs")


@app.post("/api/admin/attributes/{attribute_id}/options")
async def create_attribute_option(
    option_data: AttributeOptionCreate,
    attribute_id: int = Path(..., description="ID des Attributs"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Neue Attribut-Option erstellen (nur für Admins)"""
    try:
        from models_dynamic import Attribute, AttributeOption
        
        # Admin-Berechtigung prüfen
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Attribut finden
        attribute = session.exec(
            select(Attribute).where(Attribute.id == attribute_id)
        ).first()
        
        if not attribute:
            raise HTTPException(status_code=404, detail="Attribut nicht gefunden")
        
        # Option erstellen
        option = AttributeOption(
            attribute_id=attribute_id,
            **option_data.dict()
        )
        session.add(option)
        session.commit()
        session.refresh(option)
        
        return option
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Attribut-Option: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Erstellen der Attribut-Option")


@app.post("/api/admin/categories/{category_id}/attributes")
async def assign_attribute_to_category(
    assignment_data: CategoryAttributeCreate,
    category_id: int = Path(..., description="ID der Kategorie"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Attribut einer Kategorie zuordnen (nur für Admins)"""
    try:
        from models_dynamic import Category, Attribute, CategoryAttribute
        
        # Admin-Berechtigung prüfen
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Kategorie und Attribut finden
        category = session.exec(
            select(Category).where(Category.id == category_id)
        ).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
        
        attribute = session.exec(
            select(Attribute).where(Attribute.id == assignment_data.attribute_id)
        ).first()
        
        if not attribute:
            raise HTTPException(status_code=404, detail="Attribut nicht gefunden")
        
        # Bereits zugeordnet?
        existing = session.exec(
            select(CategoryAttribute)
            .where(CategoryAttribute.category_id == category_id)
            .where(CategoryAttribute.attribute_id == assignment_data.attribute_id)
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Attribut bereits zugeordnet")
        
        # Zuordnung erstellen
        assignment = CategoryAttribute(
            category_id=category_id,
            **assignment_data.dict()
        )
        session.add(assignment)
        session.commit()
        session.refresh(assignment)
        
        return assignment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Zuordnen des Attributs: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Fehler beim Zuordnen des Attributs")

















# ============================================================================
# E-MAIL FUNKTIONEN
# ============================================================================

async def send_verification_submitted_email(email: str, company_name: str):
    """E-Mail-Benachrichtigung für eingereichte Verifizierung senden"""
    
    message = MessageSchema(
        subject="Verifizierungsantrag eingereicht - Kleinanzeigen",
        recipients=[email],
        template_body={
            "company_name": company_name
        },
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message, template_name="verification_submitted.html")
        logger.info(f"Verifizierungs-Bestätigung an {email} gesendet")
    except Exception as e:
        logger.error(f"Fehler beim Senden der Verifizierungs-Bestätigung an {email}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Senden der E-Mail")

async def send_verification_decision_email(email: str, company_name: str, decision: str, reason: str = None):
    """E-Mail-Benachrichtigung für Verifizierungsentscheidung senden"""
    
    message = MessageSchema(
        subject=f"Verifizierungsentscheidung - {decision.title()} - Kleinanzeigen",
        recipients=[email],
        template_body={
            "company_name": company_name,
            "decision": decision,
            "reason": reason
        },
        subtype="html"
    )
    
    try:
        template_name = "verification_approved.html" if decision == "approved" else "verification_rejected.html"
        await fastmail.send_message(message, template_name=template_name)
        logger.info(f"Verifizierungsentscheidung an {email} gesendet")
    except Exception as e:
        logger.error(f"Fehler beim Senden der Verifizierungsentscheidung an {email}: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Senden der E-Mail")

# ============================================================================
# SHOP API ENDPOINTS
# ============================================================================

@app.post("/api/shops", response_model=ShopResponse)
async def create_shop(
    shop_data: ShopCreate,
    current_user: User = Depends(get_current_user)
):
    """Neuen Shop erstellen"""
    if current_user.verification_state != VerificationState.SELLER_VERIFIED:
        raise HTTPException(
            status_code=403,
            detail="Nur verifizierte Verkäufer können Shops erstellen"
        )
    
    with Session(engine) as session:
        # Prüfen, ob der User bereits einen Shop hat
        existing_shop = session.exec(
            select(Shop).where(Shop.owner_id == current_user.id)
        ).first()
        
        if existing_shop:
            raise HTTPException(
                status_code=400,
                detail="Sie haben bereits einen Shop"
            )
        
        # Neuen Shop erstellen
        new_shop = Shop(
            **shop_data.dict(),
            owner_id=current_user.id
        )
        
        session.add(new_shop)
        session.commit()
        session.refresh(new_shop)
        
        return new_shop

@app.get("/api/shops", response_model=List[ShopResponse])
async def get_shops(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    location: Optional[str] = None,
    verified: Optional[bool] = None,
    featured: Optional[bool] = None
):
    """Alle Shops abrufen mit optionalen Filtern"""
    with Session(engine) as session:
        query = select(Shop)
        
        if category:
            query = query.where(Shop.category == category)
        if location:
            query = query.where(Shop.location.contains(location))
        if verified is not None:
            query = query.where(Shop.verified == verified)
        if featured is not None:
            query = query.where(Shop.featured == featured)
        
        query = query.offset(skip).limit(limit).order_by(Shop.created_at.desc())
        shops = session.exec(query).all()
        
        return shops

@app.get("/api/shops/{shop_id}", response_model=ShopResponse)
async def get_shop(shop_id: int):
    """Einen spezifischen Shop abrufen"""
    with Session(engine) as session:
        shop = session.get(Shop, shop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Shop nicht gefunden")
        return shop

@app.put("/api/shops/{shop_id}", response_model=ShopResponse)
async def update_shop(
    shop_id: int,
    shop_data: ShopUpdate,
    current_user: User = Depends(get_current_user)
):
    """Shop aktualisieren (nur Shop-Besitzer)"""
    with Session(engine) as session:
        shop = session.get(Shop, shop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Shop nicht gefunden")
        
        if shop.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        # Nur gesetzte Felder aktualisieren
        update_data = shop_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(shop, field, value)
        
        shop.updated_at = datetime.utcnow()
        session.add(shop)
        session.commit()
        session.refresh(shop)
        
        return shop

@app.delete("/api/shops/{shop_id}")
async def delete_shop(
    shop_id: int,
    current_user: User = Depends(get_current_user)
):
    """Shop löschen (nur Shop-Besitzer)"""
    with Session(engine) as session:
        shop = session.get(Shop, shop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Shop nicht gefunden")
        
        if shop.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        
        session.delete(shop)
        session.commit()
        
        return {"message": "Shop erfolgreich gelöscht"}

# Shop Review Endpoints
@app.post("/api/shops/{shop_id}/reviews", response_model=ShopReviewResponse)
async def create_shop_review(
    shop_id: int,
    review_data: ShopReviewCreate,
    current_user: User = Depends(get_current_user)
):
    """Bewertung für einen Shop erstellen"""
    with Session(engine) as session:
        shop = session.get(Shop, shop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Shop nicht gefunden")
        
        # Prüfen, ob der User bereits eine Bewertung für diesen Shop hat
        existing_review = session.exec(
            select(ShopReview).where(
                ShopReview.shop_id == shop_id,
                ShopReview.user_id == current_user.id
            )
        ).first()
        
        if existing_review:
            raise HTTPException(
                status_code=400,
                detail="Sie haben bereits eine Bewertung für diesen Shop abgegeben"
            )
        
        # Neue Bewertung erstellen
        new_review = ShopReview(
            shop_id=shop_id,
            user_id=current_user.id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        
        session.add(new_review)
        session.commit()
        session.refresh(new_review)
        
        # Shop-Bewertung aktualisieren
        shop_reviews = session.exec(
            select(ShopReview).where(ShopReview.shop_id == shop_id)
        ).all()
        
        if shop_reviews:
            shop.rating = sum(r.rating for r in shop_reviews) / len(shop_reviews)
            shop.review_count = len(shop_reviews)
            session.add(shop)
            session.commit()
        
        # Bewertung mit Benutzername zurückgeben
        return ShopReviewResponse(
            **new_review.dict(),
            user_name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
        )

@app.get("/api/shops/{shop_id}/reviews", response_model=List[ShopReviewResponse])
async def get_shop_reviews(shop_id: int, skip: int = 0, limit: int = 50):
    """Alle Bewertungen für einen Shop abrufen"""
    with Session(engine) as session:
        shop = session.get(Shop, shop_id)
        if not shop:
            raise HTTPException(status_code=404, detail="Shop nicht gefunden")
        
        reviews = session.exec(
            select(ShopReview)
            .where(ShopReview.shop_id == shop_id)
            .offset(skip)
            .limit(limit)
            .order_by(ShopReview.created_at.desc())
        ).all()
        
        # Bewertungen mit Benutzernamen zurückgeben
        review_responses = []
        for review in reviews:
            user = session.get(User, review.user_id)
            user_name = f"{user.first_name or ''} {user.last_name or ''}".strip() if user else "Unbekannt"
            
            review_responses.append(ShopReviewResponse(
                **review.dict(),
                user_name=user_name
            ))
        
        return review_responses

# ============================================================================
# FOLLOW SYSTEM ENDPOINTS
# ============================================================================

@app.post("/api/users/{user_id}/follow", response_model=FollowResponse)
async def follow_user(
    user_id: int = Path(..., description="ID des Users/Shops dem gefolgt werden soll"),
    current_user: User = Depends(get_current_user)
):
    """User/Shop folgen"""
    
    with Session(engine) as session:
        # Prüfen ob der User sich selbst folgen will
        if user_id == current_user.id:
            raise HTTPException(
                status_code=400, 
                detail="Du kannst dir nicht selbst folgen"
            )
        
        # Prüfen ob der zu folgende User/Shop existiert
        target_user = session.exec(select(User).where(User.id == user_id)).first()
        target_shop = session.exec(select(Shop).where(Shop.id == user_id)).first()
        
        if not target_user and not target_shop:
            raise HTTPException(
                status_code=404, 
                detail=f"User/Shop mit ID {user_id} nicht gefunden"
            )
        
        # Prüfen ob bereits gefolgt wird
        existing_follow = session.exec(
            select(Follow).where(
                Follow.follower_id == current_user.id,
                Follow.following_id == user_id
            )
        ).first()
        
        if existing_follow:
            raise HTTPException(
                status_code=400, 
                detail="Du folgst diesem Account bereits"
            )
        
        # Follow-Beziehung erstellen
        follow = Follow(
            follower_id=current_user.id,
            following_id=user_id
        )
        session.add(follow)
        session.commit()
        session.refresh(follow)
        
        # Benachrichtigung an den gefolgten User senden
        try:
            # User/Shop-Name für Benachrichtigung bestimmen
            follower_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
            if not follower_name:
                follower_name = current_user.email
            
            # Benachrichtigung erstellen
            notification = Notification(
                user_id=user_id,
                type=NotificationType.FOLLOW,
                title="Neuer Follower",
                message=f"{follower_name} folgt dir jetzt",
                related_user_id=current_user.id
            )
            session.add(notification)
            session.commit()
        except Exception as e:
            # Benachrichtigung ist nicht kritisch, Fehler ignorieren
            print(f"Fehler beim Erstellen der Follow-Benachrichtigung: {e}")
        
        return FollowResponse(
            id=follow.id,
            follower_id=follow.follower_id,
            following_id=follow.following_id,
            created_at=follow.created_at,
            is_following=True
        )

@app.delete("/api/users/{user_id}/follow")
async def unfollow_user(
    user_id: int = Path(..., description="ID des Users/Shops dem nicht mehr gefolgt werden soll"),
    current_user: User = Depends(get_current_user)
):
    """User/Shop entfolgen"""
    
    with Session(engine) as session:
        # Follow-Beziehung finden
        follow = session.exec(
            select(Follow).where(
                Follow.follower_id == current_user.id,
                Follow.following_id == user_id
            )
        ).first()
        
        if not follow:
            raise HTTPException(
                status_code=404, 
                detail="Du folgst diesem Account nicht"
            )
        
        # Follow-Beziehung löschen
        session.delete(follow)
        session.commit()
        
        return {"message": "Erfolgreich entfolgt"}

@app.get("/api/users/{user_id}/followers", response_model=List[FollowResponse])
async def get_followers(
    user_id: int = Path(..., description="ID des Users/Shops"),
    limit: int = Query(20, description="Anzahl der Follower pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung")
):
    """Follower eines Users/Shops abrufen"""
    
    with Session(engine) as session:
        # Prüfen ob User/Shop existiert
        target_user = session.exec(select(User).where(User.id == user_id)).first()
        target_shop = session.exec(select(Shop).where(Shop.id == user_id)).first()
        
        if not target_user and not target_shop:
            raise HTTPException(
                status_code=404, 
                detail=f"User/Shop mit ID {user_id} nicht gefunden"
            )
        
        # Follower abrufen
        followers = session.exec(
            select(Follow)
            .where(Follow.following_id == user_id)
            .offset(offset)
            .limit(limit)
            .order_by(Follow.created_at.desc())
        ).all()
        
        return [
            FollowResponse(
                id=follow.id,
                follower_id=follow.follower_id,
                following_id=follow.following_id,
                created_at=follow.created_at,
                is_following=True
            )
            for follow in followers
        ]

@app.get("/api/users/{user_id}/following", response_model=List[FollowResponse])
async def get_following(
    user_id: int = Path(..., description="ID des Users"),
    limit: int = Query(20, description="Anzahl der gefolgten Accounts pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung")
):
    """Gefolgte Accounts eines Users abrufen"""
    
    with Session(engine) as session:
        # Prüfen ob User existiert
        user = session.exec(select(User).where(User.id == user_id)).first()
        if not user:
            raise HTTPException(
                status_code=404, 
                detail=f"User mit ID {user_id} nicht gefunden"
            )
        
        # Gefolgte Accounts abrufen
        following = session.exec(
            select(Follow)
            .where(Follow.follower_id == user_id)
            .offset(offset)
            .limit(limit)
            .order_by(Follow.created_at.desc())
        ).all()
        
        return [
            FollowResponse(
                id=follow.id,
                follower_id=follow.follower_id,
                following_id=follow.following_id,
                created_at=follow.created_at,
                is_following=True
            )
            for follow in following
        ]

@app.get("/api/users/{user_id}/follow-stats", response_model=FollowStats)
async def get_follow_stats(
    user_id: int = Path(..., description="ID des Users/Shops"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Follow-Statistiken für einen User/Shop abrufen"""
    
    with Session(engine) as session:
        # Prüfen ob User/Shop existiert
        target_user = session.exec(select(User).where(User.id == user_id)).first()
        target_shop = session.exec(select(Shop).where(Shop.id == user_id)).first()
        
        if not target_user and not target_shop:
            raise HTTPException(
                status_code=404, 
                detail=f"User/Shop mit ID {user_id} nicht gefunden"
            )
        
        # Follower-Count
        followers_count = session.exec(
            select(func.count(Follow.id)).where(Follow.following_id == user_id)
        ).first() or 0
        
        # Following-Count (nur für Users, nicht für Shops)
        following_count = 0
        if target_user:
            following_count = session.exec(
                select(func.count(Follow.id)).where(Follow.follower_id == user_id)
            ).first() or 0
        
        # Prüfen ob aktueller User diesem Account folgt
        is_following = False
        if current_user:
            existing_follow = session.exec(
                select(Follow).where(
                    Follow.follower_id == current_user.id,
                    Follow.following_id == user_id
                )
            ).first()
            is_following = existing_follow is not None
        
        return FollowStats(
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following
        )

# ============================================================================
# FEED SYSTEM ENDPOINTS
# ============================================================================

@app.get("/api/feed")
async def get_personalized_feed(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der Anzeigen pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung")
):
    """Personalisierter Feed mit Anzeigen von gefolgten Accounts"""
    
    with Session(engine) as session:
        # Accounts abrufen, denen der User folgt
        following_ids = session.exec(
            select(Follow.following_id).where(Follow.follower_id == current_user.id)
        ).all()
        
        if not following_ids:
            # Wenn User niemandem folgt, zeige beliebte Anzeigen
            listings_query = select(Listing).where(
                Listing.status == ListingStatus.ACTIVE
            ).order_by(desc(Listing.views), desc(Listing.created_at))
        else:
            # Anzeigen von gefolgten Accounts
            listings_query = select(Listing).where(
                and_(
                    Listing.user_id.in_(following_ids),
                    Listing.status == ListingStatus.ACTIVE
                )
            ).order_by(desc(Listing.created_at))
        
        # Paginierung anwenden
        listings_query = listings_query.offset(offset).limit(limit)
        listings = session.exec(listings_query).all()
        
        # Gesamtanzahl für Paginierung
        if following_ids:
            total_count = session.exec(
                select(func.count(Listing.id)).where(
                    and_(
                        Listing.user_id.in_(following_ids),
                        Listing.status == ListingStatus.ACTIVE
                    )
                )
            ).first() or 0
        else:
            total_count = session.exec(
                select(func.count(Listing.id)).where(
                    Listing.status == ListingStatus.ACTIVE
                )
            ).first() or 0
        
        # Listings in Response-Format konvertieren
        listings_data = []
        for listing in listings:
            try:
                # Bilder als Array parsen
                try:
                    images = json.loads(listing.images) if listing.images else []
                except (json.JSONDecodeError, TypeError):
                    images = []
                
                # User/Shop-Info für den Listing-Ersteller abrufen
                listing_user = session.exec(select(User).where(User.id == listing.user_id)).first()
                listing_shop = session.exec(select(Shop).where(Shop.id == listing.user_id)).first()
                
                # Seller-Info bestimmen
                seller_info = None
                if listing_user:
                    seller_info = {
                        "id": listing_user.id,
                        "name": f"{listing_user.first_name or ''} {listing_user.last_name or ''}".strip() or "Unbekannt",
                        "avatar": listing_user.avatar,
                        "verified": listing_user.verification_state == VerificationState.SELLER_VERIFIED
                    }
                elif listing_shop:
                    seller_info = {
                        "id": listing_shop.id,
                        "name": listing_shop.name or "Unbekannt",
                        "avatar": listing_shop.image,
                        "verified": listing_shop.verified
                    }
                
                listings_data.append({
                    "id": listing.id,
                    "title": listing.title or "Kein Titel",
                    "description": listing.description or "Keine Beschreibung",
                    "price": listing.price or 0,
                    "currency": "EUR",
                    "category": listing.category or "Unbekannt",
                    "subcategory": None,
                    "location": listing.location or "Unbekannt",
                    "images": images,
                    "status": listing.status.value if listing.status else "unknown",
                    "created_at": listing.created_at.isoformat() if listing.created_at else None,
                    "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
                    "user_id": listing.user_id,
                    "is_featured": False,
                    "view_count": listing.views or 0,
                    "contact_phone": None,
                    "contact_email": None,
                    "condition": listing.condition,
                    "delivery_options": [],
                    "seller": seller_info,
                    "is_from_followed": listing.user_id in following_ids if following_ids else False
                })
            except Exception as e:
                # Skip problematic listings
                continue
        
        return {
            "listings": listings_data,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            },
            "following_count": len(following_ids),
            "is_personalized": len(following_ids) > 0
        }

# ============================================================================
# NOTIFICATION SYSTEM ENDPOINTS
# ============================================================================

@app.get("/api/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, description="Anzahl der Benachrichtigungen pro Seite"),
    offset: int = Query(0, description="Offset für Paginierung"),
    unread_only: bool = Query(False, description="Nur ungelesene Benachrichtigungen")
):
    """Benachrichtigungen des aktuellen Users abrufen"""
    
    with Session(engine) as session:
        query = select(Notification).where(Notification.user_id == current_user.id)
        
        if unread_only:
            query = query.where(Notification.is_read == False)
        
        # Paginierung anwenden
        query = query.offset(offset).limit(limit).order_by(desc(Notification.created_at))
        notifications = session.exec(query).all()
        
        return [
            NotificationResponse(
                id=notification.id,
                type=notification.type,
                title=notification.title,
                message=notification.message,
                is_read=notification.is_read,
                created_at=notification.created_at,
                related_user_id=notification.related_user_id,
                related_listing_id=notification.related_listing_id,
                related_entity_id=notification.related_entity_id
            )
            for notification in notifications
        ]

@app.get("/api/notifications/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user: User = Depends(get_current_user)
):
    """Benachrichtigungs-Statistiken abrufen"""
    
    with Session(engine) as session:
        # Gesamtanzahl
        total_count = session.exec(
            select(func.count(Notification.id)).where(Notification.user_id == current_user.id)
        ).first() or 0
        
        # Ungelesene
        unread_count = session.exec(
            select(func.count(Notification.id)).where(
                and_(
                    Notification.user_id == current_user.id,
                    Notification.is_read == False
                )
            )
        ).first() or 0
        
        # Nach Typ
        new_listing_count = session.exec(
            select(func.count(Notification.id)).where(
                and_(
                    Notification.user_id == current_user.id,
                    Notification.type == NotificationType.NEW_LISTING,
                    Notification.is_read == False
                )
            )
        ).first() or 0
        
        follow_count = session.exec(
            select(func.count(Notification.id)).where(
                and_(
                    Notification.user_id == current_user.id,
                    Notification.type == NotificationType.FOLLOW,
                    Notification.is_read == False
                )
            )
        ).first() or 0
        
        message_count = session.exec(
            select(func.count(Notification.id)).where(
                and_(
                    Notification.user_id == current_user.id,
                    Notification.type == NotificationType.MESSAGE,
                    Notification.is_read == False
                )
            )
        ).first() or 0
        
        return NotificationStats(
            total_count=total_count,
            unread_count=unread_count,
            new_listing_count=new_listing_count,
            follow_count=follow_count,
            message_count=message_count
        )

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int = Path(..., description="ID der Benachrichtigung"),
    current_user: User = Depends(get_current_user)
):
    """Benachrichtigung als gelesen markieren"""
    
    with Session(engine) as session:
        notification = session.exec(
            select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == current_user.id
                )
            )
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Benachrichtigung nicht gefunden")
        
        notification.is_read = True
        session.add(notification)
        session.commit()
        
        return {"message": "Benachrichtigung als gelesen markiert"}

@app.put("/api/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user)
):
    """Alle Benachrichtigungen als gelesen markieren"""
    
    with Session(engine) as session:
        notifications = session.exec(
            select(Notification).where(
                and_(
                    Notification.user_id == current_user.id,
                    Notification.is_read == False
                )
            )
        ).all()
        
        for notification in notifications:
            notification.is_read = True
            session.add(notification)
        
        session.commit()
        
        return {"message": f"{len(notifications)} Benachrichtigungen als gelesen markiert"}

# ============================================================================
# NOTIFICATION HELPER FUNCTIONS
# ============================================================================

def create_notification(
    user_id: int,
    type: NotificationType,
    title: str,
    message: str,
    related_user_id: Optional[int] = None,
    related_listing_id: Optional[int] = None,
    related_entity_id: Optional[int] = None
):
    """Helper-Funktion zum Erstellen von Benachrichtigungen"""
    
    with Session(engine) as session:
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            related_user_id=related_user_id,
            related_listing_id=related_listing_id,
            related_entity_id=related_entity_id
        )
        session.add(notification)
        session.commit()
        return notification

# ============================================================================
# AI ENDPOINTS
# ============================================================================

# Pydantic Models für AI
class OptimizeDescriptionRequest(BaseModel):
    title: str
    description: str
    category: str

class OptimizeDescriptionResponse(BaseModel):
    optimized_description: str

class SuggestCategoryRequest(BaseModel):
    title: str
    description: str

class SuggestCategoryResponse(BaseModel):
    suggested_category: str

class ImproveSearchRequest(BaseModel):
    search_query: str

class ImproveSearchResponse(BaseModel):
    improved_terms: List[str]

class DetectSpamRequest(BaseModel):
    title: str
    description: str

class DetectSpamResponse(BaseModel):
    spam_score: int
    suspicious_features: List[str]
    recommendation: str
    reason: str

class GenerateTagsRequest(BaseModel):
    title: str
    description: str
    category: str

class GenerateTagsResponse(BaseModel):
    tags: List[str]

@app.post("/api/ai/optimize-description", response_model=OptimizeDescriptionResponse)
async def optimize_description(
    request: OptimizeDescriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """Optimiert eine Anzeigenbeschreibung mit AI"""
    try:
        optimized = ai_service.optimize_listing_description(
            request.title, 
            request.description, 
            request.category
        )
        
        if not optimized:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return OptimizeDescriptionResponse(optimized_description=optimized)
    
    except Exception as e:
        logger.error(f"Fehler beim Optimieren der Beschreibung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Optimieren der Beschreibung")

@app.post("/api/ai/suggest-category", response_model=SuggestCategoryResponse)
async def suggest_category(
    request: SuggestCategoryRequest,
    current_user: User = Depends(get_current_user)
):
    """Schlägt eine passende Kategorie für eine Anzeige vor"""
    try:
        suggested = ai_service.suggest_category(request.title, request.description)
        
        if not suggested:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return SuggestCategoryResponse(suggested_category=suggested)
    
    except Exception as e:
        logger.error(f"Fehler beim Vorschlagen der Kategorie: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Vorschlagen der Kategorie")

@app.post("/api/ai/improve-search", response_model=ImproveSearchResponse)
async def improve_search_terms(
    request: ImproveSearchRequest,
    current_user: User = Depends(get_current_user)
):
    """Verbessert Suchbegriffe und schlägt Alternativen vor"""
    try:
        improved_terms = ai_service.improve_search_terms(request.search_query)
        
        if not improved_terms:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return ImproveSearchResponse(improved_terms=improved_terms)
    
    except Exception as e:
        logger.error(f"Fehler beim Verbessern der Suchbegriffe: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Verbessern der Suchbegriffe")

@app.post("/api/ai/detect-spam", response_model=DetectSpamResponse)
async def detect_spam(
    request: DetectSpamRequest,
    current_user: User = Depends(get_current_user)
):
    """Erkennt potenzielle Spam-Anzeigen"""
    try:
        spam_analysis = ai_service.detect_spam(request.title, request.description)
        
        return DetectSpamResponse(
            spam_score=spam_analysis.get("spam_score", 0),
            suspicious_features=spam_analysis.get("suspicious_features", []),
            recommendation=spam_analysis.get("recommendation", "APPROVE"),
            reason=spam_analysis.get("reason", "Keine Analyse verfügbar")
        )
    
    except Exception as e:
        logger.error(f"Fehler bei der Spam-Erkennung: {e}")
        raise HTTPException(status_code=500, detail="Fehler bei der Spam-Erkennung")

@app.post("/api/ai/generate-tags", response_model=GenerateTagsResponse)
async def generate_tags(
    request: GenerateTagsRequest,
    current_user: User = Depends(get_current_user)
):
    """Generiert relevante Tags für eine Anzeige"""
    try:
        tags = ai_service.generate_tags(
            request.title, 
            request.description, 
            request.category
        )
        
        if not tags:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return GenerateTagsResponse(tags=tags)
    
    except Exception as e:
        logger.error(f"Fehler beim Generieren der Tags: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Generieren der Tags")

@app.get("/api/ai/health")
async def ai_health_check():
    """Überprüft den Status des AI-Services"""
    return {
        "status": "healthy" if ai_service.api_key else "no_api_key",
        "service": "OpenAI GPT-4o Mini",
        "api_key_configured": bool(ai_service.api_key)
    }

@app.post("/api/ai/test/optimize-description")
async def test_optimize_description(request: OptimizeDescriptionRequest):
    """Test-Endpunkt für Beschreibungsoptimierung (ohne Auth)"""
    try:
        optimized = ai_service.optimize_listing_description(
            request.title, 
            request.description, 
            request.category
        )
        
        if not optimized:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return OptimizeDescriptionResponse(optimized_description=optimized)
    
    except Exception as e:
        logger.error(f"Fehler beim Optimieren der Beschreibung: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Optimieren der Beschreibung")

@app.post("/api/ai/test/suggest-category")
async def test_suggest_category(request: SuggestCategoryRequest):
    """Test-Endpunkt für Kategorievorschläge (ohne Auth)"""
    try:
        # Verwende leere Beschreibung falls nicht vorhanden
        description = request.description if hasattr(request, 'description') and request.description else ""
        suggested = ai_service.suggest_category(request.title, description)
        
        if not suggested:
            raise HTTPException(status_code=500, detail="AI-Service nicht verfügbar")
        
        return SuggestCategoryResponse(suggested_category=suggested)
    
    except Exception as e:
        logger.error(f"Fehler beim Vorschlagen der Kategorie: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Vorschlagen der Kategorie")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)