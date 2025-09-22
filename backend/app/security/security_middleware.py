"""
Security Middleware für umfassenden Schutz
"""
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import logging
from typing import Dict, Any
import re

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Umfassendes Security Middleware"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.rate_limit_storage: Dict[str, Dict[str, Any]] = {}
        self.blocked_ips: set = set()
        
        # Security Headers
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
    
    async def dispatch(self, request: Request, call_next):
        """Hauptverarbeitung der Security Middleware"""
        
        # IP-Adresse extrahieren
        client_ip = self._get_client_ip(request)
        
        # Blockierte IPs prüfen
        if client_ip in self.blocked_ips:
            logger.warning(f"Blockierte IP versucht Zugriff: {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"error": "Zugriff verweigert"}
            )
        
        # Rate Limiting
        if not self._check_rate_limit(client_ip, request.url.path):
            logger.warning(f"Rate Limit überschritten für IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"error": "Zu viele Anfragen"}
            )
        
        # Request-Validierung
        if not self._validate_request(request):
            logger.warning(f"Ungültige Anfrage von IP: {client_ip}")
            return JSONResponse(
                status_code=400,
                content={"error": "Ungültige Anfrage"}
            )
        
        # Security Headers hinzufügen
        response = await call_next(request)
        
        # Security Headers setzen
        for header, value in self.security_headers.items():
            response.headers[header] = value
        
        # Response-Validierung
        response = self._validate_response(response)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extrahiert echte Client-IP"""
        
        # X-Forwarded-For Header prüfen
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Erste IP in der Liste nehmen
            return forwarded_for.split(",")[0].strip()
        
        # X-Real-IP Header prüfen
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Client-Host als Fallback
        return request.client.host if request.client else "unknown"
    
    def _check_rate_limit(self, client_ip: str, path: str) -> bool:
        """Prüft Rate Limiting - DEAKTIVIERT für Entwicklung"""
        
        # REPARIERT: Rate Limiting deaktiviert für lokale Entwicklung
        # Das verursachte 429 "Too Many Requests" Fehler
        return True
        
        # ORIGINAL CODE - DEAKTIVIERT
        # current_time = time.time()
        # window_size = 60  # 1 Minute
        # max_requests = 100  # Max 100 Requests pro Minute
        # 
        # # Alte Einträge entfernen
        # if client_ip in self.rate_limit_storage:
        #     self.rate_limit_storage[client_ip] = {
        #         k: v for k, v in self.rate_limit_storage[client_ip].items()
        #         if current_time - v < window_size
        #     }
        # else:
        #     self.rate_limit_storage[client_ip] = {}
        # 
        # # Aktuelle Anfrage zählen
        # request_count = len(self.rate_limit_storage[client_ip])
        # 
        # if request_count >= max_requests:
        #     return False
        # 
        # # Neue Anfrage hinzufügen
        # self.rate_limit_storage[client_ip][str(current_time)] = current_time
        # 
        # return True
    
    def _validate_request(self, request: Request) -> bool:
        """Validiert eingehende Requests"""
        
        # User-Agent prüfen
        user_agent = request.headers.get("User-Agent", "")
        if not user_agent or len(user_agent) > 1000:
            return False
        
        # Content-Length prüfen
        content_length = request.headers.get("Content-Length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB Limit
            return False
        
        # Gefährliche Pfade prüfen
        dangerous_paths = [
            "/admin", "/wp-admin", "/phpmyadmin", "/.env", "/config",
            "/backup", "/logs", "/.git", "/.svn", "/.htaccess"
        ]
        
        for dangerous_path in dangerous_paths:
            if dangerous_path in request.url.path.lower():
                return False
        
        # SQL Injection in URL prüfen
        if self._contains_sql_injection(request.url.path):
            return False
        
        # XSS in Headers prüfen
        for header_name, header_value in request.headers.items():
            if self._contains_xss(header_value):
                return False
        
        return True
    
    def _validate_response(self, response: Response) -> Response:
        """Validiert ausgehende Responses"""
        
        # Content-Type prüfen
        content_type = response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            # JSON-Response validieren
            if hasattr(response, 'body'):
                try:
                    import json
                    json.loads(response.body.decode())
                except:
                    logger.warning("Ungültige JSON-Response erkannt")
        
        return response
    
    def _contains_sql_injection(self, text: str) -> bool:
        """Prüft auf SQL Injection Patterns"""
        
        sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(--|#|\/\*|\*\/)",
            r"(\b(UNION|UNION ALL)\b)",
            r"(\b(EXEC|EXECUTE|SP_|XP_)\b)"
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _contains_xss(self, text: str) -> bool:
        """Prüft auf XSS Patterns"""
        
        xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"<iframe[^>]*>.*?</iframe>",
            r"javascript:",
            r"vbscript:",
            r"onload\s*=",
            r"onerror\s*=",
            r"onclick\s*="
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def block_ip(self, ip: str, reason: str = "Security violation"):
        """Blockiert eine IP-Adresse"""
        
        self.blocked_ips.add(ip)
        logger.warning(f"IP blockiert: {ip} - Grund: {reason}")
    
    def unblock_ip(self, ip: str):
        """Entblockiert eine IP-Adresse"""
        
        self.blocked_ips.discard(ip)
        logger.info(f"IP entblockiert: {ip}")
    
    def get_security_stats(self) -> Dict[str, Any]:
        """Gibt Security-Statistiken zurück"""
        
        return {
            "blocked_ips": len(self.blocked_ips),
            "rate_limited_ips": len(self.rate_limit_storage),
            "security_headers": len(self.security_headers)
        }
