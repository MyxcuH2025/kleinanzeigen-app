#!/usr/bin/env python3
import sqlite3

def migrate_database():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    print("🔄 Starte Datenbank-Migration...")
    
    # Prüfe ob stories Tabelle existiert
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='stories'")
    result = cursor.fetchone()
    
    if not result:
        print("❌ stories Tabelle existiert nicht!")
        conn.close()
        return
    
    print("✅ stories Tabelle gefunden")
    
    # Prüfe aktuelle Spalten
    cursor.execute('PRAGMA table_info(stories)')
    columns = [column[1] for column in cursor.fetchall()]
    print(f"📋 Aktuelle Spalten: {columns}")
    
    # Füge text_overlays hinzu falls nicht vorhanden
    if 'text_overlays' not in columns:
        try:
            cursor.execute('ALTER TABLE stories ADD COLUMN text_overlays TEXT')
            print("✅ text_overlays Spalte hinzugefügt")
        except Exception as e:
            print(f"❌ Fehler beim Hinzufügen von text_overlays: {e}")
    else:
        print("✅ text_overlays Spalte bereits vorhanden")
    
    # Füge sticker_overlays hinzu falls nicht vorhanden  
    if 'sticker_overlays' not in columns:
        try:
            cursor.execute('ALTER TABLE stories ADD COLUMN sticker_overlays TEXT')
            print("✅ sticker_overlays Spalte hinzugefügt")
        except Exception as e:
            print(f"❌ Fehler beim Hinzufügen von sticker_overlays: {e}")
    else:
        print("✅ sticker_overlays Spalte bereits vorhanden")
    
    # Prüfe finale Spalten
    cursor.execute('PRAGMA table_info(stories)')
    final_columns = [column[1] for column in cursor.fetchall()]
    print(f"📋 Finale Spalten: {final_columns}")
    
    conn.commit()
    conn.close()
    
    print("✅ Datenbank-Migration erfolgreich abgeschlossen!")

if __name__ == "__main__":
    migrate_database()
