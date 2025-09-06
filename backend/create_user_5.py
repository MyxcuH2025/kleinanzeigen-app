#!/usr/bin/env python3

from sqlmodel import Session, create_engine
from models import User
from config import config
from passlib.context import CryptContext

def create_user_5():
    engine = create_engine(config.DATABASE_URL)
    
    # Password hashing
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    with Session(engine) as session:
        # Prüfen ob User ID 5 bereits existiert
        existing_user = session.get(User, 5)
        if existing_user:
            print("User ID 5 existiert bereits")
            return
        
        # Neuen User erstellen
        new_user = User(
            id=5,
            email="user5@example.com",
            first_name="Lisa",
            last_name="Müller",
            hashed_password=pwd_context.hash("password123"),
            is_active=True,
            is_verified=True
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        print(f"User ID 5 erfolgreich erstellt:")
        print(f"  Email: {new_user.email}")
        print(f"  Name: {new_user.first_name} {new_user.last_name}")
        print(f"  Password: password123")

if __name__ == "__main__":
    create_user_5()
