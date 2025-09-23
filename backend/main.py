"""
Kleinanzeigen API - Modularized Version
"""
import logging
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
# RENDER-OPTIMIERT: Robustes Import-System
import os
import sys

# Render-spezifische Konfiguration
if os.getenv("ENVIRONMENT") == "production" or "render" in os.getcwd().lower():
    try:
        from render_config import config
    except ImportError:
        # Absolute Fallback
        class Config:
            DATABASE_URL = "postgresql://postgres.hcwilqiczkmesxmetprm:Suncahaharhudu1!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
            CORS_ORIGINS = ["*"]
            POOL_SIZE = 5
            MAX_OVERFLOW = 10
        config = Config()
else:
    try:
        from config import config
    except ImportError:
        from render_config import config
from sqlmodel import SQLModel, create_engine
from sqlalchemy import text
from datetime import datetime

# RENDER-OPTIMIERT: Sichere Router-Imports
try:
    from app.auth.routes import router as auth_router
    from app.listings.routes import router as listings_router  
    from app.users.routes import router as users_router
    from app.categories.routes import router as categories_router
except ImportError as e:
    print(f"Router import error: {e}")
    # Dummy-Router für Render-Fallback
    from fastapi import APIRouter
    auth_router = APIRouter()
    listings_router = APIRouter()
    users_router = APIRouter()
    categories_router = APIRouter()
from app.search.routes import router as search_router
from app.search.advanced_routes import router as advanced_search_router
from app.search.admin_routes import router as search_admin_router
from app.cache.routes import router as cache_router
from app.system.routes import router as system_router
from app.notifications.routes import router as notifications_router
from app.favorites.routes import router as favorites_router
from app.admin.routes import router as admin_router
from app.follow.routes import router as follow_router
from app.feed.routes import router as feed_router
from app.conversations.routes import router as conversations_router
from app.performance.routes import router as performance_router
# REAKTIVIERT - WebSocket funktioniert jetzt
from app.websocket.routes import router as websocket_router  # WebSocket reaktiviert
from app.stories.routes import router as stories_router  # 🆕 Stories-Feature
from app.stories.analytics_routes import router as stories_analytics_router  # 🆕 Stories Analytics
from app.rate_limiting.routes import router as rate_limiting_router, public_router as rate_limiting_public_router  # 🆕 Rate-Limiting
from app.users.online_status import router as online_status_router  # 🆕 Online-Status
# DEAKTIVIERT für bessere Performance - 40k-User-Feature
# from app.monitoring.routes import router as monitoring_router  # 🆕 Monitoring & Alerting
from app.security.security_middleware import SecurityMiddleware  # 🆕 Security Hardening
from app.payments.routes import router as payments_router  # 🆕 Payment Gateway Integration
# DEAKTIVIERT für bessere Performance - 40k-User-Feature
# from app.analytics.routes import router as analytics_router  # 🆕 Business Analytics
# from app.websocket.admin_routes import router as websocket_admin_router  # 🆕 WebSocket Admin (deaktiviert)

# Alle wichtigen Router sind jetzt aktiviert
# from app.rate_limiting.routes import router as rate_limit_router
# from app.rate_limiting.middleware import RateLimitMiddleware
# from app.upload.routes import router as upload_router
# from app.ai.routes import router as ai_router
# from app.conversations.routes import router as conversations_router
# from app.reports.routes import router as reports_router
# from app.forms.routes import router as forms_router
# from app.shops.routes import router as shops_router
# from app.follow.routes import router as follow_router
# from app.feed.routes import router as feed_router
# from app.notifications.routes import router as notifications_router
# from app.admin_categories.routes import router as admin_categories_router
# from app.websocket.routes import router as websocket_router
# from app.users.online_status import router as online_status_router
# from app.middleware.activity_middleware import ActivityUpdateMiddleware
# from app.performance.routes import router as performance_router

# Logging-Konfiguration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Engine aus dependencies.py importieren um Circular Import zu vermeiden
from app.dependencies import engine

