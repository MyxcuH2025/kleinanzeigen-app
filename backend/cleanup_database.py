#!/usr/bin/env python3
"""
Datenbank-Bereinigung: Base64-Bilder komplett entfernen
"""
import sqlite3
import json

def clean_database():
    """Entfernt alle Base64-Bilder aus der Datenbank"""
    
    # Verbindung zur Datenbank
    conn = sqlite3.connect('kleinanzeigen.db')
    cursor = conn.cursor()
    
    # Alle Listings mit Bildern abrufen
    cursor.execute("SELECT id, images FROM listings WHERE images IS NOT NULL AND images != '[]'")
    listings = cursor.fetchall()
    
    print(f'🔍 Gefundene Listings mit Bildern: {len(listings)}')
    
    cleaned_count = 0
    
    for listing_id, images_json in listings:
        try:
            images = json.loads(images_json)
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
                cursor.execute('UPDATE listings SET images = ? WHERE id = ?', (json.dumps(clean_images), listing_id))
                print(f'✅ Listing {listing_id} bereinigt: {len(clean_images)} saubere Bilder')
                cleaned_count += 1
            
        except Exception as e:
            print(f'❌ Fehler bei Listing {listing_id}: {e}')
    
    conn.commit()
    conn.close()
    
    print(f'✅ Datenbank-Bereinigung abgeschlossen: {cleaned_count} Listings bereinigt')

if __name__ == "__main__":
    clean_database()
