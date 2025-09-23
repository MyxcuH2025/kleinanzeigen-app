import requests
import json

print('=== ECHTER USER-LOGIN TEST ===')
try:
    # Login mit korrektem Format
    login_data = {
        'email': 'zaurhatu@gmail.com',
        'password': 'zaur'  # Passwort aus DB
    }
    
    login_response = requests.post('http://localhost:8000/api/login', json=login_data)
    print(f'Login Status: {login_response.status_code}')
    print(f'Login Response: {login_response.text[:300]}')
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data.get('access_token')
        print(f'✅ Token erhalten: {token[:20]}...')
        
        # Test Conversations mit echtem Token
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        conv_response = requests.get('http://localhost:8000/api/conversations', headers=headers)
        print(f'Conversations Status: {conv_response.status_code}')
        print(f'Conversations Response: {conv_response.text[:300]}')
        
        if conv_response.status_code == 200:
            data = conv_response.json()
            print(f'✅ Anzahl Conversations: {len(data.get("conversations", []))}')
        else:
            print(f'❌ Conversations fehlgeschlagen: {conv_response.text}')
        
    else:
        print(f'❌ Login fehlgeschlagen: {login_response.text}')
        
except Exception as e:
    print(f'Error: {e}')