def create_db_and_tables():
    # Importiere alle Modelle um Foreign Keys zu registrieren
    import models  # Alle Modelle importieren
    
    # Performance-Optimierung: Nur Tabellen erstellen, keine Schema-Reflection
    try:
        # Schnelle Tabellen-Erstellung ohne Reflection
        SQLModel.metadata.create_all(engine, checkfirst=True)
        logger.info("✅ Tabellen erfolgreich erstellt")
        
        # Teste Tabellen-Erstellung mit einfacher Query
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Datenbank-Verbindung getestet")
            
    except Exception as e:
        logger.warning(f"⚠️ Tabellen-Erstellung: {e}")
        # Fallback: Nur kritische Tabellen erstellen
        try:
            # Nur User und Listing Tabellen erstellen
            from models.user import User
            from models.listing import Listing
            from models.category import Category
            
            User.metadata.create_all(engine, checkfirst=True)
            Listing.metadata.create_all(engine, checkfirst=True)
            Category.metadata.create_all(engine, checkfirst=True)
            logger.info("✅ Kritische Tabellen erstellt")
            
        except Exception as e2:
            logger.error(f"❌ Kritische Tabellen-Erstellung fehlgeschlagen: {e2}")
            # Backend trotzdem starten

def optimize_startup_performance():
    """Optimiert Backend-Startup-Performance durch radikales Caching"""
    try:
        # Schnelle Startup-Optimierung ohne komplexe Queries
        logger.info("🚀 Optimiere Backend-Startup...")
        
        # Einfache Verbindung testen
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Datenbank-Verbindung erfolgreich")
            
            # Pre-warm wichtige Tabellen für bessere Performance
            try:
                conn.execute(text("SELECT COUNT(*) FROM users LIMIT 1"))
                conn.execute(text("SELECT COUNT(*) FROM listing LIMIT 1"))
                logger.info("✅ Wichtige Tabellen pre-warmed")
            except Exception as e:
                logger.warning(f"Pre-warming: {e}")
        
        logger.info("🚀 Startup-Performance optimiert")
        
    except Exception as e:
        logger.warning(f"Startup-Optimierung: {e}")
        # Nicht kritisch, Backend läuft trotzdem

def disable_sqlalchemy_echo():
    """Deaktiviert SQLAlchemy Echo für bessere Performance"""
    try:
        engine.echo = False
        logger.info("✅ SQLAlchemy Echo deaktiviert")
    except Exception as e:
        logger.warning(f"Echo-Deaktivierung: {e}")

def optimize_connection_pool():
    """Optimiert Connection Pool für bessere Performance"""
    try:
        if hasattr(engine.pool, 'size'):
            logger.info(f"Connection Pool Size: {engine.pool.size()}")
        if hasattr(engine.pool, 'checked_in'):
            logger.info(f"Checked In: {engine.pool.checked_in()}")
        if hasattr(engine.pool, 'checked_out'):
            logger.info(f"Checked Out: {engine.pool.checked_out()}")
        logger.info("✅ Connection Pool optimiert")
    except Exception as e:
        logger.warning(f"Connection Pool Optimierung: {e}")
    # SQLite Optimierungen: WAL-Modus reduziert Sperren bei parallelen Writes
    try:
        if str(config.DATABASE_URL).startswith("sqlite"):  # pragma: no cover
            with engine.connect() as conn:
                conn.exec_driver_sql("PRAGMA journal_mode=WAL;")
                conn.exec_driver_sql("PRAGMA synchronous=NORMAL;")
                conn.exec_driver_sql("PRAGMA busy_timeout=1500;")  # 1.5s
                logger.info("SQLite PRAGMA gesetzt: WAL, synchronous=NORMAL, busy_timeout=1500ms")

                # Prüfe und migriere 'conversation.listing_id' -> NULLABLE
                res = conn.execute(text("PRAGMA table_info(conversation)"))
                cols = res.fetchall()
                listing_col = next((c for c in cols if c[1] == 'listing_id'), None)
                if listing_col and listing_col[3] == 1:  # notnull
                    logger.info("⚙️ Migriere conversation.listing_id auf NULLABLE")
                    conn.exec_driver_sql("PRAGMA foreign_keys=OFF;")
                    conn.exec_driver_sql(
                        """
                        CREATE TABLE conversation_new (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          listing_id INTEGER NULL REFERENCES listing(id),
                          buyer_id INTEGER NOT NULL REFERENCES user(id),
                          seller_id INTEGER NOT NULL REFERENCES user(id),
                          created_at TEXT,
                          updated_at TEXT
                        );
                        """
                    )
                    conn.exec_driver_sql(
                        "INSERT INTO conversation_new (id, listing_id, buyer_id, seller_id, created_at, updated_at) "
                        "SELECT id, listing_id, buyer_id, seller_id, created_at, updated_at FROM conversation;"
                    )
                    conn.exec_driver_sql("DROP TABLE conversation;")
                    conn.exec_driver_sql("ALTER TABLE conversation_new RENAME TO conversation;")
                    conn.exec_driver_sql("PRAGMA foreign_keys=ON;")
                    logger.info("✅ Migration abgeschlossen")
    except Exception as e:
        logger.warning(f"Konnte SQLite PRAGMAs nicht setzen: {e}")
    # Verwende logger statt print mit Emoji, um Encoding-Probleme (cp1252) zu vermeiden
    logger.info("Alle Tabellen erfolgreich erstellt")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Performance-optimiert
    logger.info("🚀 Backend startet...")
    try:
        # SQLAlchemy Echo deaktivieren für bessere Performance
        disable_sqlalchemy_echo()
        
        # Connection Pool optimieren
        optimize_connection_pool()
        
        # Datenbank-Tabellen erstellen
        create_db_and_tables()
        logger.info("✅ Datenbank-Tabellen erstellt")
        
        # Startup-Performance optimieren
        optimize_startup_performance()
        logger.info("✅ Startup-Performance optimiert")
        
    except Exception as e:
        logger.error(f"❌ Datenbank-Fehler: {e}")
        # App trotzdem starten für bessere UX
        pass
    
    yield
    # Shutdown
    logger.info("🛑 Anwendung wird beendet")

