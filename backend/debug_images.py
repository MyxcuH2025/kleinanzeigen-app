#!/usr/bin/env python3
"""
Debug-Script für Bildverarbeitung
"""
import requests
import json

def debug_images():
    try:
        response = requests.get('http://localhost:8000/api/listings')
        data = response.json()
        
        print('=== BACKEND-API TEST ===')
        print(f'Status: {response.status_code}')
        print(f'Response Type: {type(data)}')
        print(f'Response Keys: {data.keys() if isinstance(data, dict) else "Not a dict"}')
        
        # Extrahiere die tatsächlichen Anzeigen
        if isinstance(data, dict) and 'listings' in data:
            listings = data['listings']
        else:
            listings = data
            
        print(f'Anzahl Anzeigen: {len(listings)}')
        
        # Prüfe alle Anzeigen
        print(f'\n=== ALLE ANZEIGEN ===')
        for i, listing in enumerate(listings):
            if isinstance(listing, dict):
                title = listing.get('title', f'Anzeige {i}')
                print(f'{i+1}. {title}')
            else:
                print(f'{i+1}. {listing}')
        
        # Prüfe spezifische Anzeigen
        target_titles = ['cccccccccccccc', 'iPhone 12 verkaufen', 'Uhr', 'haus']
        
        for listing in listings:
            if isinstance(listing, dict):
                title = listing.get('title', '')
                if title in target_titles:
                    print(f'\n=== {title} ===')
                    images = listing.get('images', '')
                    print(f'Images: {images}')
                    print(f'Images Type: {type(images)}')
                    
                    # Prüfe ob es Base64 ist
                    if isinstance(images, str):
                        if images.startswith('data:') or 'base64' in images:
                            print('❌ Base64-Bild erkannt!')
                        else:
                            print('✅ Kein Base64-Bild')
                    elif isinstance(images, list):
                        for img in images:
                            if isinstance(img, str) and (img.startswith('data:') or 'base64' in img):
                                print('❌ Base64-Bild in Array erkannt!')
                            else:
                                print('✅ Kein Base64-Bild in Array')
                            
    except Exception as e:
        print(f'Fehler: {e}')

if __name__ == '__main__':
    debug_images()
