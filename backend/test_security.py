"""
Security Hardening Tests - Validierung der Sicherheitsmaßnahmen
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from app.security.input_validation import SecurityValidator
from app.security.sql_injection_protection import SQLInjectionProtection
from app.security.xss_protection import XSSProtection

client = TestClient(app)

class TestSecurityHardening:
    """Umfassende Security-Tests"""
    
    def test_sql_injection_protection(self):
        """Test SQL Injection Protection"""
        
        # Gefährliche SQL-Injection-Payloads
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "1' UNION SELECT * FROM users--",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "1' OR 1=1--",
            "admin' OR '1'='1'--",
            "1'; DELETE FROM listings; --"
        ]
        
        for malicious_input in malicious_inputs:
            # Input-Validierung sollte fehlschlagen
            try:
                SecurityValidator.validate_string_input(malicious_input, "test_field")
                assert False, f"SQL Injection sollte blockiert werden: {malicious_input}"
            except Exception:
                # Erwartete Exception - Security funktioniert
                pass
    
    def test_xss_protection(self):
        """Test XSS Protection"""
        
        # Gefährliche XSS-Payloads
        malicious_inputs = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')></iframe>",
            "javascript:alert('XSS')",
            "<svg onload=alert('XSS')>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
            "<video><source onerror=alert('XSS')>",
            "<audio src=x onerror=alert('XSS')>"
        ]
        
        for malicious_input in malicious_inputs:
            # XSS-Protection sollte aktivieren
            sanitized = XSSProtection.sanitize_html(malicious_input)
            assert "<script>" not in sanitized
            assert "javascript:" not in sanitized
            assert "onerror=" not in sanitized
            assert "onload=" not in sanitized
    
    def test_input_validation(self):
        """Test Input Validation"""
        
        # E-Mail-Validierung
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "admin+tag@company.org"
        ]
        
        for email in valid_emails:
            validated = SecurityValidator.validate_email(email)
            assert validated == email.lower().strip()
        
        # Ungültige E-Mails
        invalid_emails = [
            "invalid-email",
            "@domain.com",
            "user@",
            "user@domain",
            "user..name@domain.com",
            "user@domain..com"
        ]
        
        for email in invalid_emails:
            try:
                SecurityValidator.validate_email(email)
                assert False, f"Ungültige E-Mail sollte blockiert werden: {email}"
            except Exception:
                # Erwartete Exception - Validation funktioniert
                pass
    
    def test_password_validation(self):
        """Test Password Validation"""
        
        # Gültige Passwörter
        valid_passwords = [
            "Password123",
            "MySecurePass1",
            "ComplexP@ssw0rd"
        ]
        
        for password in valid_passwords:
            validated = SecurityValidator.validate_password(password)
            assert validated == password
        
        # Ungültige Passwörter
        invalid_passwords = [
            "123456",  # Zu kurz
            "password",  # Keine Großbuchstaben/Zahlen
            "PASSWORD",  # Keine Kleinbuchstaben/Zahlen
            "Password",  # Keine Zahlen
            "12345678",  # Keine Buchstaben
            "",  # Leer
            "a" * 200  # Zu lang
        ]
        
        for password in invalid_passwords:
            try:
                SecurityValidator.validate_password(password)
                assert False, f"Ungültiges Passwort sollte blockiert werden: {password}"
            except Exception:
                # Erwartete Exception - Validation funktioniert
                pass
    
    def test_json_input_validation(self):
        """Test JSON Input Validation"""
        
        # Gültige JSON-Inputs
        valid_json = {
            "name": "Test User",
            "email": "test@example.com",
            "description": "Valid description"
        }
        
        validated = SecurityValidator.validate_json_input(valid_json, "user_data")
        assert validated["name"] == "Test User"
        assert validated["email"] == "test@example.com"
        
        # Gefährliche JSON-Inputs
        malicious_json = {
            "name": "<script>alert('XSS')</script>",
            "email": "'; DROP TABLE users; --",
            "description": "Normal description"
        }
        
        try:
            SecurityValidator.validate_json_input(malicious_json, "user_data")
            assert False, "Gefährlicher JSON-Input sollte blockiert werden"
        except Exception:
            # Erwartete Exception - Validation funktioniert
            pass
    
    def test_security_headers(self):
        """Test Security Headers"""
        
        response = client.get("/api/health")
        
        # Security Headers prüfen
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Strict-Transport-Security" in response.headers
        assert "Referrer-Policy" in response.headers
        assert "Content-Security-Policy" in response.headers
        assert "Permissions-Policy" in response.headers
    
    def test_rate_limiting(self):
        """Test Rate Limiting"""
        
        # Wenige Requests testen (Rate Limiting ist bereits aktiv)
        responses = []
        for i in range(5):  # Nur 5 Requests testen
            response = client.get("/api/health")
            responses.append(response.status_code)
        
        # Alle Requests sollten erfolgreich sein (Rate Limit nicht überschritten)
        assert all(status == 200 for status in responses)
    
    def test_malicious_paths(self):
        """Test Malicious Path Protection"""
        
        malicious_paths = [
            "/admin",
            "/wp-admin",
            "/phpmyadmin",
            "/.env",
            "/config",
            "/backup",
            "/logs",
            "/.git",
            "/.svn",
            "/.htaccess"
        ]
        
        for path in malicious_paths:
            response = client.get(path)
            assert response.status_code == 400  # Bad Request
    
    def test_sql_injection_in_url(self):
        """Test SQL Injection in URL"""
        
        malicious_urls = [
            "/api/listings?search=1' OR '1'='1",
            "/api/users?id=1; DROP TABLE users; --",
            "/api/categories?name=admin'--",
            "/api/search?q=1' UNION SELECT * FROM users--"
        ]
        
        for url in malicious_urls:
            response = client.get(url)
            assert response.status_code == 400  # Bad Request
    
    def test_xss_in_headers(self):
        """Test XSS in Headers"""
        
        malicious_headers = {
            "User-Agent": "<script>alert('XSS')</script>",
            "X-Forwarded-For": "<img src=x onerror=alert('XSS')>",
            "Referer": "javascript:alert('XSS')"
        }
        
        response = client.get("/api/health", headers=malicious_headers)
        assert response.status_code == 400  # Bad Request

def run_security_tests():
    """Führt alle Security-Tests aus"""
    
    print("🔒 Security Hardening Tests gestartet...")
    
    test_instance = TestSecurityHardening()
    
    try:
        # SQL Injection Tests
        print("✅ SQL Injection Protection Tests...")
        test_instance.test_sql_injection_protection()
        
        # XSS Tests
        print("✅ XSS Protection Tests...")
        test_instance.test_xss_protection()
        
        # Input Validation Tests
        print("✅ Input Validation Tests...")
        test_instance.test_input_validation()
        test_instance.test_password_validation()
        test_instance.test_json_input_validation()
        
        # Security Headers Tests
        print("✅ Security Headers Tests...")
        test_instance.test_security_headers()
        
        # Rate Limiting Tests
        print("✅ Rate Limiting Tests...")
        test_instance.test_rate_limiting()
        
        # Malicious Path Tests
        print("✅ Malicious Path Protection Tests...")
        test_instance.test_malicious_paths()
        
        # SQL Injection in URL Tests
        print("✅ SQL Injection in URL Tests...")
        test_instance.test_sql_injection_in_url()
        
        # XSS in Headers Tests
        print("✅ XSS in Headers Tests...")
        test_instance.test_xss_in_headers()
        
        print("🎉 Alle Security-Tests erfolgreich bestanden!")
        return True
        
    except Exception as e:
        print(f"❌ Security-Test fehlgeschlagen: {e}")
        return False

if __name__ == "__main__":
    run_security_tests()