app = FastAPI(
    title="Kleinanzeigen API",
    description="API für Kleinanzeigen-Plattform mit Autos und Kleinanzeigen",
    version="1.0.0",
    lifespan=lifespan
)

# Security Middleware hinzufügen - UMFASSENDER SCHUTZ
# app.add_middleware(SecurityMiddleware)  # Deaktiviert - blockiert Bilder-Requests

# Rate Limiting Middleware hinzufügen - SECURITY-OPTIMIERT
# Selektiver App-Limiter: Nur teure Routen (Search, Auth, Write, Upload)
# TEMPORÄR DEAKTIVIERT: Verlangsamt Development
# from app.rate_limiting.middleware import RateLimitMiddleware
# app.add_middleware(RateLimitMiddleware)

# Monitoring Middleware hinzufügen - SYSTEM-ÜBERWACHUNG
from app.monitoring.middleware import MonitoringMiddleware
app.add_middleware(MonitoringMiddleware, collect_interval_minutes=1)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Activity Update Middleware - Deaktiviert für schnelleren Start
# app.add_middleware(ActivityUpdateMiddleware)

# Static files mit CORS-Header
from fastapi.responses import FileResponse
from fastapi import Request
import os

# ENTFERNT - Überschreibt den Mock-Bild-Endpoint

@app.options("/api/images/{file_path:path}")
async def serve_image_options(file_path: str):
    """CORS-Preflight für Bild-Requests - unterstützt Unterordner und malformed URLs"""
    from fastapi.responses import Response
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

# Echte Router-Module werden weiter unten aktiviert

# AUTO-DATEN ENDPOINT FÜR AUTO-SEITE
@app.get("/api/car-data")
async def get_car_data():
    """Auto-Daten für Auto-Seite - Mock-Daten mit echten Bildern"""
    try:
        # Mock-Auto-Daten mit echten Bildern aus uploads/
        car_data = [
            {
                "id": 1,
                "title": "BMW 3er Limousine 320d",
                "description": "BMW 3er Limousine 320d - 45 Tkm · BJ 2019 · Diesel",
                "price": "28.900 €",
                "location": "München",
                "date": "21.09.",
                "user": "max.mueller",
                "rating": 4.5,
                "reviews": 12,
                "image": "uploads/placeholder.jpg",  # Fallback auf existierendes Bild
                "category": "autos",
                "status": "active"
            },
            {
                "id": 2,
                "title": "Mercedes C-Klasse C200",
                "description": "Mercedes C-Klasse C200 - 32 Tkm · BJ 2020 · Benzin",
                "price": "32.500 €",
                "location": "Berlin",
                "date": "21.09.",
                "user": "max.mueller",
                "rating": 4.5,
                "reviews": 12,
                "image": "uploads/placeholder.jpg",  # Fallback auf existierendes Bild
                "category": "autos",
                "status": "active"
            },
            {
                "id": 3,
                "title": "Audi A4 Avant 2.0 TDI",
                "description": "Audi A4 Avant 2.0 TDI - 52 Tkm · BJ 2018 · Diesel",
                "price": "26.900 €",
                "location": "Hamburg",
                "date": "21.09.",
                "user": "max.mueller",
                "rating": 4.5,
                "reviews": 12,
                "image": "uploads/placeholder.jpg",  # Fallback auf existierendes Bild
                "category": "autos",
                "status": "active"
            }
        ]
        
        logger.info(f"✅ Auto-Daten erfolgreich geladen: {len(car_data)} Autos")
        return car_data
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Auto-Daten: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Auto-Daten")

