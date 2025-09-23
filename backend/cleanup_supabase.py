#!/usr/bin/env python3
"""
Supabase-Datenbank-Bereinigung: Base64-Bilder komplett entfernen
"""
import os
import json
from sqlalchemy import create_engine, text
from config import config

DATABASE_URL = config.DATABASE_URL

def clean_supabase_database():
    """Entfernt alle Base64-Bilder aus der Supabase-Datenbank"""
    
    # Verbindung zur Supabase-Datenbank
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Alle Listings mit Bildern abrufen
        result = conn.execute(text("SELECT id, images FROM listings WHERE images IS NOT NULL AND images::text != '[]'"))
        listings = result.fetchall()
        
        print(f'🔍 Gefundene Listings mit Bildern: {len(listings)}')
        
        cleaned_count = 0
        
        for listing_id, images_data in listings:
            try:
                # Handle both JSON string and list
                if isinstance(images_data, str):
                    images = json.loads(images_data)
                else:
                    images = images_data
                
                print(f'📋 Listing {listing_id}: {len(images)} Bilder')
                
                # Base64-Bilder finden und entfernen
                clean_images = []
                base64_found = False
                
                for img in images:
                    if isinstance(img, str):
                        if img.startswith('data:image/') or 'base64' in img:
                            print(f'❌ Base64-Bild gefunden in Listing {listing_id}: {img[:50]}...')
                            base64_found = True
                        else:
                            clean_images.append(img)
                    else:
                        clean_images.append(img)
                
                if base64_found:
                    # Listing mit bereinigten Bildern aktualisieren
                    conn.execute(text("UPDATE listings SET images = :images WHERE id = :id"), 
                               {"images": json.dumps(clean_images), "id": listing_id})
                    print(f'✅ Listing {listing_id} bereinigt: {len(clean_images)} saubere Bilder')
                    cleaned_count += 1
                
            except Exception as e:
                print(f'❌ Fehler bei Listing {listing_id}: {e}')
        
        conn.commit()
        print(f'✅ Supabase-Datenbank-Bereinigung abgeschlossen: {cleaned_count} Listings bereinigt')

if __name__ == "__main__":
    clean_supabase_database()
