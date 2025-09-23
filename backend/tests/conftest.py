"""
Pytest-Konfiguration und Fixtures für Tests
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
import tempfile
import os
from typing import Generator

from main import app
from config import config
from models import User, Listing, Category
from app.dependencies import get_session, get_current_user
from app.auth.routes import create_access_token

# Test-Datenbank erstellen
@pytest.fixture(scope="session")
def test_engine():
    """Test-Datenbank-Engine"""
    # Temporäre SQLite-Datenbank für Tests
    tmp_db = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    tmp_db.close()
    
    engine = create_engine(
        f"sqlite:///{tmp_db.name}",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Tabellen erstellen
    SQLModel.metadata.create_all(engine)
    
    yield engine
    
    # Cleanup
    os.unlink(tmp_db.name)

@pytest.fixture
def test_session(test_engine):
    """Test-Datenbank-Session"""
    with Session(test_engine) as session:
        yield session

@pytest.fixture
def client(test_engine, test_session):
    """FastAPI Test-Client"""
    
    def get_test_session():
        yield test_session
    
    # Dependency überschreiben
    app.dependency_overrides[get_session] = get_test_session
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Cleanup
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(test_session):
    """Test-User erstellen"""
    user = User(
        email="test@example.com",
        hashed_password="$2b$12$test",  # Fake hash für Tests
        is_active=True,
        is_verified=True,
        role="user",
        first_name="Test",
        last_name="User",
        display_name="Test User"
    )
    
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    
    return user

@pytest.fixture
def test_admin_user(test_session):
    """Test-Admin-User erstellen"""
    admin = User(
        email="admin@example.com",
        hashed_password="$2b$12$test",
        is_active=True,
        is_verified=True,
        role="admin",
        first_name="Admin",
        last_name="User",
        display_name="Admin User"
    )
    
    test_session.add(admin)
    test_session.commit()
    test_session.refresh(admin)
    
    return admin

@pytest.fixture
def auth_headers(test_user):
    """Authentifizierungs-Headers für Test-User"""
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(test_admin_user):
    """Authentifizierungs-Headers für Admin-User"""
    token = create_access_token(data={"sub": test_admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_listing(test_session, test_user):
    """Test-Listing erstellen"""
    listing = Listing(
        title="Test Listing",
        description="Test Description",
        category="kleinanzeigen",
        condition="neu",
        location='{"city": "Berlin", "postal_code": "10115"}',
        price=100.0,
        attributes='{"brand": "Test Brand"}',
        images='[]',
        status="ACTIVE",
        user_id=test_user.id
    )
    
    test_session.add(listing)
    test_session.commit()
    test_session.refresh(listing)
    
    return listing

@pytest.fixture
def test_category(test_session):
    """Test-Kategorie erstellen"""
    category = Category(
        name="Test Category",
        value="test_category",
        parent_id=None,
        form_fields='{"fields": []}'
    )
    
    test_session.add(category)
    test_session.commit()
    test_session.refresh(category)
    
    return category

# Async-Test-Support
@pytest.fixture(scope="session")
def event_loop():
    """Event Loop für Async-Tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Performance-Test-Fixtures
@pytest.fixture
def performance_metrics():
    """Performance-Metriken-Sammlung"""
    return {
        "response_times": [],
        "memory_usage": [],
        "cpu_usage": []
    }

# Mock-Fixtures für externe Services
@pytest.fixture
def mock_redis():
    """Mock Redis für Tests"""
    class MockRedis:
        def __init__(self):
            self.data = {}
        
        def get(self, key):
            return self.data.get(key)
        
        def set(self, key, value, ex=None):
            self.data[key] = value
            return True
        
        def delete(self, key):
            if key in self.data:
                del self.data[key]
                return 1
            return 0
        
        def ping(self):
            return True
    
    return MockRedis()

@pytest.fixture
def mock_elasticsearch():
    """Mock Elasticsearch für Tests"""
    class MockElasticsearch:
        def __init__(self):
            self.indices = {}
            self.is_available = False
        
        def ping(self):
            return True
        
        def search(self, index, body):
            return {
                "hits": {
                    "total": {"value": 0},
                    "hits": []
                },
                "took": 1
            }
    
    return MockElasticsearch()