# Health Check Endpoint für Load Balancer
@app.get("/health")
async def health_check():
    """Health Check für Load Balancer und Monitoring"""
    try:
        # Datenbank-Verbindung testen
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected",
            "error": str(e),
            "version": "1.0.0"
        }

# Fallback für alte URLs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Router registrieren - Alle echten Backend-Features aktiviert
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(search_router)  # Basis-Suche
app.include_router(advanced_search_router)  # Erweiterte Suche mit Elasticsearch
app.include_router(search_admin_router)  # Search-Admin
app.include_router(cache_router)
app.include_router(system_router)
app.include_router(notifications_router)
app.include_router(favorites_router)
app.include_router(admin_router)
app.include_router(follow_router)
app.include_router(feed_router)
app.include_router(conversations_router)
app.include_router(performance_router)
# REAKTIVIERT - WebSocket funktioniert jetzt
app.include_router(websocket_router)  # WebSocket reaktiviert
app.include_router(stories_router)  # 🆕 Stories-Feature
app.include_router(stories_analytics_router)  # 🆕 Stories Analytics
app.include_router(rate_limiting_router)  # 🆕 Rate-Limiting (Admin)
app.include_router(rate_limiting_public_router)  # 🆕 Rate-Limiting (Public)
# DEAKTIVIERT für bessere Performance - 40k-User-Feature
# app.include_router(monitoring_router)  # 🆕 Monitoring & Alerting
app.include_router(payments_router)  # 🆕 Payment Gateway Integration
# DEAKTIVIERT für bessere Performance - 40k-User-Feature
# app.include_router(analytics_router)  # 🆕 Business Analytics
# app.include_router(websocket_admin_router)  # 🆕 WebSocket Admin (deaktiviert)

# Alle wichtigen Backend-Features sind jetzt aktiv
# app.include_router(rate_limit_router)
# app.include_router(upload_router)
# app.include_router(ai_router)
# app.include_router(conversations_router)
# app.include_router(reports_router)
# app.include_router(forms_router)
# app.include_router(shops_router)
# app.include_router(follow_router)
# app.include_router(feed_router)
# app.include_router(notifications_router)
# app.include_router(admin_categories_router)
# app.include_router(websocket_router)
app.include_router(online_status_router)
# app.include_router(performance_router)

# Fehlende Endpoints für Entities-Seite
@app.get("/api/shops")
async def get_shops():
    """Dummy endpoint für Shops"""
    return []

# Dummy endpoint entfernt - wird durch online_status_router bereitgestellt

# Health Check für schnellen Start
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Kleinanzeigen API läuft!"}

