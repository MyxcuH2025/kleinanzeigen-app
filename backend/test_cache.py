#!/usr/bin/env python3
"""
Test Redis Caching für Listings
"""
import time
from fastapi.testclient import TestClient
from main import app

def test_cache_performance():
    client = TestClient(app)
    
    print("=== CACHE PERFORMANCE TEST ===")
    
    # Test 1: Erster Call (sollte in Cache geschrieben werden)
    start = time.time()
    response1 = client.get("/api/listings")
    end = time.time()
    
    print(f"Erster Call (Cache Miss): {(end - start) * 1000:.2f} ms")
    print(f"Status: {response1.status_code}")
    
    # Test 2: Zweiter Call (sollte aus Cache kommen)
    start = time.time()
    response2 = client.get("/api/listings")
    end = time.time()
    
    print(f"Zweiter Call (Cache Hit): {(end - start) * 1000:.2f} ms")
    print(f"Status: {response2.status_code}")
    
    # Test 3: Dritter Call (sollte aus Cache kommen)
    start = time.time()
    response3 = client.get("/api/listings")
    end = time.time()
    
    print(f"Dritter Call (Cache Hit): {(end - start) * 1000:.2f} ms")
    print(f"Status: {response3.status_code}")
    
    # Prüfe ob Antworten identisch sind
    print(f"\nAntworten identisch: {response1.content == response2.content == response3.content}")
    
    # Cache-Statistiken
    from app.cache.redis_service import redis_cache
    print(f"\nRedis verfügbar: {redis_cache.is_available()}")
    
    # Prüfe Cache-Inhalt
    cache_keys = redis_cache._redis.keys("listings:*")
    print(f"Cache-Keys gefunden: {len(cache_keys)}")
    for key in cache_keys[:3]:  # Zeige erste 3 Keys
        print(f"- {key.decode()}")

if __name__ == "__main__":
    test_cache_performance()
