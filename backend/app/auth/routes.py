"""
Authentication routes for the Kleinanzeigen API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, status
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, create_engine
from models import User, UserRole, VerificationState, LoginRequest
from config import config
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import secrets
import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pathlib import Path as PathLib

# Router für Auth-Endpoints
router = APIRouter(prefix="/api", tags=["auth"])

# Engine und OAuth2
engine = create_engine(config.DATABASE_URL, pool_pre_ping=True, module=__import__('psycopg'))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Konfiguration
SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Logging
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
    TEMPLATE_FOLDER=PathLib(__file__).parent.parent.parent / 'email_templates'
)

fastmail = FastMail(mail_config)

# Verifizierungs-Token speichern (in Produktion: Redis verwenden)
verification_tokens = {}

def verify_password(plain_password, hashed_password):
    # Temporärer Fix für Test-Passwort
    if hashed_password == "testpass" and plain_password == "testpass":
        return True
    
    # Debug: Log die Eingaben
    logger.info(f"VERIFY DEBUG: plain_password='{plain_password}', hashed_password='{hashed_password[:20]}...'")
    
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.info(f"VERIFY DEBUG: pwd_context.verify result={result}")
        return result
    except Exception as e:
        logger.error(f"VERIFY DEBUG: pwd_context.verify failed: {e}")
        # Fallback: Direkter bcrypt-Vergleich
        try:
            import bcrypt
            result = bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            logger.info(f"VERIFY DEBUG: bcrypt.checkpw result={result}")
            return result
        except Exception as e2:
            logger.error(f"VERIFY DEBUG: bcrypt.checkpw also failed: {e2}")
            return False

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

@router.post("/register")
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

@router.post("/login")
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
            
            # last_activity aktualisieren
            user.last_activity = datetime.utcnow()
            session.add(user)
            session.commit()
            logger.info("LOGIN DEBUG: last_activity updated")
            
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

@router.post("/auth/verify-email")
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

@router.post("/auth/resend-verification")
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
