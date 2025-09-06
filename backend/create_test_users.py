#!/usr/bin/env python3
"""
Script zum Erstellen von Test-Usern
"""
from models import User
from sqlmodel import Session, select
from config import config
from sqlmodel import create_engine
from passlib.context import CryptContext
from datetime import datetime

def create_test_users():
    # Engine und Session
    engine = create_engine(config.DATABASE_URL)
    session = Session(engine)

    # Passwort-Hashing
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    # Test-User erstellen
    test_users = [
        {
            'email': 'user2@example.com',
            'first_name': 'Max',
            'last_name': 'Mustermann',
            'password': 'password123'
        },
        {
            'email': 'user3@example.com', 
            'first_name': 'Anna',
            'last_name': 'Schmidt',
            'password': 'password123'
        },
        {
            'email': 'user4@example.com',
            'first_name': 'Peter',
            'last_name': 'Weber',
            'password': 'password123'
        }
    ]

    for user_data in test_users:
        # Prüfen ob User bereits existiert
        existing_user = session.exec(select(User).where(User.email == user_data['email'])).first()
        if not existing_user:
            # Neuen User erstellen
            hashed_password = pwd_context.hash(user_data['password'])
            new_user = User(
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                hashed_password=hashed_password,
                is_active=True,
                is_verified=True,
                verification_state='EMAIL_VERIFIED',
                role='user',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(new_user)
            print(f'✅ User erstellt: {user_data["email"]} ({user_data["first_name"]} {user_data["last_name"]})')
        else:
            print(f'⚠️ User bereits vorhanden: {user_data["email"]}')

    session.commit()

    # Alle User anzeigen
    users = session.exec(select(User)).all()
    print(f'\n📊 Gesamtanzahl User: {len(users)}')
    for user in users:
        print(f'- User {user.id}: {user.email} ({user.first_name} {user.last_name})')

    session.close()

if __name__ == "__main__":
    create_test_users()
