import sqlite3
from passlib.context import CryptContext

print('=== PASSWORT-HASH PRÜFEN ===')
try:
    # Datenbank verbinden
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # User-Daten abrufen
    cursor.execute('SELECT id, email, hashed_password, first_name, last_name FROM users WHERE email = ?', ('zaurhatu@gmail.com',))
    user = cursor.fetchone()
    
    if user:
        print(f'User: {user[1]} - {user[3]} {user[4]}')
        print(f'Password Hash: {user[2]}')
        
        # Passwort-Hashing testen
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Verschiedene Passwörter testen
        test_passwords = ['zaur', 'password123', '123456', 'admin', 'test']
        
        for pwd in test_passwords:
            if pwd_context.verify(pwd, user[2]):
                print(f'✅ Passwort gefunden: "{pwd}"')
                break
        else:
            print('❌ Kein Passwort gefunden')
            
            # Hash generieren für "zaur"
            new_hash = pwd_context.hash('zaur')
            print(f'Neuer Hash für "zaur": {new_hash}')
            
            # Hash in DB aktualisieren
            cursor.execute('UPDATE users SET hashed_password = ? WHERE email = ?', (new_hash, 'zaurhatu@gmail.com'))
            conn.commit()
            print('✅ Passwort-Hash aktualisiert')
    
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')

