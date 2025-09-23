"""
Kleinanzeigen API - MINIMAL für Render
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Kleinanzeigen API",
    description="Minimale API für Render Deployment",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Kleinanzeigen API läuft auf Render!", "status": "success"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "kleinanzeigen-backend",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "message": "API funktioniert!"}

# Dummy Endpoints für Frontend
@app.get("/api/listings")
async def get_listings():
    return {
        "listings": [
            {
                "id": 1,
                "title": "Test Anzeige",
                "description": "Test Beschreibung",
                "price": "100 €",
                "location": "Berlin",
                "category": "kleinanzeigen",
                "images": [],
                "status": "active"
            }
        ],
        "total": 1
    }

@app.get("/api/categories")
async def get_categories():
    return [
        {"id": 1, "name": "Kleinanzeigen", "slug": "kleinanzeigen"},
        {"id": 2, "name": "Auto & Rad", "slug": "auto-rad-boot"}
    ]

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
