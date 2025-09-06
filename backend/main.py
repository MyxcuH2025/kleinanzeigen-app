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

# Import der Router aus den Modulen
from app.auth.routes import router as auth_router
from app.listings.routes import router as listings_router
from app.users.routes import router as users_router
from app.admin.routes import router as admin_router
from app.favorites.routes import router as favorites_router
from app.templates.routes import router as templates_router
from app.search.routes import router as search_router
from app.categories.routes import router as categories_router
from app.upload.routes import router as upload_router
from app.ai.routes import router as ai_router
from app.conversations.routes import router as conversations_router
from app.reports.routes import router as reports_router
from app.forms.routes import router as forms_router
from app.shops.routes import router as shops_router
from app.follow.routes import router as follow_router
from app.feed.routes import router as feed_router
from app.notifications.routes import router as notifications_router
from app.admin_categories.routes import router as admin_categories_router
from app.websocket.routes import router as websocket_router
from app.system.routes import router as system_router

# Logging-Konfiguration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Engine erstellen
engine = create_engine(config.DATABASE_URL)

def create_db_and_tables():
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/images", StaticFiles(directory="../frontend/public/images"), name="images")

# Router registrieren
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(users_router)
app.include_router(admin_router)
app.include_router(favorites_router)
app.include_router(templates_router)
app.include_router(search_router)
app.include_router(categories_router)
app.include_router(upload_router)
app.include_router(ai_router)
app.include_router(conversations_router)
app.include_router(reports_router)
app.include_router(forms_router)
app.include_router(shops_router)
app.include_router(follow_router)
app.include_router(feed_router)
app.include_router(notifications_router)
app.include_router(admin_categories_router)
app.include_router(websocket_router)
app.include_router(system_router)

# Health Check wird jetzt über system_router bereitgestellt

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
