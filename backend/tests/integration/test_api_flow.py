"""
Integration-Tests für komplette API-Flows
"""
import pytest
import time
from fastapi.testclient import TestClient
from sqlmodel import Session

class TestCompleteUserFlow:
    """Tests für kompletten User-Workflow"""
    
    def test_user_registration_to_listing_creation(self, client: TestClient, test_session: Session):
        """Test kompletter Flow: Registrierung → Login → Listing erstellen"""
        
        # 1. User registrieren
        register_data = {
            "email": "newuser@example.com",
            "password": "new_password123",
            "first_name": "New",
            "last_name": "User"
        }
        
        with patch('app.auth.routes.send_verification_email'):
            response = client.post("/api/register", json=register_data)
            assert response.status_code == 201
        
        # 2. User login
        login_data = {
            "email": "newuser@example.com",
            "password": "new_password123"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            assert response.status_code == 200
            
            token_data = response.json()
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
        
        # 3. User-Profil abrufen
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 200
        
        user_data = response.json()
        user_id = user_data["id"]
        
        # 4. Listing erstellen
        listing_data = {
            "title": "Integration Test Listing",
            "description": "Created during integration test",
            "category": "kleinanzeigen",
            "condition": "neu",
            "location": {"city": "Berlin", "postal_code": "10115"},
            "price": 250.0,
            "attributes": {"brand": "Test Brand"}
        }
        
        response = client.post("/api/listings", json=listing_data, headers=headers)
        assert response.status_code == 201
        
        listing_response = response.json()
        listing_id = listing_response["id"]
        
        # 5. Listing abrufen
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 200
        
        listing_data = response.json()
        assert listing_data["title"] == "Integration Test Listing"
        assert listing_data["user_id"] == user_id
        
        # 6. Listing aktualisieren
        update_data = {"title": "Updated Integration Test Listing"}
        response = client.put(f"/api/listings/{listing_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        
        # 7. Verifikation der Aktualisierung
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 200
        
        updated_listing = response.json()
        assert updated_listing["title"] == "Updated Integration Test Listing"
        
        # 8. Listing löschen
        response = client.delete(f"/api/listings/{listing_id}", headers=headers)
        assert response.status_code == 200
        
        # 9. Verifikation der Löschung
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 404

class TestSearchFlow:
    """Tests für Such-Workflow"""
    
    def test_search_with_filters(self, client: TestClient, test_session: Session, test_user: User):
        """Test Suche mit verschiedenen Filtern"""
        
        # Test-Listings erstellen
        listings_data = [
            {
                "title": "iPhone 12",
                "description": "Gebrauchtes iPhone in gutem Zustand",
                "category": "kleinanzeigen",
                "price": 500.0,
                "location": '{"city": "Berlin"}',
                "user_id": test_user.id
            },
            {
                "title": "Samsung Galaxy",
                "description": "Neues Samsung Galaxy Smartphone",
                "category": "kleinanzeigen", 
                "price": 600.0,
                "location": '{"city": "München"}',
                "user_id": test_user.id
            },
            {
                "title": "MacBook Pro",
                "description": "MacBook Pro für Studenten",
                "category": "kleinanzeigen",
                "price": 1200.0,
                "location": '{"city": "Berlin"}',
                "user_id": test_user.id
            }
        ]
        
        created_listings = []
        for data in listings_data:
            listing = Listing(**data, status=ListingStatus.ACTIVE)
            test_session.add(listing)
            test_session.commit()
            test_session.refresh(listing)
            created_listings.append(listing)
        
        # 1. Allgemeine Suche
        response = client.get("/api/search?q=iPhone")
        assert response.status_code == 200
        
        search_results = response.json()
        assert len(search_results["results"]) >= 1
        
        # 2. Suche mit Preis-Filter
        response = client.get("/api/search?price_min=400&price_max=700")
        assert response.status_code == 200
        
        price_filtered = response.json()
        for listing in price_filtered["results"]:
            assert 400 <= listing["price"] <= 700
        
        # 3. Suche mit Standort-Filter
        response = client.get("/api/search?location=Berlin")
        assert response.status_code == 200
        
        location_filtered = response.json()
        for listing in location_filtered["results"]:
            assert "Berlin" in listing["location"]
        
        # 4. Kombinierte Suche
        response = client.get("/api/search?q=Smartphone&price_max=600&location=Berlin")
        assert response.status_code == 200
        
        combined_results = response.json()
        # Sollte nur relevante Ergebnisse zurückgeben
        
        # Cleanup
        for listing in created_listings:
            test_session.delete(listing)
        test_session.commit()

class TestAuthenticationFlow:
    """Tests für Authentifizierungs-Workflow"""
    
    def test_token_expiration_flow(self, client: TestClient, test_user: User):
        """Test Token-Ablauf und Refresh"""
        
        # 1. Login
        login_data = {
            "email": test_user.email,
            "password": "test_password"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            assert response.status_code == 200
            
            token_data = response.json()
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Authentifizierte Anfrage
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 200
        
        # 3. Token mit abgelaufener Zeit simulieren
        with patch('app.auth.routes.verify_token') as mock_verify:
            mock_verify.side_effect = Exception("Token expired")
            
            response = client.get("/api/users/me", headers=headers)
            assert response.status_code == 401
        
        # 4. Neuer Login nach Token-Ablauf
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            assert response.status_code == 200
            
            new_token_data = response.json()
            new_token = new_token_data["access_token"]
            new_headers = {"Authorization": f"Bearer {new_token}"}
        
        # 5. Mit neuem Token authentifizierte Anfrage
        response = client.get("/api/users/me", headers=new_headers)
        assert response.status_code == 200

class TestPerformanceFlow:
    """Tests für Performance-Workflows"""
    
    def test_caching_performance(self, client: TestClient, test_session: Session, test_user: User):
        """Test Cache-Performance"""
        
        # Mehrere Listings erstellen für Cache-Test
        for i in range(10):
            listing = Listing(
                title=f"Performance Test Listing {i}",
                description=f"Description {i}",
                category="kleinanzeigen",
                price=100.0 + i,
                status=ListingStatus.ACTIVE,
                user_id=test_user.id
            )
            test_session.add(listing)
        test_session.commit()
        
        # Erster Aufruf - sollte Cache MISS sein
        start_time = time.time()
        response = client.get("/api/listings?limit=10")
        first_call_time = time.time() - start_time
        
        assert response.status_code == 200
        assert first_call_time > 0
        
        # Zweiter Aufruf - sollte Cache HIT sein (falls Redis aktiv)
        start_time = time.time()
        response = client.get("/api/listings?limit=10")
        second_call_time = time.time() - start_time
        
        assert response.status_code == 200
        
        # Cache sollte Performance verbessern (falls aktiv)
        # In Test-Umgebung ohne Redis wird das nicht der Fall sein
        print(f"First call: {first_call_time:.3f}s, Second call: {second_call_time:.3f}s")
    
    def test_concurrent_requests(self, client: TestClient, test_listing: Listing):
        """Test gleichzeitige Anfragen"""
        import threading
        import concurrent.futures
        
        results = []
        
        def make_request():
            response = client.get(f"/api/listings/{test_listing.id}")
            results.append(response.status_code)
        
        # 10 gleichzeitige Anfragen
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            concurrent.futures.wait(futures)
        
        # Alle Anfragen sollten erfolgreich sein
        assert len(results) == 10
        assert all(status == 200 for status in results)

class TestErrorHandlingFlow:
    """Tests für Fehlerbehandlung-Workflows"""
    
    def test_graceful_degradation(self, client: TestClient):
        """Test graceful degradation bei Fehlern"""
        
        # 1. Ungültige API-Anfrage
        response = client.get("/api/nonexistent-endpoint")
        assert response.status_code == 404
        
        # 2. Ungültige Daten
        invalid_data = {
            "title": "",  # Leerer Titel
            "price": -100  # Negativer Preis
        }
        
        response = client.post("/api/listings", json=invalid_data)
        assert response.status_code == 422  # Validation error
        
        # 3. Nicht existierende Ressource
        response = client.get("/api/listings/99999")
        assert response.status_code == 404
        
        # 4. Unauthorized Zugriff
        response = client.get("/api/users/me")
        assert response.status_code == 401
    
    def test_rate_limiting_flow(self, client: TestClient):
        """Test Rate Limiting (falls aktiv)"""
        
        # Mehrere schnelle Anfragen
        responses = []
        for i in range(5):
            response = client.get("/api/listings?limit=1")
            responses.append(response.status_code)
        
        # Alle Anfragen sollten erfolgreich sein (Rate Limiting ist sehr hoch konfiguriert)
        assert all(status == 200 for status in responses)
        
        # Bei sehr vielen Anfragen könnte Rate Limiting greifen
        # Das ist schwer zu testen ohne die Limits zu senken

class TestDataConsistencyFlow:
    """Tests für Datenkonsistenz-Workflows"""
    
    def test_listing_user_consistency(self, client: TestClient, test_session: Session, test_user: User):
        """Test Konsistenz zwischen Listings und Users"""
        
        # 1. Listing erstellen
        listing_data = {
            "title": "Consistency Test",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "price": 100.0
        }
        
        headers = {"Authorization": f"Bearer {create_access_token(data={'sub': test_user.email})}"}
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/listings", json=listing_data, headers=headers)
            assert response.status_code == 201
            
            listing = response.json()
            listing_id = listing["id"]
        
        # 2. User-Profil abrufen
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 200
        user_profile = response.json()
        
        # 3. Verifikation der Konsistenz
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 200
        
        listing_details = response.json()
        assert listing_details["user_id"] == user_profile["id"]
        assert listing_details["user_id"] == test_user.id
        
        # 4. User-Listings abrufen
        response = client.get(f"/api/users/{test_user.id}/listings")
        assert response.status_code == 200
        
        user_listings = response.json()
        listing_ids = [l["id"] for l in user_listings]
        assert listing_id in listing_ids
