#!/usr/bin/env python3
"""
Script zum Korrigieren der Listing-Kategorien
"""
from models import Listing
from sqlmodel import Session, select
from config import config
from sqlmodel import create_engine

def fix_listing_categories():
    # Engine und Session
    engine = create_engine(config.DATABASE_URL)
    session = Session(engine)

    try:
        # Alle Listings abrufen
        listings = session.exec(select(Listing)).all()
        print(f'Anzahl Listings: {len(listings)}')
        
        for listing in listings:
            print(f'Vorher: {listing.title} - category="{listing.category}"')
            
            # Kategorien korrigieren
            if listing.category == "möbel":
                listing.category = "home-garden"
                print(f'  ✅ Geändert zu: home-garden')
            elif listing.category == "autos":
                listing.category = "auto-rad-boot"
                print(f'  ✅ Geändert zu: auto-rad-boot')
            elif listing.category == "elektronik":
                # Elektronik ist bereits korrekt
                print(f'  ✅ Bleibt: elektronik')
            else:
                print(f'  ⚠️ Unbekannte Kategorie: {listing.category}')
        
        session.commit()
        print('\n🎉 Kategorien erfolgreich korrigiert!')
        
        # Nachher anzeigen
        print('\n📋 Nachher:')
        listings = session.exec(select(Listing)).all()
        for listing in listings:
            print(f'- {listing.title}: category="{listing.category}"')
            
    except Exception as e:
        session.rollback()
        print(f'❌ Fehler: {e}')
    finally:
        session.close()

if __name__ == "__main__":
    fix_listing_categories()
