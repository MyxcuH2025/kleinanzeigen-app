#!/usr/bin/env python3
"""
Script zum Befüllen der Datenbank mit Kategorien aus dem Frontend
"""
from models import Category, Subcategory, CategoryItem
from sqlmodel import Session, select
from config import config
from sqlmodel import create_engine
from datetime import datetime

# Kategorien aus dem Frontend (kopiert aus categories.ts)
categories_data = [
    {
        'value': 'auto-rad-boot',
        'label': 'Auto, Rad & Boot',
        'icon': '🚗',
        'description': 'Autos, Motorräder, Fahrräder, Boote & Zubehör',
        'subcategories': [
            {'value': 'autos', 'label': 'Autos', 'items': ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Opel', 'Ford', 'Toyota', 'Honda', 'Nissan', 'Skoda', 'Seat', 'Fiat', 'Renault', 'Peugeot', 'Citroen', 'Porsche', 'Andere']},
            {'value': 'motorraeder', 'label': 'Motorräder', 'items': ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'KTM', 'Harley-Davidson', 'Andere']},
            {'value': 'fahrraeder', 'label': 'Fahrräder', 'items': ['Mountainbike', 'Rennrad', 'Citybike', 'E-Bike', 'BMX', 'Kinderrad', 'Andere']},
            {'value': 'autoteile', 'label': 'Autoteile & Zubehör', 'items': ['Reifen', 'Felgen', 'Motor', 'Getriebe', 'Bremsen', 'Auspuff', 'Licht', 'Andere']},
            {'value': 'boote', 'label': 'Boote & Wassersport', 'items': ['Segelboot', 'Motorboot', 'Kajak', 'SUP', 'Tauchausrüstung', 'Andere']},
            {'value': 'lkw', 'label': 'LKW & Nutzfahrzeuge', 'items': ['LKW', 'Transporter', 'Anhänger', 'Landmaschinen', 'Andere']}
        ]
    },
    {
        'value': 'real-estate',
        'label': 'Immobilien',
        'icon': '🏠',
        'description': 'Wohnungen, Häuser, Gewerbe, Grundstücke',
        'subcategories': [
            {'value': 'wohnungen', 'label': 'Wohnungen', 'items': ['1-Zimmer', '2-Zimmer', '3-Zimmer', '4-Zimmer', '5+ Zimmer', 'Penthouse', 'Dachgeschoss']},
            {'value': 'haeuser', 'label': 'Häuser', 'items': ['Einfamilienhaus', 'Reihenhaus', 'Doppelhaushälfte', 'Villa', 'Bauernhaus', 'Ferienhaus']},
            {'value': 'gewerbeimmobilien', 'label': 'Gewerbeimmobilien', 'items': ['Büro', 'Laden', 'Lager', 'Produktion', 'Restaurant', 'Hotel', 'Andere']},
            {'value': 'grundstuecke', 'label': 'Grundstücke', 'items': ['Bauland', 'Ackerland', 'Wald', 'Garten', 'Andere']}
        ]
    },
    {
        'value': 'jobs',
        'label': 'Jobs',
        'icon': '💼',
        'description': 'Stellenangebote, Praktika, Ausbildung, Freelance',
        'subcategories': [
            {'value': 'ich-suche-arbeit', 'label': 'Ich suche Arbeit', 'items': ['IT & Internet', 'Büro & Verwaltung', 'Verkauf', 'Gastronomie', 'Handwerk', 'Gesundheit', 'Bildung', 'Andere']},
            {'value': 'ich-suche-mitarbeiter', 'label': 'Ich suche Mitarbeiter', 'items': ['Vollzeit', 'Teilzeit', 'Minijob', 'Praktikum', 'Ausbildung', 'Freelance', 'Andere']}
        ]
    },
    {
        'value': 'services',
        'label': 'Dienstleistungen',
        'icon': '🔧',
        'description': 'Reparaturen, Beratung, Transport, Service',
        'subcategories': [
            {'value': 'altenpflege', 'label': 'Altenpflege', 'items': ['Betreuung', 'Pflege', 'Begleitung', 'Haushaltshilfe', 'Andere']},
            {'value': 'auto-rad-boot-services', 'label': 'Auto, Rad & Boot', 'items': ['Autoreparatur', 'Fahrradreparatur', 'Bootsservice', 'TÜV', 'Andere']},
            {'value': 'babysitter-kinderbetreuung', 'label': 'Babysitter/-in & Kinderbetreuung', 'items': ['Babysitting', 'Kinderbetreuung', 'Nachmittagsbetreuung', 'Ferienbetreuung', 'Andere']},
            {'value': 'elektronik-services', 'label': 'Elektronik', 'items': ['Handy-Reparatur', 'Computer-Reparatur', 'TV-Reparatur', 'Installation', 'Andere']},
            {'value': 'haus-garten-services', 'label': 'Haus & Garten', 'items': ['Bau & Handwerk', 'Garten- & Landschaftsbau', 'Haushaltshilfe', 'Reinigungsservice', 'Reparaturen', 'Wohnungsauflösungen', 'Weitere Dienstleistungen Haus']},
            {'value': 'kuenstler-musiker', 'label': 'Künstler/-in & Musiker/-in', 'items': ['Musiker', 'Künstler', 'DJ', 'Entertainment', 'Andere']},
            {'value': 'reise-event', 'label': 'Reise & Event', 'items': ['Reiseplanung', 'Event-Organisation', 'Fotograf', 'Videograf', 'Andere']},
            {'value': 'tierbetreuung-training', 'label': 'Tierbetreuung & Training', 'items': ['Hundesitting', 'Katzensitting', 'Tiertraining', 'Tierarzt', 'Andere']},
            {'value': 'umzug-transport', 'label': 'Umzug & Transport', 'items': ['Umzug', 'Transport', 'Lieferung', 'Spedition', 'Andere']},
            {'value': 'weitere-dienstleistungen', 'label': 'Weitere Dienstleistungen', 'items': ['Beratung', 'Büroarbeiten', 'Übersetzung', 'Andere']}
        ]
    },
    {
        'value': 'personal-items',
        'label': 'Persönliche Gegenstände',
        'icon': '👕',
        'description': 'Kleidung, Schmuck, Beauty & Kosmetik',
        'subcategories': [
            {'value': 'clothing', 'label': 'Kleidung & Schuhe', 'items': ['Damenkleidung', 'Herrenkleidung', 'Kindermode', 'Damen-Schuhe', 'Herren-Schuhe', 'Accessoires', 'Andere']},
            {'value': 'jewelry', 'label': 'Schmuck & Uhren', 'items': ['Ringe', 'Ketten', 'Armbänder', 'Ohrringe', 'Uhren', 'Andere']},
            {'value': 'beauty', 'label': 'Beauty & Kosmetik', 'items': ['Parfüm', 'Kosmetik', 'Haarpflege', 'Hautpflege', 'Make-up', 'Andere']}
        ]
    },
    {
        'value': 'home-garden',
        'label': 'Haus & Garten',
        'icon': '🏡',
        'description': 'Möbel, Haushaltsgeräte, Garten, Werkzeug',
        'subcategories': [
            {'value': 'moebel', 'label': 'Möbel', 'items': ['Wohnzimmer', 'Schlafzimmer', 'Küche', 'Badezimmer', 'Büro', 'Gartenmöbel', 'Andere']},
            {'value': 'haushaltsgeraete', 'label': 'Haushaltsgeräte', 'items': ['Küchengeräte', 'Waschmaschine', 'Trockner', 'Kühlschrank', 'Geschirrspüler', 'Andere']},
            {'value': 'garten-pflanzen', 'label': 'Garten & Pflanzen', 'items': ['Gartenwerkzeug', 'Pflanzen', 'Samen', 'Dünger', 'Gartenmöbel', 'Andere']},
            {'value': 'kueche-haushalt', 'label': 'Küche & Haushalt', 'items': ['Geschirr', 'Besteck', 'Töpfe', 'Pfannen', 'Küchengeräte', 'Andere']}
        ]
    },
    {
        'value': 'elektronik',
        'label': 'Elektronik',
        'icon': '📱',
        'description': 'Smartphones, Laptops, Kameras, Gaming & mehr',
        'subcategories': [
            {'value': 'handy-telefon', 'label': 'Handy & Telefon', 'items': ['iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google Pixel', 'Andere']},
            {'value': 'notebooks', 'label': 'Notebooks', 'items': ['MacBook', 'Windows Laptop', 'Gaming Laptop', 'Business Laptop', 'Chromebook', 'Andere']},
            {'value': 'pcs', 'label': 'PCs', 'items': ['Desktop PC', 'Gaming PC', 'Workstation', 'Mini PC', 'All-in-One', 'Andere']},
            {'value': 'tablets', 'label': 'Tablets & Reader', 'items': ['iPad', 'Android Tablet', 'Windows Tablet', 'E-Reader', 'Andere']},
            {'value': 'audio-hifi', 'label': 'Audio & Hifi', 'items': ['Lautsprecher', 'Kopfhörer', 'Verstärker', 'Receiver', 'Hifi-Anlage', 'Andere']},
            {'value': 'tv-video', 'label': 'TV & Video', 'items': ['Fernseher', 'Projektor', 'Beamer', 'TV-Zubehör', 'Andere']},
            {'value': 'foto', 'label': 'Foto', 'items': ['Kamera', 'Objektiv', 'Zubehör', 'Kamera & Zubehör', 'Weiteres Foto']},
            {'value': 'konsolen', 'label': 'Konsolen', 'items': ['PlayStation', 'Xbox', 'Nintendo', 'Retro-Konsolen', 'Andere']},
            {'value': 'videospiele', 'label': 'Videospiele', 'items': ['PS4/PS5 Spiele', 'Xbox Spiele', 'Nintendo Spiele', 'PC-Spiele', 'Retro-Spiele', 'Andere']},
            {'value': 'elektronik-haushaltsgeraete', 'label': 'Haushaltsgeräte', 'items': ['Waschmaschine', 'Trockner', 'Kühlschrank', 'Geschirrspüler', 'Herd', 'Andere']},
            {'value': 'pc-zubehoer', 'label': 'PC-Zubehör & Software', 'items': ['Maus', 'Tastatur', 'Monitor', 'Software', 'Netzwerk', 'Andere']},
            {'value': 'dienstleistungen-elektronik', 'label': 'Dienstleistungen Elektronik', 'items': ['Reparatur', 'Installation', 'Beratung', 'Andere']},
            {'value': 'weitere-elektronik', 'label': 'Weitere Elektronik', 'items': ['Messgeräte', 'Laborgeräte', 'Medizintechnik', 'Andere']}
        ]
    },
    {
        'value': 'freizeit-hobby',
        'label': 'Freizeit, Hobby & Nachbarschaft',
        'icon': '⚽',
        'description': 'Fitness, Outdoor, Hobby, Freizeit, Nachbarschaft',
        'subcategories': [
            {'value': 'sport-fitness', 'label': 'Sport & Fitness', 'items': ['Fitness', 'Fußball', 'Tennis', 'Basketball', 'Schwimmen', 'Laufen', 'Andere']},
            {'value': 'musik-instrumente', 'label': 'Musik & Instrumente', 'items': ['Gitarre', 'Klavier', 'Schlagzeug', 'Violine', 'Blasinstrumente', 'Andere']},
            {'value': 'sammeln', 'label': 'Sammeln', 'items': ['Briefmarken', 'Münzen', 'Comics', 'Spielzeug', 'Andere']},
            {'value': 'outdoor', 'label': 'Outdoor & Camping', 'items': ['Camping', 'Wandern', 'Klettern', 'Angeln', 'Jagen', 'Andere']},
            {'value': 'nachbarschaft', 'label': 'Nachbarschaft', 'items': ['Gartenarbeit', 'Haushalt', 'Betreuung', 'Transport', 'Andere']}
        ]
    },
    {
        'value': 'familie-kind-baby',
        'label': 'Familie, Kind & Baby',
        'icon': '👶',
        'description': 'Baby, Kind, Schwangerschaft, Spielzeug',
        'subcategories': [
            {'value': 'baby', 'label': 'Baby', 'items': ['Kinderwagen', 'Babykleidung', 'Spielzeug', 'Möbel', 'Andere']},
            {'value': 'kind', 'label': 'Kind', 'items': ['Kinderkleidung', 'Spielzeug', 'Fahrräder', 'Schuhe', 'Andere']},
            {'value': 'schwangerschaft', 'label': 'Schwangerschaft', 'items': ['Umstandsmode', 'Stillkleidung', 'Zubehör', 'Andere']}
        ]
    },
    {
        'value': 'mode-beauty',
        'label': 'Mode & Beauty',
        'icon': '👕',
        'description': 'Kleidung, Schuhe, Accessoires, Kosmetik',
        'subcategories': [
            {'value': 'damenmode', 'label': 'Damenmode', 'items': ['Kleider', 'Hosen', 'Röcke', 'Blusen', 'Jacken', 'Andere']},
            {'value': 'herrenmode', 'label': 'Herrenmode', 'items': ['Hosen', 'Hemden', 'Jacken', 'Anzüge', 'T-Shirts', 'Andere']},
            {'value': 'schuhe', 'label': 'Schuhe', 'items': ['Damen-Schuhe', 'Herren-Schuhe', 'Sportschuhe', 'Stiefel', 'Andere']},
            {'value': 'accessoires', 'label': 'Accessoires', 'items': ['Taschen', 'Gürtel', 'Schmuck', 'Uhren', 'Andere']},
            {'value': 'beauty', 'label': 'Beauty & Kosmetik', 'items': ['Parfüm', 'Kosmetik', 'Haarpflege', 'Hautpflege', 'Andere']}
        ]
    },
    {
        'value': 'haustiere',
        'label': 'Haustiere',
        'icon': '🐕',
        'description': 'Hunde, Katzen, Vögel, Fische, Zubehör',
        'subcategories': [
            {'value': 'hunde', 'label': 'Hunde', 'items': ['Welpen', 'Erwachsene Hunde', 'Hundezubehör', 'Hundefutter', 'Andere']},
            {'value': 'katzen', 'label': 'Katzen', 'items': ['Kätzchen', 'Erwachsene Katzen', 'Katzenzubehör', 'Katzenfutter', 'Andere']},
            {'value': 'andere-tiere', 'label': 'Andere Haustiere', 'items': ['Vögel', 'Fische', 'Hamster', 'Kaninchen', 'Reptilien', 'Andere']},
            {'value': 'tierzubehoer', 'label': 'Tierzubehör', 'items': ['Futter', 'Spielzeug', 'Transportboxen', 'Bettchen', 'Andere']}
        ]
    },
    {
        'value': 'eintrittskarten-tickets',
        'label': 'Eintrittskarten & Tickets',
        'icon': '🎫',
        'description': 'Konzerte, Sport, Theater, Veranstaltungen',
        'subcategories': [
            {'value': 'konzerte', 'label': 'Konzerte', 'items': ['Rock', 'Pop', 'Klassik', 'Jazz', 'Andere']},
            {'value': 'sport', 'label': 'Sport', 'items': ['Fußball', 'Tennis', 'Basketball', 'Eishockey', 'Andere']},
            {'value': 'theater', 'label': 'Theater & Shows', 'items': ['Musical', 'Theater', 'Comedy', 'Zirkus', 'Andere']},
            {'value': 'veranstaltungen', 'label': 'Veranstaltungen', 'items': ['Messen', 'Feste', 'Partys', 'Andere']}
        ]
    },
    {
        'value': 'musik-filme-buecher',
        'label': 'Musik, Filme & Bücher',
        'icon': '📚',
        'description': 'Bücher, Musik, Filme, Zeitschriften',
        'subcategories': [
            {'value': 'buecher', 'label': 'Bücher', 'items': ['Romane', 'Fachbücher', 'Kinderbücher', 'Kochbücher', 'Andere']},
            {'value': 'musik', 'label': 'Musik', 'items': ['CDs', 'Vinyl', 'Musik-DVDs', 'Andere']},
            {'value': 'filme-serien', 'label': 'Filme & Serien', 'items': ['DVDs', 'Blu-ray', 'Streaming', 'Andere']},
            {'value': 'zeitschriften', 'label': 'Zeitschriften', 'items': ['Fachzeitschriften', 'Lifestyle', 'Nachrichten', 'Andere']}
        ]
    },
    {
        'value': 'verschenken-tauschen',
        'label': 'Verschenken & Tauschen',
        'icon': '🎁',
        'description': 'Kostenlose Angebote, Tauschgeschäfte',
        'subcategories': [
            {'value': 'verschenken', 'label': 'Verschenken', 'items': ['Kleidung', 'Möbel', 'Elektronik', 'Bücher', 'Andere']},
            {'value': 'tauschen', 'label': 'Tauschen', 'items': ['Kleidung', 'Möbel', 'Elektronik', 'Bücher', 'Andere']}
        ]
    },
    {
        'value': 'unterricht-kurse',
        'label': 'Unterricht & Kurse',
        'icon': '🎓',
        'description': 'Sprachen, Musik, Sport, Computer-Kurse',
        'subcategories': [
            {'value': 'sprachen', 'label': 'Sprachen', 'items': ['Englisch', 'Französisch', 'Spanisch', 'Italienisch', 'Andere']},
            {'value': 'musik', 'label': 'Musik', 'items': ['Gitarre', 'Klavier', 'Gesang', 'Schlagzeug', 'Andere']},
            {'value': 'sport', 'label': 'Sport', 'items': ['Fitness', 'Yoga', 'Tanz', 'Kampfsport', 'Andere']},
            {'value': 'computer', 'label': 'Computer & IT', 'items': ['Programmierung', 'Webdesign', 'Office', 'Andere']}
        ]
    }
]

