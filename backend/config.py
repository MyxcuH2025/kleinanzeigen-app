import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Datenbank
    # Verwende relativen Pfad zur Backend-Datenbank
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
    
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
    
    # CORS
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000",
        "*"  # Für Entwicklung: Alle Origins erlauben
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