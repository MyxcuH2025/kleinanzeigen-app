import sqlite3

print('=== DATENBANK-STRUKTUR PRÜFEN ===')
try:
    # Datenbank verbinden
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Tabellen auflisten
    cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
    tables = cursor.fetchall()
    
    print(f'Verfügbare Tabellen: {[table[0] for table in tables]}')
    
    # User-Tabelle suchen
    for table in tables:
        if 'user' in table[0].lower():
            print(f'User-ähnliche Tabelle gefunden: {table[0]}')
            cursor.execute(f'PRAGMA table_info({table[0]})')
            columns = cursor.fetchall()
            print(f'Spalten: {[col[1] for col in columns]}')
            
            # User-Daten anzeigen
            cursor.execute(f'SELECT id, email, first_name, last_name FROM {table[0]} LIMIT 3')
            users = cursor.fetchall()
            print(f'User-Beispiele: {users}')
    
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')
