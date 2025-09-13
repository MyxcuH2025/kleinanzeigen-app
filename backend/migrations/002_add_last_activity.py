"""
Migration: Add last_activity column to user table
"""
import sqlite3
import os

def migrate():
    """Add last_activity column to user table"""
    db_path = "database.db"
    
    if not os.path.exists(db_path):
        print("Database not found, skipping migration")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'last_activity' not in columns:
            # Add last_activity column
            cursor.execute("ALTER TABLE user ADD COLUMN last_activity DATETIME")
            print("✅ Added last_activity column to user table")
        else:
            print("✅ last_activity column already exists")
            
        conn.commit()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
