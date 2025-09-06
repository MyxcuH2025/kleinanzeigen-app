#!/usr/bin/env python3
"""
Script zum Prüfen der Kategorien in Listings
"""
from models import Listing
from sqlmodel import Session, select
from config import config
from sqlmodel import create_engine

def check_listing_categories():
    # Engine und Session
    engine = create_engine(config.DATABASE_URL)
    session = Session(engine)

    # Alle Listings abrufen
    listings = session.exec(select(Listing)).all()
    print(f'Anzahl Listings: {len(listings)}')
    
    for listing in listings:
        print(f'- {listing.title}: category="{listing.category}"')

    session.close()

if __name__ == "__main__":
    check_listing_categories()
