#!/usr/bin/env python3
"""
Profile API performance to find bottlenecks
"""
import time
import cProfile
import pstats
from io import StringIO
from fastapi.testclient import TestClient
from main import app

def profile_listings_endpoint():
    client = TestClient(app)
    
    print("=== API PERFORMANCE PROFILING ===")
    
    # Profile the /api/listings endpoint
    profiler = cProfile.Profile()
    profiler.enable()
    
    start_time = time.time()
    response = client.get("/api/listings")
    end_time = time.time()
    
    profiler.disable()
    
    print(f"Total Response Time: {(end_time - start_time) * 1000:.2f} ms")
    print(f"Status Code: {response.status_code}")
    print(f"Response Size: {len(response.content)} bytes")
    
    # Get profiling results
    s = StringIO()
    ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
    ps.print_stats(10)  # Top 10 functions
    
    print("\n=== TOP 10 SLOWEST FUNCTIONS ===")
    print(s.getvalue())

if __name__ == "__main__":
    profile_listings_endpoint()
