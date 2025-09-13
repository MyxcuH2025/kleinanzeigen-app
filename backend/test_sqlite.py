#!/usr/bin/env python3
"""
Test SQLite Performance direkt
"""
import time
from sqlmodel import create_engine, text
from config import config

def test_sqlite_performance():
    engine = create_engine(config.DATABASE_URL)
    
    with engine.connect() as conn:
        # Test 1: Einfache Query
        print("=== SQLITE PERFORMANCE TEST ===")
        
        start = time.time()
        result = conn.execute(text('SELECT * FROM listing WHERE status = "active" LIMIT 20'))
        rows = list(result)
        end = time.time()
        
        print(f"SQLite Query Time: {(end - start) * 1000:.2f} ms")
        print(f"Rows returned: {len(rows)}")
        
        # Test 2: Count Query
        start = time.time()
        result = conn.execute(text('SELECT COUNT(*) FROM listing WHERE status = "active"'))
        count = result.scalar()
        end = time.time()
        
        print(f"Count Query Time: {(end - start) * 1000:.2f} ms")
        print(f"Total active listings: {count}")
        
        # Test 3: Mit Indizes
        start = time.time()
        result = conn.execute(text('SELECT * FROM listing WHERE status = "active" ORDER BY created_at DESC LIMIT 20'))
        rows = list(result)
        end = time.time()
        
        print(f"Ordered Query Time: {(end - start) * 1000:.2f} ms")
        print(f"Rows returned: {len(rows)}")

if __name__ == "__main__":
    test_sqlite_performance()
