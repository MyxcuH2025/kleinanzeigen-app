#!/usr/bin/env python3
"""
Test minimal API ohne FastAPI-Overhead
"""
import time
from fastapi.testclient import TestClient
from main import app

def test_minimal_endpoint():
    client = TestClient(app)
    
    print("=== MINIMAL API TEST ===")
    
    # Test 1: Minimaler Endpoint
    start = time.time()
    response = client.get("/")
    end = time.time()
    
    print(f"Root Endpoint: {(end - start) * 1000:.2f} ms")
    print(f"Status: {response.status_code}")
    
    # Test 2: Health Check
    start = time.time()
    try:
        response = client.get("/health")
        end = time.time()
        print(f"Health Endpoint: {(end - start) * 1000:.2f} ms")
        print(f"Status: {response.status_code}")
    except:
        print("Health Endpoint: Nicht verfügbar")
    
    # Test 3: Listings ohne FastAPI
    start = time.time()
    try:
        response = client.get("/api/listings")
        end = time.time()
        print(f"Listings Endpoint: {(end - start) * 1000:.2f} ms")
        print(f"Status: {response.status_code}")
        print(f"Response Size: {len(response.content)} bytes")
    except Exception as e:
        print(f"Listings Endpoint Error: {e}")

if __name__ == "__main__":
    test_minimal_endpoint()
