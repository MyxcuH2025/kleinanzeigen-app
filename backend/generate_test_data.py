#!/usr/bin/env python3
"""
Test-Daten Generator für Stories mit verschiedenen Usern
Generiert 20+ User mit verschiedenen Stories für Thumbnail-Testing
"""
import sys
import os
from pathlib import Path

# Backend-Verzeichnis zum Python-Pfad hinzufügen
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, create_engine, select
from models import User, UserRole, VerificationState
from models.story import Story, StoryMediaType
from datetime import datetime, timedelta
import random
import json

# Engine erstellen
from config import config
engine = create_engine(config.DATABASE_URL)

# Test-User-Daten
TEST_USERS = [
    {"first_name": "Anna", "last_name": "Müller", "email": "anna.mueller@test.de", "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Max", "last_name": "Schmidt", "email": "max.schmidt@test.de", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Lisa", "last_name": "Weber", "email": "lisa.weber@test.de", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Tom", "last_name": "Fischer", "email": "tom.fischer@test.de", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Sarah", "last_name": "Wagner", "email": "sarah.wagner@test.de", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "David", "last_name": "Becker", "email": "david.becker@test.de", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Emma", "last_name": "Schulz", "email": "emma.schulz@test.de", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Lukas", "last_name": "Hoffmann", "email": "lukas.hoffmann@test.de", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Julia", "last_name": "Koch", "email": "julia.koch@test.de", "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Felix", "last_name": "Richter", "email": "felix.richter@test.de", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Sophie", "last_name": "Klein", "email": "sophie.klein@test.de", "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Noah", "last_name": "Wolf", "email": "noah.wolf@test.de", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Mia", "last_name": "Schröder", "email": "mia.schroeder@test.de", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Ben", "last_name": "Neumann", "email": "ben.neumann@test.de", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Lena", "last_name": "Schwarz", "email": "lena.schwarz@test.de", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Jonas", "last_name": "Zimmermann", "email": "jonas.zimmermann@test.de", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Hannah", "last_name": "Braun", "email": "hannah.braun@test.de", "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Tim", "last_name": "Hofmann", "email": "tim.hofmann@test.de", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Laura", "last_name": "Lange", "email": "laura.lange@test.de", "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"},
    {"first_name": "Alex", "last_name": "Werner", "email": "alex.werner@test.de", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"},
]

# Test-Video-URLs (kostenlose Videos von Pexels/Unsplash)
TEST_VIDEOS = [
    "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/358160379.sd.mp4?s=8c87416da952f395f0b307f304dd901c287b9ddf&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/358160379.sd.mp4?s=8c87416da952f395f0b307f304dd901c287b9ddf&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/358160379.sd.mp4?s=8c87416da952f395f0b307f304dd901c287b9ddf&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/358160379.sd.mp4?s=8c87416da952f395f0b307f304dd901c287b9ddf&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/358160379.sd.mp4?s=8c87416da952f395f0b307f304dd901c287b9ddf&profile_id=164&oauth2_token_id=57447761",
]

# Test-Captions
TEST_CAPTIONS = [
    "Neue Anzeige online! 📱",
    "Schnäppchen des Tages! 💰",
    "Was denkt ihr? 🤔",
    "Endlich verkauft! ✅",
    "Neue Kategorie entdeckt! 🎯",
    "Kleinanzeigen ist der Hammer! 🔥",
    "Wer braucht das? 🙋‍♀️",
    "Perfekt für den Sommer! ☀️",
    "Nur heute günstiger! ⏰",
    "Mein neues Lieblingsstück! ❤️",
    "Schnell verkaufen! ⚡",
    "Qualität first! 💎",
    "Biete an! 📢",
    "Suche dringend! 🔍",
    "Tausch möglich! 🔄",
    "Versand möglich! 📦",
    "Abholung bevorzugt! 🚗",
    "Verhandlungsbasis! 💬",
    "Sofort verfügbar! ⚡",
    "Nur für kurze Zeit! ⏳",
]

def create_test_users(session: Session):
    """Erstellt Test-User in der Datenbank"""
    print("🔄 Erstelle Test-User...")
    
    created_users = []
    
    for user_data in TEST_USERS:
        # Prüfe ob User bereits existiert
        existing_user = session.exec(
            select(User).where(User.email == user_data["email"])
        ).first()
        
        if existing_user:
            print(f"  ⚠️  User {user_data['email']} existiert bereits")
            created_users.append(existing_user)
            continue
        
        # Neuen User erstellen
        user = User(
            email=user_data["email"],
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9QjKq2",  # "password"
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            avatar=user_data["avatar"],
            is_active=True,
            is_verified=True,
            role=UserRole.USER,
            verification_state=VerificationState.EMAIL_VERIFIED,
            bio=f"Test-User {user_data['first_name']} {user_data['last_name']}",
            location="Berlin, Deutschland",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_activity=datetime.utcnow()
        )
        
        session.add(user)
        created_users.append(user)
        print(f"  ✅ User {user_data['email']} erstellt")
    
    session.commit()
    print(f"✅ {len(created_users)} User erstellt/gefunden")
    return created_users

def create_test_stories(session: Session, users: list):
    """Erstellt Test-Stories für die User"""
    print("🔄 Erstelle Test-Stories...")
    
    created_stories = []
    
    for user in users:
        # 1-3 Stories pro User erstellen
        num_stories = random.randint(1, 3)
        
        for i in range(num_stories):
            # Zufällige Video-URL und Caption
            video_url = random.choice(TEST_VIDEOS)
            caption = random.choice(TEST_CAPTIONS)
            
            # Zufällige Dauer (5-30 Sekunden)
            duration = random.randint(5, 30)
            
            # Zufällige Erstellungszeit (letzte 24 Stunden)
            created_at = datetime.utcnow() - timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Story erstellen
            story = Story(
                user_id=user.id,
                media_url=video_url,
                media_type=StoryMediaType.VIDEO,
                thumbnail_url=f"https://images.unsplash.com/photo-{random.randint(1000000000, 9999999999)}?w=400&h=600&fit=crop",
                caption=caption,
                duration=duration,
                views_count=random.randint(0, 50),
                reactions_count=random.randint(0, 10),
                is_active=True,
                created_at=created_at,
                expires_at=created_at + timedelta(hours=24),
                text_overlays=json.dumps({
                    "text": f"@{user.first_name.lower()}{user.last_name.lower()}",
                    "position": {"x": 20, "y": 50},
                    "color": "#ffffff",
                    "font_size": 16
                }) if random.random() > 0.5 else None,
                sticker_overlays=json.dumps({
                    "type": "music",
                    "position": {"x": 20, "y": 100},
                    "song": f"Song by {user.first_name}"
                }) if random.random() > 0.7 else None
            )
            
            session.add(story)
            created_stories.append(story)
            print(f"  ✅ Story für {user.first_name} {user.last_name} erstellt")
    
    session.commit()
    print(f"✅ {len(created_stories)} Stories erstellt")
    return created_stories

def main():
    """Hauptfunktion - Erstellt Test-Daten"""
    print("🚀 Test-Daten Generator für Stories")
    print("=" * 50)
    
    with Session(engine) as session:
        try:
            # Test-User erstellen
            users = create_test_users(session)
            
            # Test-Stories erstellen
            stories = create_test_stories(session, users)
            
            print("\n" + "=" * 50)
            print("✅ Test-Daten erfolgreich erstellt!")
            print(f"📊 {len(users)} User")
            print(f"📊 {len(stories)} Stories")
            print("\n🌐 Jetzt Frontend testen:")
            print("   http://localhost:5177/stories")
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen der Test-Daten: {e}")
            session.rollback()
            raise

if __name__ == "__main__":
    main()