def populate_categories():
    """Kategorien in die Datenbank einfügen"""
    # Engine und Session
    engine = create_engine(config.DATABASE_URL)
    session = Session(engine)
    
    try:
        # Bestehende Kategorien löschen (für sauberen Import)
        print("🗑️ Lösche bestehende Kategorien...")
        # Items löschen
        items = session.exec(select(CategoryItem)).all()
        for item in items:
            session.delete(item)
        
        # Subcategories löschen
        subcategories = session.exec(select(Subcategory)).all()
        for sub in subcategories:
            session.delete(sub)
        
        # Categories löschen
        categories = session.exec(select(Category)).all()
        for cat in categories:
            session.delete(cat)
        
        session.commit()
        
        print("📝 Erstelle neue Kategorien...")
        
        for i, cat_data in enumerate(categories_data):
            # Hauptkategorie erstellen
            category = Category(
                value=cat_data['value'],
                label=cat_data['label'],
                icon=cat_data['icon'],
                description=cat_data['description'],
                sort_order=i,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(category)
            session.flush()  # Um die ID zu bekommen
            
            print(f"✅ Kategorie erstellt: {category.label}")
            
            # Unterkategorien erstellen
            for j, sub_data in enumerate(cat_data['subcategories']):
                subcategory = Subcategory(
                    category_id=category.id,
                    value=sub_data['value'],
                    label=sub_data['label'],
                    sort_order=j,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(subcategory)
                session.flush()  # Um die ID zu bekommen
                
                print(f"  ✅ Unterkategorie erstellt: {subcategory.label}")
                
                # Items erstellen
                for k, item in enumerate(sub_data['items']):
                    category_item = CategoryItem(
                        subcategory_id=subcategory.id,
                        value=item.lower().replace(' ', '-').replace('&', 'und'),
                        label=item,
                        sort_order=k,
                        is_active=True,
                        created_at=datetime.utcnow()
                    )
                    session.add(category_item)
        
        session.commit()
        print("🎉 Alle Kategorien erfolgreich erstellt!")
        
        # Statistiken anzeigen
        categories_count = len(session.exec(select(Category)).all())
        subcategories_count = len(session.exec(select(Subcategory)).all())
        items_count = len(session.exec(select(CategoryItem)).all())
        
        print(f"\n📊 Statistiken:")
        print(f"- Hauptkategorien: {categories_count}")
        print(f"- Unterkategorien: {subcategories_count}")
        print(f"- Items: {items_count}")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Fehler beim Erstellen der Kategorien: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    populate_categories()