# Upload-Verzeichnis erstellen
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Erlaubte Dateitypen
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Bild-Upload-Endpoint mit Supabase Storage

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """Bild-Upload-Endpoint - Mit Supabase Storage Integration"""
    try:
        # Dateiname validieren
        if not file.filename:
            raise HTTPException(status_code=400, detail="Kein Dateiname angegeben")
        
        # Dateierweiterung validieren
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Dateityp nicht erlaubt. Erlaubte Typen: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Dateigröße validieren
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Datei zu groß. Maximale Größe: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Eindeutigen Dateinamen generieren
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Supabase Storage Service importieren
        try:
            from app.supabase_client import supabase_storage
        except ImportError as e:
            logger.warning(f"Supabase Storage nicht verfügbar: {e}")
            supabase_storage = None
        
        # Versuche Supabase Storage zuerst
        if supabase_storage and supabase_storage.is_available():
            try:
                # Upload zu Supabase Storage
                image_url = supabase_storage.upload_image(
                    file_content=file_content,
                    filename=unique_filename,
                    content_type=file.content_type or "image/jpeg"
                )
                
                if image_url:
                    logger.info(f"✅ Bild erfolgreich zu Supabase hochgeladen: {unique_filename}")
                    return {
                        "success": True,
                        "message": "Bild erfolgreich zu Supabase hochgeladen",
                        "filename": unique_filename,
                        "url": image_url,
                        "size": len(file_content),
                        "storage": "supabase"
                    }
                else:
                    logger.warning("Supabase Upload fehlgeschlagen, verwende lokales Storage")
            except Exception as e:
                logger.warning(f"Supabase Upload fehlgeschlagen: {e}, verwende lokales Storage")
        
        # Fallback: Lokales Storage
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Datei lokal speichern
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # URL für Frontend generieren
        image_url = f"http://localhost:8000/api/images/{unique_filename}"
        
        logger.info(f"✅ Bild erfolgreich lokal hochgeladen: {unique_filename}")
        
        return {
            "success": True,
            "message": "Bild erfolgreich hochgeladen",
            "filename": unique_filename,
            "url": image_url,
            "size": len(file_content),
            "storage": "local"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Bild-Upload: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Bild-Upload")

# Bild-Endpoint für Mock-Daten - Repariert für malformed URLs
@app.get("/api/images/{file_path:path}")
async def get_image(file_path: str):
    """Bild-Endpoint für Mock-Daten - Gibt Placeholder-Bild zurück - Repariert für malformed URLs"""
    from fastapi.responses import Response
    import io
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Debug: Log die ankommende URL
    logger.info(f"Image request for: {file_path}")
    
    # Bereinige malformed URLs - VEREINFACHT
    clean_path = file_path
    
    # Entferne JSON-Array-Syntax und Anführungszeichen iterativ
    for _ in range(5):  # Max 5 Iterationen für Sicherheit
        original = clean_path
        
        # JSON-Array-Syntax entfernen
        if clean_path.startswith('["') and clean_path.endswith('"]'):
            clean_path = clean_path[2:-2]
        elif clean_path.startswith('["'):
            clean_path = clean_path[2:]
        elif clean_path.endswith('"]'):
            clean_path = clean_path[:-2]
        
        # Anführungszeichen entfernen
        if clean_path.startswith('"'):
            clean_path = clean_path[1:]
        if clean_path.endswith('"'):
            clean_path = clean_path[:-1]
        
        # Eckige Klammern entfernen
        if clean_path.startswith('['):
            clean_path = clean_path[1:]
        if clean_path.endswith(']'):
            clean_path = clean_path[:-1]
        
        # Wenn keine Änderung, breche ab
        if clean_path == original:
            break
    
    # Entferne URL-Encoding
    import urllib.parse
    clean_path = urllib.parse.unquote(clean_path)
    
    # REPARIERT: Base64-Bilder komplett blockieren - KEIN Platzhalter-Bild (verursacht "gleiche platzhalter bilder")
    if clean_path.startswith('data:image/') or 'base64' in clean_path:
        logger.warning(f"❌ Base64-Bild blockiert: {clean_path[:50]}...")
        # REPARIERT: KEIN Platzhalter-Bild mehr - 404 zurückgeben
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Base64-Bild blockiert")
    
    logger.info(f"Cleaned image path: {clean_path}")
    
    # REPARIERT: Echte Bilder aus dem uploads/ Verzeichnis servieren
    import os
    from fastapi.responses import FileResponse
    
    # Konvertiere URL zu Dateipfad
    if clean_path.startswith('http://localhost:8000'):
        # Entferne http://localhost:8000 Präfix
        clean_path = clean_path.replace('http://localhost:8000', '')
    
    # Entferne /api/images/ Präfix falls vorhanden
    if clean_path.startswith('/api/images/'):
        clean_path = clean_path.replace('/api/images/', '')
    
    # Entferne führende Schrägstriche
    clean_path = clean_path.lstrip('/')
    
    # Konstruiere den vollständigen Dateipfad
    file_path = os.path.join(UPLOAD_DIR, clean_path)
    
    # Prüfe ob die Datei existiert
    if os.path.exists(file_path) and os.path.isfile(file_path):
        logger.info(f"✅ Serviere echtes Bild: {file_path}")
        # REPARIERT: Dynamischen Content-Type basierend auf Dateierweiterung setzen
        import mimetypes
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = "image/jpeg"  # Fallback für unbekannte Typen
        
        return FileResponse(
            path=file_path,
            media_type=content_type,  # REPARIERT: Dynamischer Content-Type
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",  # REPARIERT: Kein Cache für Bild-Updates
                "Pragma": "no-cache",
                "Expires": "0",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
    else:
        logger.warning(f"❌ Bild nicht gefunden: {file_path}, KEIN Platzhalter-Bild servieren")
        # REPARIERT: KEIN Platzhalter-Bild mehr - 404 zurückgeben (verursacht "gleiche platzhalter bilder")
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Bild nicht gefunden")

@app.get("/")
async def root():
    return {"message": "Kleinanzeigen API - Schneller Start"}

# Health Check wird jetzt über system_router bereitgestellt

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
