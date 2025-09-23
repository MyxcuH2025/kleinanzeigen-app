#!/usr/bin/env python3
"""
Check User Avatar in Database
"""
import sqlite3

def check_user_avatar():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Check user data
    cursor.execute('SELECT id, email, first_name, last_name, avatar FROM users WHERE email LIKE "%zaur%" OR first_name LIKE "%zaur%"')
    users = cursor.fetchall()
    print('User-Daten (zaur):')
    for user in users:
        print(f'  ID: {user[0]}, Email: {user[1]}, Name: {user[2]} {user[3]}, Avatar: {user[4]}')
    
    # Check all users
    cursor.execute('SELECT id, email, first_name, last_name, avatar FROM users LIMIT 10')
    all_users = cursor.fetchall()
    print('\nAlle User (Top 10):')
    for user in all_users:
        print(f'  ID: {user[0]}, Email: {user[1]}, Name: {user[2]} {user[3]}, Avatar: {user[4]}')
    
    conn.close()

if __name__ == '__main__':
    check_user_avatar()
