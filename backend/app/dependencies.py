"""
Shared dependencies for all modules
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, create_engine, text
from models import User
from config import config
from jose import jwt, JWTError
from typing import Optional
import logging

# Engine und OAuth2 - PRODUKTIONS-READY CONFIG
# Engine hier definieren um Circular Import zu vermeiden
engine = create_engine(
    config.DATABASE_URL,
    pool_size=config.POOL_SIZE,  # 20 Verbindungen
    max_overflow=config.MAX_OVERFLOW,  # 30 zusätzliche Verbindungen
    pool_timeout=config.POOL_TIMEOUT,  # 30 Sekunden Timeout
    pool_recycle=config.POOL_RECYCLE,  # 1 Stunde
    pool_pre_ping=config.POOL_PRE_PING,  # Verbindungen testen
    echo=False,  # Performance-Optimierung: Kein SQL-Logging
    # Performance-Optimierungen
    connect_args={
        "options": "-c default_transaction_isolation=read_committed"
    } if "postgresql" in config.DATABASE_URL else {}
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

# JWT Konfiguration
SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Logging
logger = logging.getLogger(__name__)

def get_session():
    """Database session dependency - PostgreSQL optimiert"""
    with Session(engine) as session:
        # PostgreSQL: Keine PRAGMA-Befehle nötig - echte Concurrent Sessions
        yield session

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user"""
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
    if not credentials:
        return None
    
    try:
        # Handle both HTTPAuthorizationCredentials object and string
        token = credentials.credentials if hasattr(credentials, 'credentials') else credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        return user
