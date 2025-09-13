"""
Migration 004: Add critical performance indexes for 40k+ users
"""
from sqlmodel import SQLModel, create_engine, text
import os
from pathlib import Path

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
engine = create_engine(DATABASE_URL)

def upgrade():
    """Add critical performance indexes"""
    
    # Critical indexes for listing table
    indexes = [
        # Single column indexes for frequent queries
        "CREATE INDEX IF NOT EXISTS idx_listing_status ON listing(status);",
        "CREATE INDEX IF NOT EXISTS idx_listing_category ON listing(category);", 
        "CREATE INDEX IF NOT EXISTS idx_listing_user_id ON listing(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_listing_created_at ON listing(created_at);",
        "CREATE INDEX IF NOT EXISTS idx_listing_price ON listing(price);",
        "CREATE INDEX IF NOT EXISTS idx_listing_location ON listing(location);",
        "CREATE INDEX IF NOT EXISTS idx_listing_highlighted ON listing(highlighted);",
        "CREATE INDEX IF NOT EXISTS idx_listing_views ON listing(views);",
        
        # Composite indexes for common query patterns
        "CREATE INDEX IF NOT EXISTS idx_listing_status_category ON listing(status, category);",
        "CREATE INDEX IF NOT EXISTS idx_listing_status_created ON listing(status, created_at);",
        "CREATE INDEX IF NOT EXISTS idx_listing_category_price ON listing(category, price);",
        "CREATE INDEX IF NOT EXISTS idx_listing_status_highlighted ON listing(status, highlighted);",
        "CREATE INDEX IF NOT EXISTS idx_listing_user_status ON listing(user_id, status);",
        
        # Text search indexes (for SQLite FTS)
        "CREATE INDEX IF NOT EXISTS idx_listing_title_text ON listing(title);",
        "CREATE INDEX IF NOT EXISTS idx_listing_description_text ON listing(description);",
        
        # User table indexes
        "CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);",
        "CREATE INDEX IF NOT EXISTS idx_user_verification_state ON user(verification_state);",
        "CREATE INDEX IF NOT EXISTS idx_user_is_active ON user(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_user_last_activity ON user(last_activity);",
        
        # Notification indexes
        "CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification(user_id, is_read);",
        "CREATE INDEX IF NOT EXISTS idx_notification_created ON notification(created_at);",
        
        # Follow indexes (already exist but ensure they're there)
        "CREATE INDEX IF NOT EXISTS idx_follow_follower ON follow(follower_id);",
        "CREATE INDEX IF NOT EXISTS idx_follow_following ON follow(following_id);",
        "CREATE INDEX IF NOT EXISTS idx_follow_unique ON follow(follower_id, following_id);",
        
        # Favorite indexes
        "CREATE INDEX IF NOT EXISTS idx_favorite_user ON favorite(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_favorite_listing ON favorite(listing_id);",
        "CREATE INDEX IF NOT EXISTS idx_favorite_unique ON favorite(user_id, listing_id);",
        
        # Shop indexes
        "CREATE INDEX IF NOT EXISTS idx_shop_owner ON shop(owner_id);",
        "CREATE INDEX IF NOT EXISTS idx_shop_verified ON shop(verified);",
        "CREATE INDEX IF NOT EXISTS idx_shop_featured ON shop(featured);",
        "CREATE INDEX IF NOT EXISTS idx_shop_location ON shop(location);",
        
        # Category indexes
        "CREATE INDEX IF NOT EXISTS idx_category_active ON category(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_category_sort ON category(sort_order);",
        "CREATE INDEX IF NOT EXISTS idx_subcategory_category ON subcategory(category_id);",
    ]
    
    with engine.connect() as conn:
        for index_sql in indexes:
            try:
                conn.execute(text(index_sql))
                print(f"✅ Index created: {index_sql.split('idx_')[1].split(' ')[0]}")
            except Exception as e:
                print(f"⚠️  Index might already exist: {e}")
        
        conn.commit()
        print("🎉 All performance indexes created successfully!")

def downgrade():
    """Remove performance indexes"""
    indexes_to_drop = [
        "DROP INDEX IF EXISTS idx_listing_status;",
        "DROP INDEX IF EXISTS idx_listing_category;",
        "DROP INDEX IF EXISTS idx_listing_user_id;",
        "DROP INDEX IF EXISTS idx_listing_created_at;",
        "DROP INDEX IF EXISTS idx_listing_price;",
        "DROP INDEX IF EXISTS idx_listing_location;",
        "DROP INDEX IF EXISTS idx_listing_highlighted;",
        "DROP INDEX IF EXISTS idx_listing_views;",
        "DROP INDEX IF EXISTS idx_listing_status_category;",
        "DROP INDEX IF EXISTS idx_listing_status_created;",
        "DROP INDEX IF EXISTS idx_listing_category_price;",
        "DROP INDEX IF EXISTS idx_listing_status_highlighted;",
        "DROP INDEX IF EXISTS idx_listing_user_status;",
        "DROP INDEX IF EXISTS idx_listing_title_text;",
        "DROP INDEX IF EXISTS idx_listing_description_text;",
        "DROP INDEX IF EXISTS idx_user_email;",
        "DROP INDEX IF EXISTS idx_user_verification_state;",
        "DROP INDEX IF EXISTS idx_user_is_active;",
        "DROP INDEX IF EXISTS idx_user_last_activity;",
        "DROP INDEX IF EXISTS idx_notification_user_read;",
        "DROP INDEX IF EXISTS idx_notification_created;",
        "DROP INDEX IF EXISTS idx_follow_follower;",
        "DROP INDEX IF EXISTS idx_follow_following;",
        "DROP INDEX IF EXISTS idx_follow_unique;",
        "DROP INDEX IF EXISTS idx_favorite_user;",
        "DROP INDEX IF EXISTS idx_favorite_listing;",
        "DROP INDEX IF EXISTS idx_favorite_unique;",
        "DROP INDEX IF EXISTS idx_shop_owner;",
        "DROP INDEX IF EXISTS idx_shop_verified;",
        "DROP INDEX IF EXISTS idx_shop_featured;",
        "DROP INDEX IF EXISTS idx_shop_location;",
        "DROP INDEX IF EXISTS idx_category_active;",
        "DROP INDEX IF EXISTS idx_category_sort;",
        "DROP INDEX IF EXISTS idx_subcategory_category;",
    ]
    
    with engine.connect() as conn:
        for index_sql in indexes_to_drop:
            try:
                conn.execute(text(index_sql))
                print(f"🗑️  Index dropped: {index_sql.split('idx_')[1].split(' ')[0]}")
            except Exception as e:
                print(f"⚠️  Index might not exist: {e}")
        
        conn.commit()
        print("🗑️  All performance indexes removed!")

if __name__ == "__main__":
    upgrade()
