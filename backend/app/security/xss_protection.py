"""
XSS Protection für sichere Frontend-Ausgabe
"""
import html
import re
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class XSSProtection:
    """Schutz vor Cross-Site Scripting (XSS)"""
    
    # Gefährliche HTML-Tags
    DANGEROUS_TAGS = [
        'script', 'iframe', 'object', 'embed', 'link', 'meta', 'style',
        'form', 'input', 'button', 'select', 'textarea', 'option'
    ]
    
    # Gefährliche Attribute
    DANGEROUS_ATTRIBUTES = [
        'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup',
        'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
        'onmouseover', 'onmouseenter', 'onmouseleave', 'oncontextmenu',
        'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onload',
        'onmessage', 'onoffline', 'ononline', 'onpagehide', 'onpageshow',
        'onpopstate', 'onresize', 'onstorage', 'onunload'
    ]
    
    # Gefährliche Protokolle
    DANGEROUS_PROTOCOLS = [
        'javascript:', 'vbscript:', 'data:', 'file:', 'ftp:', 'gopher:',
        'jar:', 'mailto:', 'news:', 'nntp:', 'tel:', 'telnet:', 'ldap:'
    ]
    
    @classmethod
    def sanitize_html(cls, content: str, allowed_tags: List[str] = None) -> str:
        """Sanitized HTML-Content für sichere Ausgabe"""
        
        if not content:
            return ""
        
        # Standard erlaubte Tags
        if allowed_tags is None:
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li']
        
        # Gefährliche Tags entfernen
        for tag in cls.DANGEROUS_TAGS:
            if tag not in allowed_tags:
                # Öffnende und schließende Tags entfernen
                content = re.sub(f'<{tag}[^>]*>', '', content, flags=re.IGNORECASE)
                content = re.sub(f'</{tag}>', '', content, flags=re.IGNORECASE)
        
        # Gefährliche Attribute entfernen
        for attr in cls.DANGEROUS_ATTRIBUTES:
            content = re.sub(f'{attr}\\s*=\\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
            content = re.sub(f'{attr}\\s*=\\s*[^\\s>]+', '', content, flags=re.IGNORECASE)
        
        # Gefährliche Protokolle entfernen
        for protocol in cls.DANGEROUS_PROTOCOLS:
            content = re.sub(f'{protocol}[^\\s]*', '', content, flags=re.IGNORECASE)
        
        return content.strip()
    
    @classmethod
    def escape_html(cls, content: str) -> str:
        """Escaped HTML-Content für sichere Ausgabe"""
        
        if not content:
            return ""
        
        # HTML-Entities escapen
        escaped = html.escape(content, quote=True)
        
        return escaped
    
    @classmethod
    def sanitize_json_output(cls, data: Any) -> Any:
        """Sanitized JSON-Output für sichere Frontend-Übertragung"""
        
        if isinstance(data, str):
            return cls.escape_html(data)
        
        elif isinstance(data, dict):
            sanitized_dict = {}
            for key, value in data.items():
                # Key sanitization
                sanitized_key = cls.escape_html(str(key))
                # Value sanitization
                sanitized_value = cls.sanitize_json_output(value)
                sanitized_dict[sanitized_key] = sanitized_value
            return sanitized_dict
        
        elif isinstance(data, list):
            return [cls.sanitize_json_output(item) for item in data]
        
        elif isinstance(data, (int, float, bool, type(None))):
            return data
        
        else:
            # Fallback für andere Typen
            return cls.escape_html(str(data))
    
    @classmethod
    def validate_url(cls, url: str) -> str:
        """Validiert und sanitized URLs"""
        
        if not url:
            return ""
        
        # Grundlegende URL-Validierung
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(url_pattern, url):
            raise ValueError("Ungültige URL")
        
        # Gefährliche Protokolle prüfen
        for protocol in cls.DANGEROUS_PROTOCOLS:
            if url.lower().startswith(protocol):
                raise ValueError(f"Gefährliches Protokoll nicht erlaubt: {protocol}")
        
        return url.strip()
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitized Dateinamen für sichere Uploads"""
        
        if not filename:
            return "unnamed"
        
        # Gefährliche Zeichen entfernen
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Mehrfache Punkte entfernen
        filename = re.sub(r'\.{2,}', '.', filename)
        
        # Länge begrenzen
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:255-len(ext)-1] + ('.' + ext if ext else '')
        
        return filename.strip()
    
    @classmethod
    def sanitize_search_query(cls, query: str) -> str:
        """Sanitized Suchanfragen für sichere Suche"""
        
        if not query:
            return ""
        
        # Gefährliche Zeichen entfernen
        query = re.sub(r'[<>"\']', '', query)
        
        # Mehrfache Leerzeichen normalisieren
        query = re.sub(r'\s+', ' ', query).strip()
        
        # Länge begrenzen
        if len(query) > 1000:
            query = query[:1000]
        
        return query
    
    @classmethod
    def create_safe_response(cls, data: Any, message: str = "") -> Dict[str, Any]:
        """Erstellt sichere API-Response ohne XSS-Risiken"""
        
        response = {
            "success": True,
            "data": cls.sanitize_json_output(data),
            "message": cls.escape_html(message) if message else ""
        }
        
        return response
    
    @classmethod
    def create_error_response(cls, error: str, status_code: int = 400) -> Dict[str, Any]:
        """Erstellt sichere Error-Response ohne XSS-Risiken"""
        
        response = {
            "success": False,
            "error": cls.escape_html(error),
            "status_code": status_code
        }
        
        return response
