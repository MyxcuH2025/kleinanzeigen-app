#!/usr/bin/env python3
"""
Production Setup Script für 40.000 User
"""
import os
import subprocess
import sys

def setup_production():
    """
    Setup Production Environment
    """
    print("🚀 PRODUKTIONS-SETUP FÜR 40.000 USER")
    print("=" * 50)
    
    # 1. PostgreSQL Dependencies installieren
    print("\n📦 Installiere PostgreSQL Dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "psycopg2-binary", "asyncpg"], check=True)
        print("✅ PostgreSQL Dependencies installiert")
    except subprocess.CalledProcessError as e:
        print(f"❌ Fehler bei Dependencies: {e}")
        return False
    
    # 2. Environment File erstellen
    print("\n📝 Erstelle Production Environment...")
    
    env_content = """# 🚀 PRODUKTIONS-UMGEBUNG FÜR 40.000 USER

# DATENBANK - PostgreSQL für Produktion
# Ersetze mit deiner Supabase/PostgreSQL URL
DATABASE_URL=postgresql://user:password@host:port/database

# REDIS - Cloud für Produktion
REDIS_URL=redis://default:75SFxGpipHBU8ayr1wvpaX4cUHUw04aY@redis-14485.c100.us-east-1-4.ec2.redns.redis-cloud.com:14485
REDIS_PASSWORD=75SFxGpipHBU8ayr1wvpaX4cUHUw04aY
REDIS_MAX_CONNECTIONS=100

# RATE LIMITING - Aktiviert für Produktion
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS_PER_MINUTE=120
RATE_LIMIT_BURST_SIZE=20
RATE_LIMIT_WINDOW_SIZE=60
RATE_LIMIT_SEARCH_REQUESTS_PER_MINUTE=60

# CACHING - Produktions-Werte
CACHE_TTL_LISTINGS=300
CACHE_TTL_CATEGORIES=1800
CACHE_TTL_USER_PROFILES=600
CACHE_TTL_SEARCH_RESULTS=180

# JWT - Produktions-Sicherheit
SECRET_KEY=your-super-secure-production-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ENVIRONMENT
ENVIRONMENT=production
LOG_LEVEL=INFO

# FRONTEND
FRONTEND_URL=https://your-domain.com

# CORS - Produktions-Domains
CORS_ORIGINS=["https://your-domain.com", "https://www.your-domain.com"]
"""
    
    with open(".env.production", "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print("✅ .env.production erstellt")
    
    # 3. Anweisungen anzeigen
    print("\n📋 NÄCHSTE SCHRITTE:")
    print("1. 🐘 Supabase Account erstellen: https://supabase.com")
    print("2. 📋 Neues Projekt erstellen")
    print("3. 🔗 Database URL kopieren")
    print("4. ✏️ .env.production bearbeiten:")
    print("   DATABASE_URL=postgresql://user:pass@host:port/db")
    print("5. 🚀 Migration starten:")
    print("   python migrate_to_postgresql.py")
    print("6. ✅ Verifikation:")
    print("   python migrate_to_postgresql.py verify")
    
    print("\n🎯 SUPABASE SETUP:")
    print("1. Gehe zu: https://supabase.com")
    print("2. Sign Up (kostenlos)")
    print("3. New Project → Create")
    print("4. Settings → Database → Connection String")
    print("5. PostgreSQL URL kopieren")
    
    print("\n💰 KOSTEN:")
    print("- Supabase: Kostenlos (bis 500MB)")
    print("- Redis Cloud: Kostenlos (30MB)")
    print("- Total: €0/Monat für Start")
    
    return True

if __name__ == "__main__":
    setup_production()
