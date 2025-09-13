"""
Kleinanzeigen API - Modularized Version
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from config import config
from sqlmodel import SQLModel, create_engine

# Import aller Router - Echte Backend-Features aktiviert
from app.auth.routes import router as auth_router
from app.listings.routes import router as listings_router
from app.users.routes import router as users_router
from app.categories.routes import router as categories_router
from app.search.routes import router as search_router
from app.cache.routes import router as cache_router
from app.system.routes import router as system_router
from app.notifications.routes import router as notifications_router
from app.favorites.routes import router as favorites_router
from app.admin.routes import router as admin_router
from app.follow.routes import router as follow_router
from app.feed.routes import router as feed_router
from app.conversations.routes import router as conversations_router
from app.performance.routes import router as performance_router
from app.websocket.routes import router as websocket_router
from app.stories.routes import router as stories_router  # 🆕 Stories-Feature
from app.stories.analytics_routes import router as stories_analytics_router  # 🆕 Stories Analytics

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

# Engine für PostgreSQL (Supabase) erstellen
engine = create_engine(
    config.DATABASE_URL,
    # PostgreSQL-optimierte Einstellungen für bessere Performance
    pool_size=config.POOL_SIZE,  # 20 Verbindungen
    max_overflow=config.MAX_OVERFLOW,  # 30 zusätzliche Verbindungen
    pool_timeout=config.POOL_TIMEOUT,  # 30 Sekunden
    pool_recycle=config.POOL_RECYCLE,  # 1 Stunde
    pool_pre_ping=config.POOL_PRE_PING,  # Verbindungen testen
    echo=False  # Setze auf True für SQL-Debugging
)

def create_db_and_tables():
    # Importiere alle Modelle um Foreign Keys zu registrieren
    import models  # Alle Modelle importieren
    SQLModel.metadata.create_all(engine)
    print("✅ Alle Tabellen erfolgreich erstellt")

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

# Rate Limiting Middleware hinzufügen - SECURITY-OPTIMIERT
# app.add_middleware(RateLimitMiddleware)  # TODO: Aktivieren wenn Rate-Limiting implementiert

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

@app.get("/api/images/{file_path:path}")
async def serve_image(file_path: str):
    """Serviert Bilder mit korrekten CORS-Headern - unterstützt Unterordner"""
    # Entferne doppelte Pfade
    if file_path.startswith('uploads/'):
        file_path = file_path.replace('uploads/', '')
    if file_path.startswith('/uploads/'):
        file_path = file_path.replace('/uploads/', '')
    
    full_path = os.path.join("uploads", file_path)
    if os.path.exists(full_path):
        # Bestimme den korrekten Media-Type basierend auf Dateiname
        filename = os.path.basename(file_path)
        if filename.lower().endswith(('.jpg', '.jpeg')):
            media_type = "image/jpeg"
        elif filename.lower().endswith('.png'):
            media_type = "image/png"
        elif filename.lower().endswith('.webp'):
            media_type = "image/webp"
        elif filename.lower().endswith('.gif'):
            media_type = "image/gif"
        else:
            media_type = "image/jpeg"  # Fallback
        
        return FileResponse(
            full_path,
            media_type=media_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=3600"
            }
        )
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Image not found")

@app.options("/api/images/{file_path:path}")
async def serve_image_options(file_path: str):
    """CORS-Preflight für Bild-Requests - unterstützt Unterordner"""
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

# Fallback für alte URLs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Router registrieren - Alle echten Backend-Features aktiviert
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(search_router)
app.include_router(cache_router)
app.include_router(system_router)
app.include_router(notifications_router)
app.include_router(favorites_router)
app.include_router(admin_router)
app.include_router(follow_router)
app.include_router(feed_router)
app.include_router(conversations_router)
app.include_router(performance_router)
app.include_router(websocket_router)
app.include_router(stories_router)  # 🆕 Stories-Feature
app.include_router(stories_analytics_router)  # 🆕 Stories Analytics

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
# app.include_router(online_status_router)
# app.include_router(performance_router)

# Fehlende Endpoints für Entities-Seite
@app.get("/api/shops")
async def get_shops():
    """Dummy endpoint für Shops"""
    return []

@app.get("/api/online-users")
async def get_online_users(user_id: int):
    """Dummy endpoint für Online-Status"""
    return {"online": False}

# Health Check für schnellen Start
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Kleinanzeigen API läuft!"}

@app.get("/")
async def root():
    return {"message": "Kleinanzeigen API - Schneller Start"}

# Health Check wird jetzt über system_router bereitgestellt

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
