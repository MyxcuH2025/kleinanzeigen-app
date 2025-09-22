"""
Input Validation & Sanitization für Security Hardening
"""
import re
import html
from typing import Any, Dict, List, Optional
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class SecurityValidator:
    """Zentrale Klasse für Input-Validierung und Sanitization"""
    
    # SQL Injection Patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\b(OR|AND)\s+'.*'\s*=\s*'.*')",
        r"(\b(OR|AND)\s+\".*\"\s*=\s*\".*\")",
        r"(--|#|\/\*|\*\/)",
        r"(\b(UNION|UNION ALL)\b)",
        r"(\b(EXEC|EXECUTE|SP_|XP_)\b)",
        r"(\b(WAITFOR|DELAY|BENCHMARK)\b)",
        r"(\b(LOAD_FILE|INTO OUTFILE|INTO DUMPFILE)\b)",
        r"(\b(CHAR|ASCII|ORD|HEX|UNHEX)\b)",
    ]
    
    # XSS Patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>.*?</embed>",
        r"<link[^>]*>.*?</link>",
        r"<meta[^>]*>.*?</meta>",
        r"<style[^>]*>.*?</style>",
        r"javascript:",
        r"vbscript:",
        r"onload\s*=",
        r"onerror\s*=",
        r"onclick\s*=",
        r"onmouseover\s*=",
        r"onfocus\s*=",
        r"onblur\s*=",
        r"onchange\s*=",
        r"onsubmit\s*=",
        r"onreset\s*=",
        r"onselect\s*=",
        r"onkeydown\s*=",
        r"onkeyup\s*=",
        r"onkeypress\s*=",
    ]
    
    @classmethod
    def validate_string_input(cls, value: str, field_name: str, max_length: int = 1000) -> str:
        """Validiert und sanitized String-Input"""
        if not isinstance(value, str):
            raise HTTPException(status_code=400, detail=f"{field_name} muss ein String sein")
        
        # Länge prüfen
        if len(value) > max_length:
            raise HTTPException(
                status_code=400, 
                detail=f"{field_name} darf maximal {max_length} Zeichen haben"
            )
        
        # SQL Injection prüfen
        if cls._contains_sql_injection(value):
            logger.warning(f"SQL Injection Versuch in {field_name}: {value[:50]}...")
            raise HTTPException(
                status_code=400, 
                detail=f"Ungültige Zeichen in {field_name} erkannt"
            )
        
        # XSS prüfen
        if cls._contains_xss(value):
            logger.warning(f"XSS Versuch in {field_name}: {value[:50]}...")
            raise HTTPException(
                status_code=400, 
                detail=f"Ungültige Zeichen in {field_name} erkannt"
            )
        
        # HTML-Encoding für sichere Ausgabe
        return html.escape(value.strip())
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validiert E-Mail-Adresse"""
        if not email:
            raise HTTPException(status_code=400, detail="E-Mail ist erforderlich")
        
        # Grundlegende E-Mail-Validierung
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise HTTPException(status_code=400, detail="Ungültige E-Mail-Adresse")
        
        # Länge prüfen
        if len(email) > 254:
            raise HTTPException(status_code=400, detail="E-Mail-Adresse zu lang")
        
        return email.lower().strip()
    
    @classmethod
    def validate_password(cls, password: str) -> str:
        """Validiert Passwort-Stärke"""
        if not password:
            raise HTTPException(status_code=400, detail="Passwort ist erforderlich")
        
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Passwort muss mindestens 8 Zeichen haben")
        
        if len(password) > 128:
            raise HTTPException(status_code=400, detail="Passwort zu lang")
        
        # Mindestens ein Großbuchstabe, ein Kleinbuchstabe, eine Zahl
        if not re.search(r'[A-Z]', password):
            raise HTTPException(status_code=400, detail="Passwort muss mindestens einen Großbuchstaben enthalten")
        
        if not re.search(r'[a-z]', password):
            raise HTTPException(status_code=400, detail="Passwort muss mindestens einen Kleinbuchstaben enthalten")
        
        if not re.search(r'\d', password):
            raise HTTPException(status_code=400, detail="Passwort muss mindestens eine Zahl enthalten")
        
        return password
    
    @classmethod
    def validate_json_input(cls, data: Dict[str, Any], field_name: str) -> Dict[str, Any]:
        """Validiert JSON-Input für sichere Verarbeitung"""
        if not isinstance(data, dict):
            raise HTTPException(status_code=400, detail=f"{field_name} muss ein JSON-Objekt sein")
        
        # Rekursive Validierung aller String-Werte
        sanitized_data = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized_data[key] = cls.validate_string_input(value, f"{field_name}.{key}")
            elif isinstance(value, dict):
                sanitized_data[key] = cls.validate_json_input(value, f"{field_name}.{key}")
            elif isinstance(value, list):
                sanitized_data[key] = cls._validate_list(value, f"{field_name}.{key}")
            else:
                sanitized_data[key] = value
        
        return sanitized_data
    
    @classmethod
    def _validate_list(cls, data: List[Any], field_name: str) -> List[Any]:
        """Validiert Liste von Werten"""
        sanitized_list = []
        for i, item in enumerate(data):
            if isinstance(item, str):
                sanitized_list.append(cls.validate_string_input(item, f"{field_name}[{i}]"))
            elif isinstance(item, dict):
                sanitized_list.append(cls.validate_json_input(item, f"{field_name}[{i}]"))
            elif isinstance(item, list):
                sanitized_list.append(cls._validate_list(item, f"{field_name}[{i}]"))
            else:
                sanitized_list.append(item)
        
        return sanitized_list
    
    @classmethod
    def _contains_sql_injection(cls, value: str) -> bool:
        """Prüft auf SQL Injection Patterns"""
        value_upper = value.upper()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def _contains_xss(cls, value: str) -> bool:
        """Prüft auf XSS Patterns"""
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def sanitize_for_database(cls, value: str) -> str:
        """Sanitized String für sichere Datenbankverwendung"""
        # HTML-Encoding entfernen für Datenbank
        sanitized = html.unescape(value)
        
        # Gefährliche Zeichen entfernen
        sanitized = re.sub(r'[<>"\']', '', sanitized)
        
        # Mehrfache Leerzeichen normalisieren
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        
        return sanitized
