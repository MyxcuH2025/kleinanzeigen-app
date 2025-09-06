#!/usr/bin/env python3

from sqlmodel import Session, select, create_engine
from models import Listing
from config import config

def check_listings():
    engine = create_engine(config.DATABASE_URL)
    with Session(engine) as session:
        listings = session.exec(select(Listing)).all()
        print(f"Anzahl Listings in DB: {len(listings)}")
        print("\nListings:")
        for listing in listings:
            print(f"ID: {listing.id}, Title: {listing.title}, User: {listing.user_id}, Category: {listing.category}")

if __name__ == "__main__":
    check_listings()