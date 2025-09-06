#!/usr/bin/env python3

from sqlmodel import Session, select, create_engine
from models import User
from config import config

def check_user_5():
    engine = create_engine(config.DATABASE_URL)
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == 5)).first()
        if user:
            print(f"User ID 5 gefunden:")
            print(f"  Email: {user.email}")
            print(f"  First Name: {user.first_name}")
            print(f"  Last Name: {user.last_name}")
            print(f"  Is Active: {user.is_active}")
            print(f"  Created: {user.created_at}")
        else:
            print("User ID 5 nicht gefunden")
            
        # Alle User anzeigen
        all_users = session.exec(select(User)).all()
        print(f"\nAlle User in der Datenbank:")
        for u in all_users:
            print(f"  ID: {u.id}, Email: {u.email}, Name: {u.first_name} {u.last_name}")

if __name__ == "__main__":
    check_user_5()
