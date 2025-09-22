# Kleinanzeigen Platform

Eine moderne Kleinanzeigen-Plattform mit React Frontend und FastAPI Backend.

## 🚀 Start-Befehle

### Backend starten
```bash
cd backend
# Falls bereits in .venv: direkt uvicorn starten
weiter mit Optimierung

# Falls nicht in .venv: erst aktivieren
# venv\Scripts\activate
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
cd backend; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

### Frontend starten
```bash
cd frontend
npm run dev
```

## 📋 Voraussetzungen

### Backend
- Python 3.8+
- Virtual Environment aktiviert
- Alle Dependencies installiert: `pip install -r requirements.txt`

### Frontend
- Node.js 16+
- npm installiert
- Dependencies installiert: `npm install`

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Dokumentation**: http://localhost:8000/docs

## 📁 Projektstruktur

```
kleinanzeigen/
├── backend/          # FastAPI Backend
│   ├── app/         # API Module
│   ├── main.py      # Hauptanwendung
│   └── requirements.txt
├── frontend/         # React Frontend
│   ├── src/         # Quellcode
│   ├── public/      # Statische Dateien
│   └── package.json
└── README.md        # Diese Datei
```

## 🔧 Entwicklung

### Backend Entwicklung
1. In `backend/` Ordner wechseln
2. Virtual Environment aktivieren: `venv\Scripts\activate`
3. Server starten: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

### Frontend Entwicklung
1. In `frontend/` Ordner wechseln
2. Dependencies installieren: `npm install`
3. Development Server starten: `npm run dev`

## 📝 Notizen

- Backend läuft auf Port 8000
- Frontend läuft auf Port 5173
- Backend muss vor Frontend gestartet werden
- Bei Problemen: Python Prozesse beenden mit `taskkill /F /IM python.exe`