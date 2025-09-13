#!/usr/bin/env python3
"""
Migration Script: SQLite → PostgreSQL
"""
import os
import json
from sqlmodel import create_engine, Session, select
from sqlalchemy import text
from models import *
from config import config

def migrate_sqlite_to_postgresql():
    """
    Migriere Daten von SQLite zu PostgreSQL
    """
    print("🚀 POSTGRESQL MIGRATION STARTET...")
    
    # 1. SQLite Connection (Source)
    sqlite_engine = create_engine(config.DATABASE_URL)
    
    # 2. PostgreSQL Connection (Target)
    if not config.POSTGRES_URL:
        print("❌ POSTGRES_URL nicht gesetzt!")
        print("📝 Setze POSTGRES_URL in .env:")
        print("   POSTGRES_URL=postgresql://user:pass@host:port/database")
        return False
    
    postgres_engine = create_engine(
        config.POSTGRES_URL,
        pool_size=20,
        max_overflow=30,
        pool_timeout=30,
        pool_recycle=3600,
        pool_pre_ping=True
    )
    
    print(f"✅ SQLite: {config.DATABASE_URL}")
    print(f"✅ PostgreSQL: {config.POSTGRES_URL}")
    
    try:
        # 3. Erstelle Tabellen in PostgreSQL
        print("\n📋 Erstelle Tabellen in PostgreSQL...")
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(postgres_engine)
        print("✅ Tabellen erstellt")
        
        # 4. Migriere Daten
        with Session(sqlite_engine) as sqlite_session:
            
            # User Migration - Überspringe bereits migrierte User
            print("\n👥 Prüfe User-Migration...")
            users = sqlite_session.exec(select(User)).all()
            
            with Session(postgres_engine) as postgres_session:
                existing_users = postgres_session.exec(select(User)).all()
                existing_user_ids = {user.id for user in existing_users}
                
                new_users = [user for user in users if user.id not in existing_user_ids]
                
                if new_users:
                    for user in new_users:
                        new_user = User(
                            id=user.id,
                            email=user.email,
                            hashed_password=user.hashed_password,
                            is_active=user.is_active,
                            is_verified=user.is_verified,
                            role=user.role,
                            verification_state=user.verification_state,
                            email_verified_at=user.email_verified_at,
                            seller_verified_at=user.seller_verified_at,
                            seller_verification_reason=user.seller_verification_reason,
                            first_name=user.first_name,
                            last_name=user.last_name,
                            phone=user.phone,
                            bio=user.bio,
                            location=user.location,
                            website=user.website,
                            avatar=user.avatar,
                            preferences=user.preferences,
                            notification_settings=user.notification_settings,
                            privacy_settings=user.privacy_settings,
                            created_at=user.created_at,
                            updated_at=user.updated_at,
                            last_activity=user.last_activity
                        )
                        postgres_session.add(new_user)
                    postgres_session.commit()
                    print(f"✅ {len(new_users)} neue User migriert")
                else:
                    print(f"✅ {len(existing_users)} User bereits migriert")
            
            # Listing Migration
            print("\n📋 Migriere Listings...")
            listings = sqlite_session.exec(select(Listing)).all()
            
            with Session(postgres_engine) as postgres_session:
                for listing in listings:
                    # Erstelle neues Listing für PostgreSQL Session
                    new_listing = Listing(
                        id=listing.id,
                        title=listing.title,
                        description=listing.description,
                        price=listing.price,
                        category=listing.category,
                        condition=listing.condition,
                        location=listing.location,
                        images=listing.images,
                        attributes=listing.attributes,
                        status=listing.status,
                        highlighted=listing.highlighted,
                        views=listing.views,
                        user_id=listing.user_id,
                        created_at=listing.created_at,
                        updated_at=listing.updated_at
                    )
                    postgres_session.add(new_listing)
                postgres_session.commit()
                print(f"✅ {len(listings)} Listings migriert")
            
            # Category Migration
            print("\n📂 Migriere Categories...")
            try:
                categories = sqlite_session.exec(select(Category)).all()
                for category in categories:
                    postgres_session.add(category)
                postgres_session.commit()
                print(f"✅ {len(categories)} Categories migriert")
            except Exception as e:
                print(f"⚠️ Categories: {e}")
            
            # Notification Migration
            print("\n🔔 Migriere Notifications...")
            try:
                notifications = sqlite_session.exec(select(Notification)).all()
                for notification in notifications:
                    postgres_session.add(notification)
                postgres_session.commit()
                print(f"✅ {len(notifications)} Notifications migriert")
            except Exception as e:
                print(f"⚠️ Notifications: {e}")
            
            # Favorite Migration
            print("\n❤️ Migriere Favorites...")
            try:
                favorites = sqlite_session.exec(select(Favorite)).all()
                for favorite in favorites:
                    postgres_session.add(favorite)
                postgres_session.commit()
                print(f"✅ {len(favorites)} Favorites migriert")
            except Exception as e:
                print(f"⚠️ Favorites: {e}")
        
        print("\n🎉 MIGRATION ERFOLGREICH!")
        print("📝 Aktualisiere DATABASE_URL in .env:")
        print(f"   DATABASE_URL={config.POSTGRES_URL}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ MIGRATION FEHLGESCHLAGEN: {e}")
        return False

def verify_migration():
    """
    Verifiziere die Migration
    """
    if not config.POSTGRES_URL:
        print("❌ POSTGRES_URL nicht gesetzt!")
        return False
    
    try:
        engine = create_engine(config.POSTGRES_URL)
        with Session(engine) as session:
            # Teste User
            users = session.exec(select(User)).all()
            print(f"✅ PostgreSQL User: {len(users)}")
            
            # Teste Listings
            listings = session.exec(select(Listing)).all()
            print(f"✅ PostgreSQL Listings: {len(listings)}")
            
            # Teste Categories
            try:
                categories = session.exec(select(Category)).all()
                print(f"✅ PostgreSQL Categories: {len(categories)}")
            except:
                print("⚠️ Categories: Nicht verfügbar")
        
        return True
        
    except Exception as e:
        print(f"❌ Verifikation fehlgeschlagen: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        print("🔍 VERIFIZIERE MIGRATION...")
        verify_migration()
    else:
        migrate_sqlite_to_postgresql()
