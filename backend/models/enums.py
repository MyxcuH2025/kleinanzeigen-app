"""
Enums for the Kleinanzeigen API
"""
from enum import Enum

class ListingStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SOLD = "sold"

class UserRole(str, Enum):
    USER = "USER"
    SELLER = "SELLER"  # NEU: Verkäufer-Rolle
    ADMIN = "ADMIN"

class VerificationState(str, Enum):
    UNVERIFIED = "unverified"           # Registriert, aber E-Mail nicht bestätigt
    EMAIL_VERIFIED = "email_verified"   # E-Mail bestätigt, Basisfeatures erlaubt
    SELLER_PENDING = "seller_pending"   # Verifizierungsantrag gestellt, Prüfung läuft
    SELLER_VERIFIED = "seller_verified" # Geprüft und akzeptiert → bekommt Badge
    SELLER_REVOKED = "seller_revoked"   # Verifizierung entzogen (Dokument abgelaufen oder Verstoß)
    BANNED = "banned"                   # Gesperrt

class NotificationType(str, Enum):
    NEW_LISTING = "new_listing"           # Neue Anzeige von gefolgtem Account
    FOLLOW = "follow"                     # Jemand folgt dir
    LISTING_VIEW = "listing_view"         # Deine Anzeige wurde angeschaut
    LISTING_FAVORITE = "listing_favorite" # Jemand hat deine Anzeige favorisiert
    MESSAGE = "message"                   # Neue Nachricht
    SYSTEM = "system"                     # System-Benachrichtigung
    LISTING_SOLD = "listing_sold"         # Anzeige verkauft
    LISTING_EXPIRED = "listing_expired"   # Anzeige abgelaufen
    LISTING_REPORTED = "listing_reported" # Anzeige gemeldet
    USER_VERIFIED = "user_verified"       # User verifiziert
    PAYMENT_RECEIVED = "payment_received" # Zahlung erhalten
    REVIEW_RECEIVED = "review_received"   # Bewertung erhalten
    OFFER_RECEIVED = "offer_received"     # Angebot erhalten
    OFFER_ACCEPTED = "offer_accepted"     # Angebot angenommen
    OFFER_DECLINED = "offer_declined"     # Angebot abgelehnt
