#!/usr/bin/env python3
"""
Check Stories in Database
"""
import sqlite3

def check_stories():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print('Vorhandene Tabellen:', [t[0] for t in tables])
    
    # Check stories
    if any('stories' in t[0] for t in tables):
        cursor.execute("SELECT COUNT(*) FROM stories")
        count = cursor.fetchone()[0]
        print(f'Anzahl Stories: {count}')
        
        if count > 0:
            cursor.execute("SELECT user_id, media_url, created_at FROM stories ORDER BY created_at DESC LIMIT 3")
            recent = cursor.fetchall()
            print('Neueste Stories:')
            for user_id, media_url, created_at in recent:
                print(f'  User {user_id}: {media_url} ({created_at})')
    else:
        print('Stories-Tabelle nicht gefunden')
    
    conn.close()

if __name__ == '__main__':
    check_stories()
