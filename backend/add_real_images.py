#!/usr/bin/env python3
"""
Skript zum Hinzufügen echter Bilder zu den Anzeigen
"""
import os
import json
import random
from sqlmodel import SQLModel, create_engine, Session, select
from models import Listing
from config import config

# Engine erstellen
engine = create_engine(config.DATABASE_URL)

def get_uploaded_images():
    """Hole alle hochgeladenen Bilder aus dem uploads Ordner"""
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        print("❌ Uploads-Ordner nicht gefunden")
        return []
    
    images = []
    for filename in os.listdir(uploads_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            # Überspringe Avatar-Bilder und Placeholder
            if not filename.startswith('avatar_') and filename not in ['placeholder-image.jpg', 'placeholder.jpg']:
                images.append(filename)
    
    print(f"✅ {len(images)} Bilder im uploads Ordner gefunden")
    return images

def add_images_to_listings():
    """Füge zufällige Bilder zu den Anzeigen hinzu"""
    with Session(engine) as session:
        # Hole alle Anzeigen
        statement = select(Listing)
        listings = session.exec(statement).all()
        
        if not listings:
            print("❌ Keine Anzeigen gefunden")
            return
        
        print(f"✅ {len(listings)} Anzeigen gefunden")
        
        # Hole verfügbare Bilder
        available_images = get_uploaded_images()
        
        if not available_images:
            print("❌ Keine Bilder verfügbar")
            return
        
        updated_count = 0
        
        for listing in listings:
            # Prüfe ob die Anzeige bereits Bilder hat
            try:
                current_images = json.loads(listing.images) if listing.images else []
            except:
                current_images = []
            
            # Wenn bereits Bilder vorhanden sind, überspringe
            if current_images and len(current_images) > 0:
                print(f"⏭️  Anzeige {listing.id} hat bereits Bilder: {current_images}")
                continue
            
            # Wähle zufällig 1-3 Bilder aus
            num_images = random.randint(1, min(3, len(available_images)))
            selected_images = random.sample(available_images, num_images)
            
            # Speichere die Bilder als JSON-Array
            listing.images = json.dumps(selected_images)
            
            print(f"✅ Anzeige {listing.id} ({listing.title}): {selected_images}")
            updated_count += 1
        
        # Speichere alle Änderungen
        session.commit()
        print(f"✅ {updated_count} Anzeigen mit Bildern aktualisiert")

def show_current_images():
    """Zeige aktuelle Bilder in den Anzeigen"""
    with Session(engine) as session:
        statement = select(Listing)
        listings = session.exec(statement).all()
        
        print(f"\n📊 Aktuelle Bilder in {len(listings)} Anzeigen:")
        for listing in listings:
            try:
                images = json.loads(listing.images) if listing.images else []
                print(f"  {listing.id}: {listing.title} -> {len(images)} Bilder: {images}")
            except:
                print(f"  {listing.id}: {listing.title} -> Fehler beim Parsen der Bilder")

if __name__ == "__main__":
    print("🖼️  Bilder zu Anzeigen hinzufügen")
    print("=" * 50)
    
    # Zeige aktuelle Bilder
    show_current_images()
    
    print("\n" + "=" * 50)
    
    # Füge Bilder hinzu
    add_images_to_listings()
    
    print("\n" + "=" * 50)
    
    # Zeige aktualisierte Bilder
    show_current_images()
    
    print("\n✅ Fertig!")
