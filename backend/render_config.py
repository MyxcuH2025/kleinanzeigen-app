# Render.com spezifische Konfiguration
import os

class RenderConfig:
    # Datenbank - Supabase PostgreSQL
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.hcwilqiczkmesxmetprm:Suncahaharhudu1!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres")
    
    # CORS - Offen für Entwicklung
    CORS_ORIGINS = ["*"]
    
    # Connection Pooling - Render-optimiert
    POOL_SIZE = 5
    MAX_OVERFLOW = 10
    POOL_TIMEOUT = 30
    POOL_RECYCLE = 3600
    POOL_PRE_PING = False
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
    
# Config-Instanz
config = RenderConfig()
