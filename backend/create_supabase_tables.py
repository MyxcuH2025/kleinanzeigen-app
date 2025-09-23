#!/usr/bin/env python3
"""
Script um Tabellen in Supabase zu erstellen
"""
import os
import sys
from sqlmodel import SQLModel, create_engine, text
from config import config

def create_tables_in_supabase():
    """Erstelle alle Tabellen in Supabase"""
    print("🚀 Erstelle Tabellen in Supabase...")
    
    # Engine für Supabase erstellen
    engine = create_engine(
        config.DATABASE_URL,
        pool_size=3,
        max_overflow=7,
        pool_timeout=15,
        pool_recycle=1800,
        pool_pre_ping=True,
        echo=True  # SQL-Logging für Debugging
    )
    
    try:
        # Teste Verbindung
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Supabase-Verbindung erfolgreich")
        
        # Importiere alle Modelle
        import models
        
        # Erstelle alle Tabellen
        SQLModel.metadata.create_all(engine, checkfirst=True)
        print("✅ Alle Tabellen erfolgreich erstellt")
        
        # Teste Tabellen-Erstellung
        with engine.connect() as conn:
            # Prüfe ob listings Tabelle existiert
            result = conn.execute(text("SELECT COUNT(*) FROM listings LIMIT 1"))
            count = result.scalar()
            print(f"✅ Listings-Tabelle existiert: {count} Einträge")
            
            # Prüfe ob users Tabelle existiert
            result = conn.execute(text("SELECT COUNT(*) FROM users LIMIT 1"))
            count = result.scalar()
            print(f"✅ Users-Tabelle existiert: {count} Einträge")
            
            # Prüfe ob categories Tabelle existiert
            result = conn.execute(text("SELECT COUNT(*) FROM categories LIMIT 1"))
            count = result.scalar()
            print(f"✅ Categories-Tabelle existiert: {count} Einträge")
        
        print("🎉 Supabase-Tabellen erfolgreich erstellt!")
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen der Tabellen: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_tables_in_supabase()
    if success:
        print("✅ Script erfolgreich abgeschlossen")
        sys.exit(0)
    else:
        print("❌ Script fehlgeschlagen")
        sys.exit(1)
