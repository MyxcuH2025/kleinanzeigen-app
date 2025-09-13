#!/usr/bin/env python3
"""
Test Cache-Decorator direkt
"""
import time
import sys
sys.path.append('.')

from app.cache.decorators import cache_listings

# Simuliere die get_listings Funktion
@cache_listings(ttl=300)
def test_get_listings(category=None, page=1, limit=20):
    print(f"  → Funktion wird ausgeführt: category={category}, page={page}, limit={limit}")
    time.sleep(0.5)  # Simuliere langsame Operation
    return {"listings": ["test1", "test2"], "total": 2}

def test_decorator():
    print("=== CACHE DECORATOR TEST ===")
    
    # Test 1: Erster Call (sollte langsam sein)
    print("Test 1: Erster Call (Cache Miss)")
    start = time.time()
    result1 = test_get_listings()
    end = time.time()
    print(f"  Zeit: {(end - start) * 1000:.2f} ms")
    print(f"  Ergebnis: {result1}")
    
    # Test 2: Zweiter Call (sollte schnell sein)
    print("\nTest 2: Zweiter Call (Cache Hit)")
    start = time.time()
    result2 = test_get_listings()
    end = time.time()
    print(f"  Zeit: {(end - start) * 1000:.2f} ms")
    print(f"  Ergebnis: {result2}")
    
    # Test 3: Dritter Call (sollte schnell sein)
    print("\nTest 3: Dritter Call (Cache Hit)")
    start = time.time()
    result3 = test_get_listings()
    end = time.time()
    print(f"  Zeit: {(end - start) * 1000:.2f} ms")
    print(f"  Ergebnis: {result3}")
    
    # Prüfe ob Ergebnisse identisch sind
    print(f"\nErgebnisse identisch: {result1 == result2 == result3}")

if __name__ == "__main__":
    test_decorator()
