"""
Migration: Add highlighted field to listings table
"""
import sqlite3
import os

def upgrade():
    """Add highlighted field to listings table"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add highlighted column to listings table
        cursor.execute("""
            ALTER TABLE listing 
            ADD COLUMN highlighted BOOLEAN DEFAULT 0
        """)
        
        conn.commit()
        print("✅ highlighted field added to listings table")
        
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("ℹ️ highlighted field already exists")
        else:
            print(f"❌ Error adding highlighted field: {e}")
            raise
    finally:
        conn.close()

def downgrade():
    """Remove highlighted field from listings table"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
        # This is a simplified version - in production you'd want a more sophisticated approach
        
        # Get table structure
        cursor.execute("PRAGMA table_info(listing)")
        columns = cursor.fetchall()
        
        # Create new table without highlighted column
        create_sql = """
        CREATE TABLE listing_new (
            id INTEGER PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description VARCHAR(2000) NOT NULL,
            category VARCHAR(50) NOT NULL,
            condition VARCHAR(50),
            location VARCHAR(100) NOT NULL,
            price FLOAT,
            attributes VARCHAR NOT NULL DEFAULT '{}',
            images VARCHAR NOT NULL DEFAULT '[]',
            status VARCHAR NOT NULL DEFAULT 'active',
            views INTEGER NOT NULL DEFAULT 0,
            user_id INTEGER NOT NULL,
            shop_id INTEGER,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user(id),
            FOREIGN KEY(shop_id) REFERENCES shop(id)
        )
        """
        
        cursor.execute(create_sql)
        
        # Copy data (excluding highlighted column)
        cursor.execute("""
            INSERT INTO listing_new 
            SELECT id, title, description, category, condition, location, price, 
                   attributes, images, status, views, user_id, shop_id, created_at, updated_at
            FROM listing
        """)
        
        # Drop old table and rename new one
        cursor.execute("DROP TABLE listing")
        cursor.execute("ALTER TABLE listing_new RENAME TO listing")
        
        conn.commit()
        print("✅ highlighted field removed from listings table")
        
    except Exception as e:
        print(f"❌ Error removing highlighted field: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()
