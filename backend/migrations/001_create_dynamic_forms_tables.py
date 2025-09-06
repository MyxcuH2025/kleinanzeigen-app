#!/usr/bin/env python3
"""
Migration: Create Dynamic Forms Tables
Erstellt die Tabellen für dynamische Formulare
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, create_engine, select, text
from models_dynamic import Category, SubCategory, Attribute, AttributeOption, CategoryAttribute
from config import config
from datetime import datetime

def run_migration():
    """Führt die Migration aus"""
    print("🚀 Dynamic Forms Migration Tool")
    print("=" * 40)
    print("🚀 Starte Migration: Create Dynamic Forms Tables...")
    
    # Engine erstellen
    engine = create_engine(config.DATABASE_URL)
    
    try:
        # Tabellen erstellen
        print("📋 Erstelle neue Tabellen...")
        Category.metadata.create_all(engine)
        SubCategory.metadata.create_all(engine)
        Attribute.metadata.create_all(engine)
        AttributeOption.metadata.create_all(engine)
        CategoryAttribute.metadata.create_all(engine)
        print("✅ Migration erfolgreich abgeschlossen!")
        
        # Tabellen auflisten
        print("📊 Erstellte Tabellen:")
        print("   - categories")
        print("   - subcategories")
        print("   - attributes")
        print("   - attribute_options")
        print("   - category_attributes")
        
        # Initiale Daten einfügen (nur wenn noch keine existieren)
        print("🌱 Fülle Tabellen mit initialen Daten...")
        
        with Session(engine) as session:
            # Prüfe ob bereits Daten existieren
            existing_categories = session.exec(select(Category)).all()
            if existing_categories:
                print("   📁 Kategorien existieren bereits, überspringe initiale Daten...")
            else:
                print("   📁 Erstelle Hauptkategorien...")
                
                # Hauptkategorien
                main_categories = [
                    {
                        "name": "Autos",
                        "slug": "autos",
                        "description": "Fahrzeuge, Ersatzteile & Zubehör",
                        "icon": "/images/categories/bmw_156x90_enhanced.png",
                        "color": "#3B82F6",
                        "bg_color": "#EFF6FF",
                        "sort_order": 1
                    },
                    {
                        "name": "Kleinanzeigen",
                        "slug": "kleinanzeigen",
                        "description": "Allgemeine Kleinanzeigen",
                        "icon": "/images/categories/electronics.png",
                        "color": "#10B981",
                        "bg_color": "#ECFDF5",
                        "sort_order": 2
                    }
                ]
                
                for cat_data in main_categories:
                    # Prüfe ob Kategorie bereits existiert
                    existing = session.exec(
                        select(Category).where(Category.slug == cat_data["slug"])
                    ).first()
                    
                    if not existing:
                        category = Category(
                            name=cat_data["name"],
                            slug=cat_data["slug"],
                            description=cat_data["description"],
                            icon=cat_data["icon"],
                            color=cat_data["color"],
                            bg_color=cat_data["bg_color"],
                            sort_order=cat_data["sort_order"],
                            is_active=True
                        )
                        session.add(category)
                        print(f"      ✅ {cat_data['name']} erstellt")
                    else:
                        print(f"      ⏭️  {cat_data['name']} existiert bereits")
                
                # Unterkategorien für Autos
                print("   🚗 Erstelle Auto-Unterkategorien...")
                autos_category = session.exec(
                    select(Category).where(Category.slug == "autos")
                ).first()
                
                if autos_category:
                    auto_subcategories = [
                        {"name": "Pkw", "slug": "pkw", "sort_order": 1},
                        {"name": "Motorräder", "slug": "motorraeder", "sort_order": 2},
                        {"name": "Lkw & Nutzfahrzeuge", "slug": "lkw-nutzfahrzeuge", "sort_order": 3},
                        {"name": "Ersatzteile", "slug": "ersatzteile", "sort_order": 4},
                        {"name": "Zubehör", "slug": "zubehoer", "sort_order": 5}
                    ]
                    
                    for sub_data in auto_subcategories:
                        existing = session.exec(
                            select(SubCategory).where(
                                SubCategory.slug == sub_data["slug"],
                                SubCategory.parent_id == autos_category.id
                            )
                        ).first()
                        
                        if not existing:
                            subcategory = SubCategory(
                                name=sub_data["name"],
                                slug=sub_data["slug"],
                                parent_id=autos_category.id,
                                sort_order=sub_data["sort_order"],
                                is_active=True
                            )
                            session.add(subcategory)
                            print(f"      ✅ {sub_data['name']} erstellt")
                        else:
                            print(f"      ⏭️  {sub_data['name']} existiert bereits")
                
                # Unterkategorien für Kleinanzeigen
                print("   🏠 Erstelle Kleinanzeigen-Unterkategorien...")
                kleinanzeigen_category = session.exec(
                    select(Category).where(Category.slug == "kleinanzeigen")
                ).first()
                
                if kleinanzeigen_category:
                    kleinanzeigen_subcategories = [
                        {"name": "Elektronik", "slug": "elektronik", "sort_order": 1},
                        {"name": "Haus & Garten", "slug": "haus-garten", "sort_order": 2},
                        {"name": "Mode & Beauty", "slug": "mode-beauty", "sort_order": 3},
                        {"name": "Sport & Hobby", "slug": "sport-hobby", "sort_order": 4},
                        {"name": "Immobilien", "slug": "immobilien", "sort_order": 5}
                    ]
                    
                    for sub_data in kleinanzeigen_subcategories:
                        existing = session.exec(
                            select(SubCategory).where(
                                SubCategory.slug == sub_data["slug"],
                                SubCategory.parent_id == kleinanzeigen_category.id
                            )
                        ).first()
                        
                        if not existing:
                            subcategory = SubCategory(
                                name=sub_data["name"],
                                slug=sub_data["slug"],
                                parent_id=kleinanzeigen_category.id,
                                sort_order=sub_data["sort_order"],
                                is_active=True
                            )
                            session.add(subcategory)
                            print(f"      ✅ {sub_data['name']} erstellt")
                        else:
                            print(f"      ⏭️  {sub_data['name']} existiert bereits")
                
                # Beispield-Attribute
                print("   🔧 Erstelle Beispield-Attribute...")
                existing_attributes = session.exec(select(Attribute)).all()
                if not existing_attributes:
                    attributes = [
                        {
                            "label": "Marke",
                            "type": "select",
                            "section": "Fahrzeugdaten",
                            "is_filterable": True,
                            "is_searchable": True,
                            "order_index": 1
                        },
                        {
                            "label": "Modell",
                            "type": "select",
                            "section": "Fahrzeugdaten",
                            "is_filterable": True,
                            "is_searchable": True,
                            "order_index": 2
                        },
                        {
                            "label": "Baujahr",
                            "type": "number",
                            "section": "Fahrzeugdaten",
                            "is_filterable": True,
                            "is_searchable": False,
                            "order_index": 3
                        },
                        {
                            "label": "Kilometerstand",
                            "type": "number",
                            "section": "Fahrzeugdaten",
                            "is_filterable": True,
                            "is_searchable": False,
                            "order_index": 4
                        }
                    ]
                    
                    for attr_data in attributes:
                        attribute = Attribute(**attr_data)
                        session.add(attribute)
                        print(f"      ✅ {attr_data['label']} erstellt")
                
                session.commit()
                print("   ✅ Initiale Daten erfolgreich eingefügt!")
        
        print("🎉 Migration vollständig erfolgreich!")
        return True
        
    except Exception as e:
        print(f"❌ Migration fehlgeschlagen: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("✅ Migration erfolgreich abgeschlossen!")
    else:
        print("❌ Migration fehlgeschlagen!")
        sys.exit(1)
