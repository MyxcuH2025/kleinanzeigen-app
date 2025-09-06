# WebSocket Troubleshooting Guide

## Problem: WebSocket-Verbindungen funktionieren nicht

### Symptome:
- `WARNING: No supported WebSocket library detected`
- `INFO: GET /ws/notifications?token=... HTTP/1.1" 404 Not Found`
- `WebSocket Fehler: Connection refused`
- Nachrichten kommen nicht in Echtzeit an

### Ursachen:
1. **Backend läuft im falschen Ordner** (häufigste Ursache)
2. **Falsche Virtual Environment** ohne WebSocket-Unterstützung
3. **Uvicorn ohne WebSocket-Bibliotheken** installiert

### Lösung (Schritt-für-Schritt):

#### 1. Alle Python-Prozesse beenden
```bash
taskkill /F /IM python.exe
```

#### 2. In den richtigen Backend-Ordner wechseln
```bash
cd kleinanzeigen\backend
```

#### 3. Korrekte Virtual Environment aktivieren
```bash
venv_clean\Scripts\activate
```

#### 4. WebSocket-Unterstützung prüfen
```bash
python -c "import websockets; print('WebSockets OK:', websockets.__version__)"
```

#### 5. Backend mit WebSocket-Unterstützung starten
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Erfolgreiche WebSocket-Verbindung erkennen:
```
INFO: WebSocket /ws/notifications?token=... [accepted]
INFO:app.websocket.manager:WebSocket verbunden für User X. Aktive Verbindungen: 1
INFO:app.websocket.routes:WebSocket verbunden für User X (email@example.com)
INFO: connection open
```

### Prävention:
- **Immer im `kleinanzeigen/backend` Ordner starten**
- **Immer `venv_clean` Virtual Environment verwenden**
- **WebSocket-Bibliotheken installiert halten**: `pip install 'uvicorn[standard]'`

### Wichtige Erinnerung:
> **"du musst das backend start befehl mit cd backend machen weil wir immer im kleinanzeigen ordner sind, merke dir das für immer"** - User

### Datei erstellt: 2024-12-19
### Problem gelöst: WebSocket-Verbindungen funktionieren jetzt in Echtzeit
