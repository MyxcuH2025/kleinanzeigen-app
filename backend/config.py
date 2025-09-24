import os
from dotenv import load_dotenv

# TEMPORÄR DEAKTIVIERT: load_dotenv() - verursacht Unicode-Fehler
# load_dotenv()

class Config:
    # Datenbank - SUPABASE für bessere Performance
    # PostgreSQL für Produktion (Supabase) - OPTIMIERT für bessere Performance
    DATABASE_URL = "postgresql+psycopg://postgres.hcwilqiczkmesxmetprm:Suncahaharhudu1!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"  # Korrekte vaybuzeu Supabase-URL mit psycopg3
    
    # PostgreSQL Support
    POSTGRES_URL = os.getenv("POSTGRES_URL", None)  # Supabase PostgreSQL URL
    
    # Connection Pooling für bessere Performance - OPTIMIERT für langsame Supabase
    POOL_SIZE = int(os.getenv("POOL_SIZE", "10"))  # Erhöht für bessere Performance
    MAX_OVERFLOW = int(os.getenv("MAX_OVERFLOW", "20"))  # Erhöht für bessere Performance
    POOL_TIMEOUT = int(os.getenv("POOL_TIMEOUT", "30"))  # Längere Timeouts für langsame Supabase
    POOL_RECYCLE = int(os.getenv("POOL_RECYCLE", "3600"))  # Verbindungen nach 60 Minuten erneuern
    POOL_PRE_PING = os.getenv("POOL_PRE_PING", "False").lower() == "true"  # Deaktiviert für bessere Performance
    
    # Redis Caching für Performance-Optimierung - PRO PLAN
    REDIS_URL = os.getenv("REDIS_URL", "redis://default:75SFxGpipHBU8ayr1wvpaX4cUHUw04aY@redis-14485.c100.us-east-1-4.ec2.redns.redis-cloud.com:14485")
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "75SFxGpipHBU8ayr1wvpaX4cUHUw04aY")
    REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", "200"))  # Pro Plan: Mehr Redis-Verbindungen
    
    # Supabase Pro Plan Features
    SUPABASE_PRO_PLAN = True  # Pro Plan aktiviert
    DAILY_BACKUPS = True  # 7 Tage Backups
    LOG_RETENTION_DAYS = 7  # 7 Tage Log-Retention
    EMAIL_SUPPORT = True  # Email Support verfügbar
    REDIS_SOCKET_TIMEOUT = int(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))
    REDIS_SOCKET_CONNECT_TIMEOUT = int(os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT", "5"))
    
    # Cache-TTL (Time To Live) in Sekunden - PRO PLAN OPTIMIERT
    CACHE_TTL_LISTINGS = int(os.getenv("CACHE_TTL_LISTINGS", "300"))  # 5 Minuten für schnellere Updates
    CACHE_TTL_USERS = int(os.getenv("CACHE_TTL_USERS", "900"))  # 15 Minuten für schnellere Updates
    CACHE_TTL_CATEGORIES = int(os.getenv("CACHE_TTL_CATEGORIES", "1800"))  # 30 Minuten für schnellere Updates
    
    # Pro Plan Performance Limits
    MAX_CONCURRENT_USERS = int(os.getenv("MAX_CONCURRENT_USERS", "100000"))  # 100k MAU
    MAX_DATABASE_SIZE_GB = int(os.getenv("MAX_DATABASE_SIZE_GB", "8"))  # 8GB Database
    MAX_EGRESS_GB = int(os.getenv("MAX_EGRESS_GB", "250"))  # 250GB Egress
    MAX_FILE_STORAGE_GB = int(os.getenv("MAX_FILE_STORAGE_GB", "100"))  # 100GB File Storage
    CACHE_TTL_CATEGORIES = int(os.getenv("CACHE_TTL_CATEGORIES", "1800"))  # 30 Minuten
    CACHE_TTL_USER_PROFILES = int(os.getenv("CACHE_TTL_USER_PROFILES", "600"))  # 10 Minuten
    CACHE_TTL_SEARCH_RESULTS = int(os.getenv("CACHE_TTL_SEARCH_RESULTS", "180"))  # 3 Minuten
    
    # Elasticsearch Konfiguration für Full-Text Search
    ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    ELASTICSEARCH_USERNAME = os.getenv("ELASTICSEARCH_USERNAME", "")
    ELASTICSEARCH_PASSWORD = os.getenv("ELASTICSEARCH_PASSWORD", "")
    ELASTICSEARCH_INDEX_LISTINGS = os.getenv("ELASTICSEARCH_INDEX_LISTINGS", "kleinanzeigen_listings")
    ELASTICSEARCH_INDEX_USERS = os.getenv("ELASTICSEARCH_INDEX_USERS", "kleinanzeigen_users")
    ELASTICSEARCH_TIMEOUT = int(os.getenv("ELASTICSEARCH_TIMEOUT", "30"))  # 30 Sekunden
    ELASTICSEARCH_MAX_RETRIES = int(os.getenv("ELASTICSEARCH_MAX_RETRIES", "3"))
    
    # Full-Text Search Konfiguration
    ELASTICSEARCH_ENABLED = os.getenv("ELASTICSEARCH_ENABLED", "False").lower() == "true"  # Deaktiviert bis lokale ES-Instanz läuft
    SEARCH_FALLBACK_TO_DB = os.getenv("SEARCH_FALLBACK_TO_DB", "True").lower() == "true"  # Fallback zu DB wenn ES nicht verfügbar
    
    # Rate Limiting Konfiguration - PRODUKTIONS-READY
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true"
    
    # Payment Gateway Konfiguration - MONETARISIERUNG
    # Stripe
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_...")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")
    STRIPE_BASIC_PRICE_ID = os.getenv("STRIPE_BASIC_PRICE_ID", "price_...")
    STRIPE_PREMIUM_PRICE_ID = os.getenv("STRIPE_PREMIUM_PRICE_ID", "price_...")
    STRIPE_PRO_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID", "price_...")
    
    # PayPal
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "...")
    PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "...")
    PAYPAL_SANDBOX = os.getenv("PAYPAL_SANDBOX", "True").lower() == "true"
    PAYPAL_WEBHOOK_ID = os.getenv("PAYPAL_WEBHOOK_ID", "...")
    
    # Payment Settings
    PAYMENT_CURRENCY = os.getenv("PAYMENT_CURRENCY", "EUR")
    PAYMENT_WEBHOOK_TIMEOUT = int(os.getenv("PAYMENT_WEBHOOK_TIMEOUT", "30"))
    PAYMENT_RETRY_ATTEMPTS = int(os.getenv("PAYMENT_RETRY_ATTEMPTS", "3"))
    
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