#!/usr/bin/env python3

import requests
import json

def check_api_response():
    try:
        response = requests.get('http://localhost:8000/api/listings')
        if response.status_code == 200:
            data = response.json()
            print("API Response:")
            print(json.dumps(data, indent=2))
            
            print("\n\nImage analysis:")
            for i, listing in enumerate(data):
                print(f"\nListing {i+1} (ID: {listing.get('id', 'N/A')}):")
                print(f"  Title: {listing.get('title', 'N/A')}")
                print(f"  Images: {listing.get('images', 'N/A')}")
                print(f"  Images type: {type(listing.get('images', 'N/A'))}")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_api_response()
