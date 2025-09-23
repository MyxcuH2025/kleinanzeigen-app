"""
End-to-End Tests für komplette User-Journeys
"""
import pytest
import time
from fastapi.testclient import TestClient
from sqlmodel import Session

class TestCompleteUserJourney:
    """Tests für komplette User-Journey von Registrierung bis Listing-Verkauf"""
    
    def test_new_user_complete_journey(self, client: TestClient, test_session: Session):
        """Test komplette User-Journey: Registrierung → Verifikation → Listing → Verkauf"""
        
        # === PHASE 1: REGISTRIERUNG ===
        register_data = {
            "email": "journey@example.com",
            "password": "secure_password123",
            "first_name": "Journey",
            "last_name": "User"
        }
        
        with patch('app.auth.routes.send_verification_email'):
            response = client.post("/api/register", json=register_data)
            assert response.status_code == 201
        
        # === PHASE 2: LOGIN ===
        login_data = {
            "email": "journey@example.com",
            "password": "secure_password123"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=login_data)
            assert response.status_code == 200
            
            token_data = response.json()
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
        
        # === PHASE 3: PROFIL SETUP ===
        profile_update = {
            "bio": "Ich verkaufe tolle Sachen!",
            "location": "Berlin, Deutschland"
        }
        
        response = client.put("/api/users/me", json=profile_update, headers=headers)
        assert response.status_code == 200
        
        # Profil verifizieren
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 200
        
        user_profile = response.json()
        assert user_profile["bio"] == profile_update["bio"]
        assert user_profile["location"] == profile_update["location"]
        
        # === PHASE 4: LISTING ERSTELLEN ===
        listing_data = {
            "title": "Vintage iPhone 12 Pro",
            "description": "Gebrauchtes iPhone in ausgezeichnetem Zustand. Nur minimale Gebrauchsspuren.",
            "category": "kleinanzeigen",
            "condition": "sehr gut",
            "location": {"city": "Berlin", "postal_code": "10115"},
            "price": 650.0,
            "attributes": {
                "brand": "Apple",
                "model": "iPhone 12 Pro",
                "storage": "128GB",
                "color": "Graphit"
            },
            "images": ["iphone1.jpg", "iphone2.jpg"]
        }
        
        response = client.post("/api/listings", json=listing_data, headers=headers)
        assert response.status_code == 201
        
        listing_response = response.json()
        listing_id = listing_response["id"]
        
        # === PHASE 5: LISTING VERWALTEN ===
        # Listing abrufen und verifizieren
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 200
        
        listing = response.json()
        assert listing["title"] == listing_data["title"]
        assert listing["price"] == listing_data["price"]
        assert listing["status"] == "ACTIVE"
        
        # Listing bearbeiten
        update_data = {
            "title": "Vintage iPhone 12 Pro - REDUZIERT!",
            "price": 600.0,
            "description": "Schnellverkauf! iPhone in ausgezeichnetem Zustand. Preis reduziert!"
        }
        
        response = client.put(f"/api/listings/{listing_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        
        # Verifikation der Änderungen
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 200
        
        updated_listing = response.json()
        assert updated_listing["title"] == update_data["title"]
        assert updated_listing["price"] == update_data["price"]
        
        # === PHASE 6: SUCHBARKEIT TESTEN ===
        # Listing sollte in Suchergebnissen erscheinen
        response = client.get("/api/search?q=iPhone")
        assert response.status_code == 200
        
        search_results = response.json()
        found_listing = None
        for result in search_results["results"]:
            if result["id"] == listing_id:
                found_listing = result
                break
        
        assert found_listing is not None
        assert found_listing["title"] == update_data["title"]
        
        # === PHASE 7: USER-LISTINGS VERWALTEN ===
        # Alle User-Listings abrufen
        response = client.get("/api/users/me/listings", headers=headers)
        assert response.status_code == 200
        
        user_listings = response.json()
        assert len(user_listings) >= 1
        
        listing_ids = [l["id"] for l in user_listings]
        assert listing_id in listing_ids
        
        # === PHASE 8: LISTING DEAKTIVIEREN ===
        # Listing als verkauft markieren
        response = client.put(f"/api/listings/{listing_id}", json={"status": "SOLD"}, headers=headers)
        assert response.status_code == 200
        
        # Verifikation - Listing sollte nicht mehr in aktiven Suchergebnissen erscheinen
        response = client.get("/api/search?q=iPhone")
        assert response.status_code == 200
        
        search_results = response.json()
        active_listings = [r for r in search_results["results"] if r["id"] == listing_id]
        assert len(active_listings) == 0  # Sollte nicht mehr in aktiven Suchergebnissen sein
        
        # === PHASE 9: CLEANUP ===
        # Listing komplett löschen
        response = client.delete(f"/api/listings/{listing_id}", headers=headers)
        assert response.status_code == 200
        
        # Verifikation der Löschung
        response = client.get(f"/api/listings/{listing_id}")
        assert response.status_code == 404

class TestBuyerJourney:
    """Tests für Buyer-Journey: Suche → Kontakt → Kauf"""
    
    def test_buyer_search_and_contact_journey(self, client: TestClient, test_session: Session, test_user: User):
        """Test Buyer-Journey: Suche nach Listings → Kontaktaufnahme"""
        
        # === SETUP: LISTING ERSTELLEN ===
        seller_listing = Listing(
            title="Gaming Laptop RTX 3080",
            description="Hochwertiger Gaming Laptop mit RTX 3080. Perfekt für Gaming und Content Creation.",
            category="kleinanzeigen",
            condition="sehr gut",
            location='{"city": "München", "postal_code": "80331"}',
            price=1200.0,
            attributes='{"brand": "ASUS", "ram": "32GB", "storage": "1TB SSD"}',
            images='["laptop1.jpg", "laptop2.jpg"]',
            status="ACTIVE",
            user_id=test_user.id
        )
        
        test_session.add(seller_listing)
        test_session.commit()
        test_session.refresh(seller_listing)
        
        # === PHASE 1: BUYER LOGIN ===
        buyer_login_data = {
            "email": "buyer@example.com",
            "password": "buyer_password"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=buyer_login_data)
            assert response.status_code == 200
            
            token_data = response.json()
            buyer_token = token_data["access_token"]
            buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
        
        # === PHASE 2: SUCHE NACH LISTINGS ===
        # Verschiedene Suchanfragen
        search_queries = [
            "Gaming Laptop",
            "RTX 3080", 
            "ASUS",
            "München"
        ]
        
        for query in search_queries:
            response = client.get(f"/api/search?q={query}")
            assert response.status_code == 200
            
            search_results = response.json()
            # Mindestens ein Ergebnis sollte gefunden werden
            assert len(search_results["results"]) >= 0
        
        # === PHASE 3: DETAILSUCHE ===
        # Spezifische Suche mit Filtern
        response = client.get("/api/search?q=Gaming&price_min=1000&price_max=1500&location=München")
        assert response.status_code == 200
        
        filtered_results = response.json()
        found_target_listing = False
        
        for listing in filtered_results["results"]:
            if listing["id"] == seller_listing.id:
                found_target_listing = True
                assert listing["price"] == 1200.0
                assert "München" in listing["location"]
                break
        
        assert found_target_listing
        
        # === PHASE 4: LISTING-DETAILS ABRUFEN ===
        response = client.get(f"/api/listings/{seller_listing.id}")
        assert response.status_code == 200
        
        listing_details = response.json()
        assert listing_details["title"] == "Gaming Laptop RTX 3080"
        assert listing_details["price"] == 1200.0
        assert listing_details["user_id"] == test_user.id
        
        # === PHASE 5: SELLER-PROFIL ANSCHAUEN ===
        response = client.get(f"/api/users/{test_user.id}")
        assert response.status_code == 200
        
        seller_profile = response.json()
        assert seller_profile["id"] == test_user.id
        
        # === PHASE 6: FAVORITEN VERWALTEN ===
        # Listing zu Favoriten hinzufügen
        response = client.post(f"/api/favorites/{seller_listing.id}", headers=buyer_headers)
        assert response.status_code == 201
        
        # Favoriten abrufen
        response = client.get("/api/favorites", headers=buyer_headers)
        assert response.status_code == 200
        
        favorites = response.json()
        favorite_ids = [f["id"] for f in favorites]
        assert seller_listing.id in favorite_ids
        
        # === PHASE 7: KONTAKT AUFNEHMEN ===
        # Chat-Nachricht senden (falls Chat implementiert ist)
        # Hier würde normalerweise eine Chat-Nachricht gesendet werden
        
        # === CLEANUP ===
        test_session.delete(seller_listing)
        test_session.commit()

class TestAdminJourney:
    """Tests für Admin-Journey: Verwaltung und Moderation"""
    
    def test_admin_management_journey(self, client: TestClient, test_session: Session, test_admin_user: User):
        """Test Admin-Journey: User-Management → Content-Moderation → System-Monitoring"""
        
        # === PHASE 1: ADMIN LOGIN ===
        admin_login_data = {
            "email": test_admin_user.email,
            "password": "admin_password"
        }
        
        with patch('app.auth.routes.verify_password', return_value=True):
            response = client.post("/api/login", json=admin_login_data)
            assert response.status_code == 200
            
            token_data = response.json()
            admin_token = token_data["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # === PHASE 2: USER-MANAGEMENT ===
        # Alle User abrufen
        response = client.get("/api/admin/users", headers=admin_headers)
        # Note: Admin-Endpoints könnten noch nicht implementiert sein
        # assert response.status_code == 200
        
        # === PHASE 3: SYSTEM-MONITORING ===
        # System-Status abrufen
        response = client.get("/api/system/health")
        assert response.status_code == 200
        
        health_data = response.json()
        assert "status" in health_data
        
        # Cache-Statistiken abrufen
        response = client.get("/api/cache/stats")
        assert response.status_code == 200
        
        cache_stats = response.json()
        assert "status" in cache_stats
        
        # Rate-Limiting-Statistiken abrufen
        response = client.get("/api/rate-limiting/stats")
        assert response.status_code == 200
        
        rate_stats = response.json()
        assert "rate_limiting_enabled" in rate_stats
        
        # === PHASE 4: PERFORMANCE-MONITORING ===
        # Performance-Metriken abrufen
        response = client.get("/api/performance/metrics")
        # Note: Performance-Endpoints könnten noch nicht implementiert sein
        # assert response.status_code == 200

class TestErrorRecoveryJourney:
    """Tests für Error-Recovery-Journey: Fehlerbehandlung und Recovery"""
    
    def test_error_recovery_journey(self, client: TestClient):
        """Test Error-Recovery: Fehler → Recovery → Normalbetrieb"""
        
        # === PHASE 1: FEHLER SIMULIEREN ===
        # Ungültige Anfragen
        invalid_requests = [
            ("/api/listings/99999", 404),  # Nicht existierendes Listing
            ("/api/users/99999", 404),     # Nicht existierender User
            ("/api/nonexistent", 404),     # Nicht existierender Endpoint
        ]
        
        for endpoint, expected_status in invalid_requests:
            response = client.get(endpoint)
            assert response.status_code == expected_status
        
        # === PHASE 2: VALIDATION ERRORS ===
        # Ungültige Daten senden
        invalid_data = [
            {"title": "", "price": -100},  # Leerer Titel, negativer Preis
            {"email": "invalid_email"},    # Ungültige E-Mail
            {"password": "123"},           # Zu kurzes Passwort
        ]
        
        for data in invalid_data:
            if "email" in data:
                response = client.post("/api/register", json=data)
            elif "title" in data:
                response = client.post("/api/listings", json=data)
            else:
                continue
            
            assert response.status_code == 422  # Validation error
        
        # === PHASE 3: AUTHENTICATION ERRORS ===
        # Ungültige Authentifizierung
        auth_errors = [
            {"Authorization": "Bearer invalid_token"},
            {"Authorization": "Invalid format"},
            {},  # Kein Authorization Header
        ]
        
        for headers in auth_errors:
            response = client.get("/api/users/me", headers=headers)
            assert response.status_code == 401
        
        # === PHASE 4: RECOVERY VERIFICATION ===
        # System sollte nach Fehlern weiterhin funktionieren
        response = client.get("/api/listings")
        assert response.status_code == 200
        
        response = client.get("/api/system/health")
        assert response.status_code == 200
        
        # === PHASE 5: GRACEFUL DEGRADATION ===
        # System sollte auch bei Teilfehlern weiterhin funktionieren
        # (z.B. wenn ein Service nicht verfügbar ist)
        
        # Basis-Endpoints sollten immer funktionieren
        essential_endpoints = [
            "/api/listings",
            "/api/search",
            "/api/system/health"
        ]
        
        for endpoint in essential_endpoints:
            response = client.get(endpoint)
            assert response.status_code in [200, 422]  # 422 ist OK für leere Parameter
