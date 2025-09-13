"""
Rate Limiting Middleware für FastAPI
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import logging
from .rate_limit_service import rate_limit_service

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware für API Rate Limiting"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.service = rate_limit_service
        
    async def dispatch(self, request: Request, call_next):
        """Verarbeite Request mit Rate Limiting"""
        
        # Skip Rate Limiting für bestimmte Pfade
        skip_paths = [
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/health",
            "/performance/health"
        ]
        
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)
        
        # Bestimme Client-ID
        client_id = self._get_client_id(request)
        
        # Bestimme Endpoint-Typ für Rate Limiting
        endpoint_type = self._get_endpoint_type(request.url.path)
        
        # Prüfe Rate Limit
        try:
            rate_limit_result = self.service.check_rate_limit(
                client_id=client_id,
                endpoint=endpoint_type
            )
            
            if not rate_limit_result["allowed"]:
                # Rate Limit überschritten
                logger.warning(f"Rate limit exceeded für Client {client_id}: {rate_limit_result['reason']}")
                
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": rate_limit_result["reason"],
                        "limit": rate_limit_result["limit"],
                        "remaining": rate_limit_result["remaining"],
                        "reset_time": rate_limit_result["reset_time"],
                        "retry_after": rate_limit_result["reset_time"] - int(time.time())
                    },
                    headers={
                        "X-RateLimit-Limit": str(rate_limit_result["limit"]),
                        "X-RateLimit-Remaining": str(rate_limit_result["remaining"]),
                        "X-RateLimit-Reset": str(rate_limit_result["reset_time"]),
                        "Retry-After": str(rate_limit_result["reset_time"] - int(time.time()))
                    }
                )
            
            # Request erlaubt - füge Rate Limit Headers hinzu
            response = await call_next(request)
            
            # Füge Rate Limit Headers zur Response hinzu
            response.headers["X-RateLimit-Limit"] = str(rate_limit_result["limit"])
            response.headers["X-RateLimit-Remaining"] = str(rate_limit_result["remaining"])
            response.headers["X-RateLimit-Reset"] = str(rate_limit_result["reset_time"])
            
            if "current_count" in rate_limit_result:
                response.headers["X-RateLimit-Current"] = str(rate_limit_result["current_count"])
            
            return response
            
        except Exception as e:
            logger.error(f"Fehler im Rate Limiting Middleware: {e}")
            # Bei Fehlern erlaube Request (Fail-Safe)
            return await call_next(request)
    
    def _get_client_id(self, request: Request) -> str:
        """Extrahiere Client-ID aus Request"""
        # Versuche verschiedene Methoden zur Client-Identifikation
        
        # 1. X-Forwarded-For Header (für Load Balancer/Proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Nehme erste IP aus der Liste
            client_ip = forwarded_for.split(",")[0].strip()
            return f"ip:{client_ip}"
        
        # 2. X-Real-IP Header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return f"ip:{real_ip}"
        
        # 3. Client IP direkt
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"
    
    def _get_endpoint_type(self, path: str) -> str:
        """Bestimme Endpoint-Typ für Rate Limiting"""
        
        # Search-Endpoints bekommen strengere Limits
        if "/search" in path or "/api/search" in path:
            return "search"
        
        # Auth-Endpoints
        if "/auth" in path or "/login" in path or "/register" in path:
            return "auth"
        
        # Upload-Endpoints
        if "/upload" in path:
            return "upload"
        
        # Standard für alle anderen
        return "general"
