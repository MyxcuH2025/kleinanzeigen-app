import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Datenbank - PRODUKTIONS-READY
    # PostgreSQL für Produktion (Supabase)
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.hcwilqiczkmesxmetprm:Suncahaharhudu1!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres")
    
    # PostgreSQL Support
    POSTGRES_URL = os.getenv("POSTGRES_URL", None)  # Supabase PostgreSQL URL
    
    # Connection Pooling für bessere Performance
    POOL_SIZE = int(os.getenv("POOL_SIZE", "20"))  # Anzahl der Verbindungen im Pool
    MAX_OVERFLOW = int(os.getenv("MAX_OVERFLOW", "30"))  # Zusätzliche Verbindungen bei Bedarf
    POOL_TIMEOUT = int(os.getenv("POOL_TIMEOUT", "30"))  # Timeout in Sekunden
    POOL_RECYCLE = int(os.getenv("POOL_RECYCLE", "3600"))  # Verbindungen nach 1 Stunde erneuern
    POOL_PRE_PING = os.getenv("POOL_PRE_PING", "True").lower() == "true"  # Verbindungen vor Nutzung testen
    
    # Redis Caching für Performance-Optimierung
    REDIS_URL = os.getenv("REDIS_URL", "redis://default:75SFxGpipHBU8ayr1wvpaX4cUHUw04aY@redis-14485.c100.us-east-1-4.ec2.redns.redis-cloud.com:14485")
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "75SFxGpipHBU8ayr1wvpaX4cUHUw04aY")
    REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", "100"))
    REDIS_SOCKET_TIMEOUT = int(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))
    REDIS_SOCKET_CONNECT_TIMEOUT = int(os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT", "5"))
    
    # Cache-TTL (Time To Live) in Sekunden
    CACHE_TTL_LISTINGS = int(os.getenv("CACHE_TTL_LISTINGS", "300"))  # 5 Minuten
    CACHE_TTL_CATEGORIES = int(os.getenv("CACHE_TTL_CATEGORIES", "1800"))  # 30 Minuten
    CACHE_TTL_USER_PROFILES = int(os.getenv("CACHE_TTL_USER_PROFILES", "600"))  # 10 Minuten
    CACHE_TTL_SEARCH_RESULTS = int(os.getenv("CACHE_TTL_SEARCH_RESULTS", "180"))  # 3 Minuten
    
    # Rate Limiting Konfiguration - PRODUKTIONS-READY
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "False").lower() == "true"
    
    # PRODUKTIONS-WERTE für 40.000 User
    RATE_LIMIT_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "120"))  # 120 Requests/Minute (höher für Produktion)
    RATE_LIMIT_BURST_SIZE = int(os.getenv("RATE_LIMIT_BURST_SIZE", "20"))  # 20 Requests Burst (mehr für Produktion)
    RATE_LIMIT_WINDOW_SIZE = int(os.getenv("RATE_LIMIT_WINDOW_SIZE", "60"))  # 60 Sekunden Window
    RATE_LIMIT_SEARCH_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_SEARCH_REQUESTS_PER_MINUTE", "60"))  # 60 Search Requests/Minute (höher für Produktion)
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Stunden
    
    # E-Mail
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-app-password")
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@kleinanzeigen.de")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "kleinanzeigen.log")
    
    # Frontend URL für E-Mail-Links
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # CORS - SECURITY-OPTIMIERT
    CORS_ORIGINS = [
        # Entwicklung
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        
        # Produktion (wenn bereit)
        # "https://yourdomain.com",
        # "https://www.yourdomain.com",
        
        # Temporär für Entwicklung - ENTFERNEN für Produktion!
        "*"  # ⚠️ NUR für Entwicklung - Sicherheitsrisiko!
    ]
    
    # Upload
    UPLOAD_DIR = "uploads"
    ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"]
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB (erhöht von 10MB)
    
    # Google AI Studio
    GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")
    
    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Aliase für Kompatibilität
    ALLOWED_ORIGINS = CORS_ORIGINS

config = Config() 