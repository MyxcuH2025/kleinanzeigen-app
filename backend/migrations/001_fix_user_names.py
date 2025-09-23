#!/usr/bin/env python3
"""
Migration 001: Fix User Names
- Setzt Standard-Namen für alle User ohne Namen
- Deployment-ready Lösung für User-Namen Problem
"""
import sqlite3
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def upgrade():
    """Migration ausführen: Setze Standard-Namen für User ohne Namen"""
    db_path = Path("database.db")
    if not db_path.exists():
        logger.warning("Database nicht gefunden - Migration übersprungen")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Prüfe aktuelle User ohne Namen
        cursor.execute("SELECT COUNT(*) FROM users WHERE first_name IS NULL OR first_name = ''")
        count_before = cursor.fetchone()[0]
        logger.info(f"User ohne Namen vor Migration: {count_before}")
        
        # Setze Standard-Namen für User ohne Namen
        cursor.execute("""
            UPDATE users 
            SET first_name = 'User', last_name = '' 
            WHERE first_name IS NULL OR first_name = ''
        """)
        
        rows_updated = cursor.rowcount
        conn.commit()
        
        # Verifikation
        cursor.execute("SELECT COUNT(*) FROM users WHERE first_name IS NULL OR first_name = ''")
        count_after = cursor.fetchone()[0]
        
        logger.info(f"✅ Migration 001 erfolgreich:")
        logger.info(f"   - {rows_updated} User aktualisiert")
        logger.info(f"   - User ohne Namen nach Migration: {count_after}")
        
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration 001 fehlgeschlagen: {e}")
        return False

def downgrade():
    """Migration rückgängig machen (nicht empfohlen)"""
    logger.warning("Migration 001 Downgrade nicht empfohlen - User-Namen würden verloren gehen")
    return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    upgrade()
