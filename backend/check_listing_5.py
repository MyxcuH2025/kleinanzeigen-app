#!/usr/bin/env python3

from sqlmodel import Session, select, create_engine
from models import Listing
from config import config
import json

def check_listing_5():
    engine = create_engine(config.DATABASE_URL)
    with Session(engine) as session:
        listing = session.exec(select(Listing).where(Listing.id == 5)).first()
        if listing:
            print(f"Listing ID 5 Details:")
            print(f"Title: {listing.title}")
            print(f"Description: {listing.description}")
            print(f"Images (raw): {listing.images}")
            try:
                images_list = json.loads(listing.images) if listing.images else []
                print(f"Images (parsed): {images_list}")
                for i, img in enumerate(images_list):
                    print(f"  Image {i+1}: {img}")
            except Exception as e:
                print(f"Images (parse error): {e}")
            print(f"User ID: {listing.user_id}")
            print(f"Category: {listing.category}")
            print(f"Price: {listing.price}")
            print(f"Created: {listing.created_at}")
        else:
            print("Listing ID 5 nicht gefunden")

if __name__ == "__main__":
    check_listing_5()
