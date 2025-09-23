"""
Unit-Tests für Listings
"""
import pytest
import json
from fastapi.testclient import TestClient
from sqlmodel import Session

from models import Listing, ListingStatus, User

class TestListingService:
    """Tests für Listing-Service"""
    
    def test_create_listing(self, client: TestClient, auth_headers: dict, test_user):
        """Test Listing-Erstellung"""
        listing_data = {
            "title": "Test Listing",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "condition": "neu",
            "location": {"city": "Berlin", "postal_code": "10115"},
            "price": 100.0,
            "attributes": {"brand": "Test Brand"}
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == listing_data["title"]
        assert data["user_id"] == test_user.id
        assert data["status"] == "ACTIVE"
    
    def test_create_listing_unauthorized(self, client):
        """Test Listing-Erstellung ohne Authentifizierung"""
        listing_data = {
            "title": "Test Listing",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "price": 100.0
        }
        
        response = client.post("/api/listings", json=listing_data)
        assert response.status_code == 401
    
    def test_get_listing_by_id(self, client: TestClient, test_listing: Listing):
        """Test Abrufen eines Listings nach ID"""
        response = client.get(f"/api/listings/{test_listing.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_listing.id
        assert data["title"] == test_listing.title
    
    def test_get_listing_not_found(self, client: TestClient):
        """Test Abrufen eines nicht existierenden Listings"""
        response = client.get("/api/listings/99999")
        assert response.status_code == 404
    
    def test_update_listing(self, client: TestClient, auth_headers: dict, test_listing: Listing):
        """Test Listing-Update"""
        update_data = {
            "title": "Updated Title",
            "price": 150.0
        }
        
        response = client.put(f"/api/listings/{test_listing.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["price"] == update_data["price"]
    
    def test_update_listing_unauthorized(self, client: TestClient, test_listing: Listing):
        """Test Listing-Update ohne Authentifizierung"""
        update_data = {"title": "Updated Title"}
        
        response = client.put(f"/api/listings/{test_listing.id}", json=update_data)
        assert response.status_code == 401
    
    def test_delete_listing(self, client: TestClient, auth_headers: dict, test_listing: Listing):
        """Test Listing-Löschung"""
        response = client.delete(f"/api/listings/{test_listing.id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert "successfully deleted" in response.json()["message"]
    
    def test_delete_listing_not_found(self, client: TestClient, auth_headers: dict):
        """Test Löschung eines nicht existierenden Listings"""
        response = client.delete("/api/listings/99999", headers=auth_headers)
        assert response.status_code == 404

class TestListingEndpoints:
    """Tests für Listing-Endpoints"""
    
    def test_get_listings_empty(self, client: TestClient):
        """Test Abrufen von Listings (leere Liste)"""
        response = client.get("/api/listings")
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 0
    
    def test_get_listings_with_data(self, client: TestClient, test_listing: Listing):
        """Test Abrufen von Listings mit Daten"""
        response = client.get("/api/listings")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) >= 1
        assert data["results"][0]["id"] == test_listing.id
    
    def test_get_listings_with_filters(self, client: TestClient, test_listing: Listing):
        """Test Abrufen von Listings mit Filtern"""
        # Kategorie-Filter
        response = client.get(f"/api/listings?category={test_listing.category}")
        assert response.status_code == 200
        
        data = response.json()
        for listing in data["results"]:
            assert listing["category"] == test_listing.category
        
        # Preis-Filter
        response = client.get(f"/api/listings?price_min={test_listing.price - 50}")
        assert response.status_code == 200
        
        response = client.get(f"/api/listings?price_max={test_listing.price + 50}")
        assert response.status_code == 200
    
    def test_get_listings_pagination(self, client: TestClient, test_session: Session, test_user: User):
        """Test Listing-Pagination"""
        # Mehrere Test-Listings erstellen
        for i in range(5):
            listing = Listing(
                title=f"Test Listing {i}",
                description=f"Description {i}",
                category="kleinanzeigen",
                price=100.0 + i,
                status=ListingStatus.ACTIVE,
                user_id=test_user.id
            )
            test_session.add(listing)
        test_session.commit()
        
        # Erste Seite
        response = client.get("/api/listings?limit=2&page=1")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["results"]) == 2
        assert data["page"] == 1
        assert data["limit"] == 2
        
        # Zweite Seite
        response = client.get("/api/listings?limit=2&page=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 2
    
    def test_get_listings_sorting(self, client: TestClient, test_session: Session, test_user: User):
        """Test Listing-Sortierung"""
        # Listings mit verschiedenen Preisen erstellen
        prices = [300, 100, 200]
        for price in prices:
            listing = Listing(
                title=f"Listing {price}€",
                description="Description",
                category="kleinanzeigen",
                price=price,
                status=ListingStatus.ACTIVE,
                user_id=test_user.id
            )
            test_session.add(listing)
        test_session.commit()
        
        # Nach Preis aufsteigend sortieren
        response = client.get("/api/listings?sort_by=price&sort_order=asc")
        assert response.status_code == 200
        
        data = response.json()
        if len(data["results"]) >= 3:
            prices = [listing["price"] for listing in data["results"]]
            assert prices == sorted(prices)
        
        # Nach Preis absteigend sortieren
        response = client.get("/api/listings?sort_by=price&sort_order=desc")
        assert response.status_code == 200
        
        data = response.json()
        if len(data["results"]) >= 3:
            prices = [listing["price"] for listing in data["results"]]
            assert prices == sorted(prices, reverse=True)

class TestListingValidation:
    """Tests für Listing-Validierung"""
    
    def test_create_listing_missing_required_fields(self, client: TestClient, auth_headers: dict):
        """Test Listing-Erstellung ohne Pflichtfelder"""
        listing_data = {
            "title": "Test Listing"
            # Fehlende Pflichtfelder: description, category, price
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        assert response.status_code == 422  # Validation error
    
    def test_create_listing_invalid_price(self, client: TestClient, auth_headers: dict):
        """Test Listing-Erstellung mit ungültigem Preis"""
        listing_data = {
            "title": "Test Listing",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "price": -100.0  # Negativer Preis
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        assert response.status_code == 422  # Validation error
    
    def test_create_listing_invalid_category(self, client: TestClient, auth_headers: dict):
        """Test Listing-Erstellung mit ungültiger Kategorie"""
        listing_data = {
            "title": "Test Listing",
            "description": "Test Description",
            "category": "invalid_category",
            "price": 100.0
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        assert response.status_code == 422  # Validation error

class TestListingImages:
    """Tests für Listing-Bilder"""
    
    def test_listing_images_format(self, client: TestClient, test_session: Session, test_user: User):
        """Test Listing-Bildformat"""
        listing_data = {
            "title": "Test Listing with Images",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "price": 100.0,
            "images": ["image1.jpg", "image2.jpg"]
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        assert response.status_code == 201
        
        data = response.json()
        assert isinstance(data["images"], list)
        assert len(data["images"]) == 2
    
    def test_listing_empty_images(self, client: TestClient, auth_headers: dict):
        """Test Listing ohne Bilder"""
        listing_data = {
            "title": "Test Listing",
            "description": "Test Description",
            "category": "kleinanzeigen",
            "price": 100.0,
            "images": []
        }
        
        response = client.post("/api/listings", json=listing_data, headers=auth_headers)
        assert response.status_code == 201
        
        data = response.json()
        assert data["images"] == []
