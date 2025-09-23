"""
Unit-Tests für Authentifizierung
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from unittest.mock import patch

from app.auth.routes import create_access_token
from models import User

class TestAuthService:
    """Tests für Authentifizierungs-Service"""
    
    def test_create_access_token(self):
        """Test Token-Erstellung"""
        token = create_access_token(data={"sub": "test@example.com"})
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_token_creation_and_structure(self):
        """Test Token-Erstellung und Struktur"""
        token = create_access_token(data={"sub": "test@example.com"})
        
        # Token sollte ein String sein
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Token sollte JWT-Format haben (3 Teile getrennt durch Punkte)
        parts = token.split('.')
        assert len(parts) == 3

class TestAuthEndpoints:
    """Tests für Authentifizierungs-Endpoints"""
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test erfolgreicher Login"""
        login_data = {
            "email": test_user.email,
            "password": "test_password"
        }
        
        # Mock password verification
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client: TestClient):
        """Test Login mit ungültigen Anmeldedaten"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrong_password"
        }
        
        response = client.post("/api/login", json=login_data)
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
    
    def test_login_inactive_user(self, client: TestClient, test_session: Session):
        """Test Login mit inaktivem User"""
        # Inaktiven User erstellen
        inactive_user = User(
            email="inactive@example.com",
            hashed_password="$2b$12$test",
            is_active=False,
            is_verified=True,
            role="user"
        )
        test_session.add(inactive_user)
        test_session.commit()
        
        login_data = {
            "email": inactive_user.email,
            "password": "test_password"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            assert response.status_code == 400
            assert "Inactive user" in response.json()["detail"]
    
    def test_register_success(self, client: TestClient):
        """Test erfolgreiche Registrierung"""
        register_data = {
            "email": "newuser@example.com",
            "password": "new_password",
            "first_name": "New",
            "last_name": "User"
        }
        
        with patch('app.auth.routes.send_verification_email'):
            response = client.post("/api/register", json=register_data)
            
            assert response.status_code == 201
            data = response.json()
            assert "message" in data
            assert "newuser@example.com" in data["message"]
    
    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test Registrierung mit bereits existierender E-Mail"""
        register_data = {
            "email": test_user.email,
            "password": "new_password",
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/api/register", json=register_data)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client: TestClient):
        """Test Registrierung mit ungültiger E-Mail"""
        register_data = {
            "email": "invalid_email",
            "password": "new_password",
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/api/register", json=register_data)
        assert response.status_code == 422  # Validation error
    
    def test_get_current_user_success(self, client: TestClient, auth_headers: dict, test_user: User):
        """Test erfolgreiches Abrufen des aktuellen Users"""
        response = client.get("/api/users/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["id"] == test_user.id
    
    def test_get_current_user_unauthorized(self, client: TestClient):
        """Test Abrufen des aktuellen Users ohne Authentifizierung"""
        response = client.get("/api/users/me")
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test Abrufen des aktuellen Users mit ungültigem Token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 401

class TestPasswordSecurity:
    """Tests für Passwort-Sicherheit"""
    
    def test_password_hashing(self):
        """Test Passwort-Hashing"""
        from app.auth.routes import hash_password
        
        password = "test_password"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")  # bcrypt format
    
    def test_password_verification(self):
        """Test Passwort-Verifikation"""
        from app.auth.routes import hash_password, verify_password
        
        password = "test_password"
        hashed = hash_password(password)
        
        # Korrektes Passwort
        assert verify_password(password, hashed) == True
        
        # Falsches Passwort
        assert verify_password("wrong_password", hashed) == False
    
    def test_password_requirements(self, client: TestClient):
        """Test Passwort-Anforderungen"""
        # Zu kurzes Passwort
        register_data = {
            "email": "test@example.com",
            "password": "123",  # Zu kurz
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = client.post("/api/register", json=register_data)
        assert response.status_code == 422  # Validation error
