#!/usr/bin/env python3
"""
Synchronisiert Frontend-Kategorien mit Backend-Datenbank
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from models.category import Category
from app.dependencies import engine
import logging

# Frontend-Kategorien aus categories.ts
FRONTEND_CATEGORIES = [
    {
        "value": "auto-rad-boot",
        "label": "Auto, Rad & Boot", 
        "icon": "🚗",
        "description": "Autos, Motorräder, Fahrräder, Boote & Zubehör"
    },
    {
        "value": "real-estate",
        "label": "Immobilien",
        "icon": "🏠", 
        "description": "Wohnungen, Häuser, Gewerbe, Grundstücke"
    },
    {
        "value": "jobs",
        "label": "Jobs",
        "icon": "💼",
        "description": "Stellenangebote, Praktika, Ausbildung, Freelance"
    },
    {
        "value": "services", 
        "label": "Dienstleistungen",
        "icon": "🔧",
        "description": "Reparaturen, Beratung, Transport, Service"
    },
    {
        "value": "personal-items",
        "label": "Persönliche Gegenstände", 
        "icon": "👕",
        "description": "Kleidung, Schmuck, Beauty & Kosmetik"
    },
    {
        "value": "home-garden",
        "label": "Haus & Garten",
        "icon": "🏡", 
        "description": "Möbel, Haushaltsgeräte, Garten, Werkzeug"
    },
    {
        "value": "elektronik",
        "label": "Elektronik",
        "icon": "📱",
        "description": "Smartphones, Laptops, Kameras, Gaming & mehr"
    },
    {
        "value": "freizeit-hobby",
        "label": "Freizeit, Hobby & Nachbarschaft",
        "icon": "⚽",
        "description": "Fitness, Outdoor, Hobby, Freizeit, Nachbarschaft"
    },
    {
        "value": "familie-kind-baby",
        "label": "Familie, Kind & Baby",
        "icon": "👶",
        "description": "Baby, Kind, Schwangerschaft, Spielzeug"
    },
    {
        "value": "mode-beauty",
        "label": "Mode & Beauty", 
        "icon": "👕",
        "description": "Kleidung, Schuhe, Accessoires, Kosmetik"
    },
    {
        "value": "haustiere",
        "label": "Haustiere",
        "icon": "🐕",
        "description": "Hunde, Katzen, Vögel, Fische, Zubehör"
    },
    {
        "value": "eintrittskarten-tickets",
        "label": "Eintrittskarten & Tickets",
        "icon": "🎫", 
        "description": "Konzerte, Sport, Theater, Veranstaltungen"
    },
    {
        "value": "musik-filme-buecher",
        "label": "Musik, Filme & Bücher",
        "icon": "📚",
        "description": "Bücher, Musik, Filme, Zeitschriften"
    },
    {
        "value": "verschenken-tauschen",
        "label": "Verschenken & Tauschen",
        "icon": "🎁",
        "description": "Kostenlose Angebote, Tauschgeschäfte"
    },
    {
        "value": "unterricht-kurse",
        "label": "Unterricht & Kurse",
        "icon": "🎓",
        "description": "Sprachen, Musik, Sport, Computer-Kurse"
    }
]

def sync_categories():
    """Synchronisiert Frontend-Kategorien mit Backend-Datenbank"""
    
    with Session(engine) as session:
        print("🔄 Synchronisiere Frontend-Kategorien mit Backend-Datenbank...")
        
        # Alle bestehenden Kategorien löschen
        existing_categories = session.exec(select(Category)).all()
        for category in existing_categories:
            session.delete(category)
        session.commit()
        print(f"🗑️ {len(existing_categories)} bestehende Kategorien gelöscht")
        
        # Neue Kategorien hinzufügen
        for i, cat_data in enumerate(FRONTEND_CATEGORIES, 1):
            category = Category(
                id=i,
                value=cat_data["value"],
                label=cat_data["label"], 
                icon=cat_data["icon"],
                description=cat_data["description"],
                is_active=True,
                sort_order=i
            )
            session.add(category)
            print(f"✅ {cat_data['icon']} {cat_data['label']} ({cat_data['value']})")
        
        session.commit()
        print(f"🎉 {len(FRONTEND_CATEGORIES)} Kategorien erfolgreich synchronisiert!")
        
        # Verifikation
        all_categories = session.exec(select(Category)).all()
        print(f"📊 Datenbank enthält jetzt {len(all_categories)} Kategorien")
        
        return True

if __name__ == "__main__":
    try:
        sync_categories()
        print("✅ Kategorie-Synchronisation erfolgreich abgeschlossen!")
    except Exception as e:
        print(f"❌ Fehler bei der Kategorie-Synchronisation: {e}")
        sys.exit(1)
