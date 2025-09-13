# Vollständige Modularisierungs-Übersicht

## 🏗️ Gesamtarchitektur
- **Monorepo**: `kleinanzeigen/` mit getrenntem Backend (FastAPI) und Frontend (React/TypeScript/Vite)
- **Zusätzlich**: Skripte, Dokumentation, Build-Artefakte

---

## 🔧 Backend (FastAPI) - `kleinanzeigen/backend/`

### 📁 Einstieg & App-Komposition
- `main.py` - FastAPI Entry Point, Router-Registrierung, Middleware
- `config.py` - Konfigurationsmanagement
- `env.example` - Umgebungsvariablen-Template
- `requirements.txt` - Python-Dependencies

### 📁 Abhängigkeiten & Middleware
- `app/dependencies.py` - Gemeinsame Depends (Auth, DB-Zugriff)
- `app/middleware/activity_middleware.py` - Nutzeraktivität/Tracking

### 📁 Domänen-Module (jeweils `routes.py`)
- `app/admin/` - Admin-Funktionen
- `app/admin_categories/` - Admin-Kategorienpflege
- `app/ai/` - KI-bezogene Endpunkte
- `app/auth/` - Authentifizierung/Registrierung
- `app/categories/` - Kategorien-Management
- `app/conversations/` - Chat/Unterhaltungen
- `app/favorites/` - Favoriten-Management
- `app/feed/` - Start-/Feed-Logik
- `app/follow/` - Follow-/Beobachtungslogik
- `app/forms/` - Dynamische Formulare
- `app/listings/` - Anzeigen CRUD/Detail/Status
- `app/notifications/` - Benachrichtigungen
- `app/reports/` - Meldungen/Moderation
- `app/search/` - Suche/Filter
- `app/shops/` - Shop-/Anbieterfunktionen
- `app/system/` - System/Meta/Health
- `app/templates/` - Vorlagenverwaltung
- `app/upload/` - Upload/Medien-Handling
- `app/users/` - Nutzerprofile/Einstellungen
- `app/websocket/` - Realtime/WebSocket-Handling

### 📁 Datenmodelle
- `models/` - Zentrale ORM-Modelle
  - `user.py` - Benutzer-Modell
  - `listing.py` - Anzeigen-Modell
  - `category.py` - Kategorien-Modell
  - `chat.py` - Chat-Modell
  - `notification.py` - Benachrichtigungen
  - `shop.py` - Shop-Modell
  - `report.py` - Meldungs-Modell
  - `follow.py` - Follow-Modell
  - `favorite.py` - Favoriten-Modell
  - `verification.py` - Verifikations-Modell
  - `event.py` - Event-Modell
  - `template.py` - Template-Modell
  - `user_requests.py` - Benutzeranfragen
  - `enums.py` - Enumerationen
- `models_dynamic.py` - Dynamische Formulare/Schema
- `models.py` - ORM-Gesamtzugriff
- `migrations/` - Datenbank-Migrationen
  - `001_create_dynamic_forms_tables.py`
  - `002_add_last_activity.py`
  - `003_add_highlighted_field.py`

### 📁 E-Mail & Templates
- `email_templates/`
  - `password_reset.html`
  - `verification_approved.html`
  - `verification_rejected.html`
  - `verification_submitted.html`
  - `verification.html`

### 📁 Hilfsskripte & Utilities
- `populate_categories.py` - Kategorien-Import
- `add_real_images.py` - Bilder-Import
- `fix_listing_categories.py` - Kategorien-Fix
- `check_*.py` - API/Listing/User-Checks
- `create_test_users.py` - Testdaten-Erstellung
- `create_user_5.py` - Benutzer-Erstellung

### 📁 Daten & Uploads
- `database.db` - SQLite-Datenbank
- `uploads/` - Hochgeladene Assets (146 Dateien)

### 📁 Virtuelle Umgebungen
- `venv/` - Aktuelle Python-Umgebung
- `venv_new/` - Neue Python-Umgebung
- `venv_clean/` - Bereinigte Python-Umgebung

---

## 🎨 Frontend (React + TypeScript + Vite) - `kleinanzeigen/frontend/`

### 📁 Einstieg & Build
- `src/main.tsx` - React Entry Point
- `src/App.tsx` - Haupt-App-Komponente
- `index.html` - HTML-Shell
- `vite.config.ts` - Vite-Konfiguration
- `tsconfig*.json` - TypeScript-Konfiguration
- `tailwind.config.js` - Tailwind CSS-Konfiguration
- `postcss.config.js` - PostCSS-Konfiguration

### 📁 Theming & Styling
- `src/theme.ts` - Theme-Konfiguration
- `src/index.css` - Globale Styles
- `src/App.css` - App-spezifische Styles

### 📁 Komponenten (`src/components/`)
- 152 Komponenten (143 .tsx, 6 .ts, 3 .css)
- UI-Bibliothek mit Cards, Listen, Formularen, Widgets

### 📁 Seiten (`src/pages/`)
- 48 Seitenkomponenten
- Routen-/Seitenkomponenten

### 📁 Services & API
- `src/services/` - API-Clients, Backend-Kommunikation (22 Dateien)
- `src/api.ts` - Zentraler API-Einstieg
- `src/adapters/` - Adapterebene

### 📁 State & Hooks
- `src/context/` - Zustand/Provider, globale Stores (7 Dateien)
- `src/hooks/` - Custom Hooks (9 Dateien)

### 📁 Utilities & Types
- `src/utils/` - Hilfsfunktionen (29 Dateien)
- `src/types/` - TypeScript-Typdefinitionen (4 Dateien)
- `src/config/` - Frontend-Konfiguration (2 Dateien)

### 📁 Assets & Daten
- `src/assets/` - Icons/SVG (26 Dateien)
- `src/data/` - Statische/seeding Daten (1 Datei)

### 📁 Tests & Qualität
- `jest.config.js` - Jest-Konfiguration
- `src/setupTests.ts` - Test-Setup
- `coverage/` - Coverage-Bericht (166 HTML-Dateien)
- `eslint.config.js` - ESLint-Konfiguration
- `eslint-report.json` - ESLint-Bericht

### 📁 Öffentliche Assets
- `public/images/` - Statische Bilder (16 Dateien)
- `public/manifest.json` - PWA-Manifest
- `public/sw.js` - Service Worker

### 📁 Build-Artefakte
- `dist/` - Build-Output
- `node_modules/` - NPM-Dependencies

### 📁 Laufzeit
- `simple-server.js` - Leichter Node-Server

---

## 📋 Root & Projekt-Management - `kleinanzeigen/`

### 📁 Start-Skripte
- `start_backend.bat` - Backend-Start
- `start_frontend.bat` - Frontend-Start

### 📁 Container & Deployment
- `docker-compose.yml` - Docker-Konfiguration
- `vercel.json` - Vercel-Deployment

### 📁 Dokumentation
- `docs/` - Projekt-Dokumentation
  - `dynamic-forms-audit.md`
  - `flexible-form-audit.md`
  - `flexible-form-fix-plan.md`
  - `PR-001-schema-sync.md`
- `README.md` - Hauptdokumentation
- `BACKUP_FILES_README.md` - Backup-Dokumentation

### 📁 WebSocket & Troubleshooting
- `WEBSOCKET_CHAT_CRITICAL.md`
- `WEBSOCKET_TODO.md`
- `WEBSOCKET_TROUBLESHOOTING.md`
- `CHAT_SCROLL_TROUBLESHOOTING.md`
- `CHAT_TEST_CHECKLIST.md`
- `CHAT_WEBSOCKET_BACKUP.md`

### 📁 Testautomation
- `testsprite_tests/` - TestSprite-Tests
  - `tmp/config.json`
  - `tmp/prd_files/`

### 📁 Daten
- `kleinanzeigen.db` - Root-Kopie der Datenbank

### 📁 Legacy & Backup
- `src/components/ListingList.tsx` - Legacy-Komponente
- `src/services/` - Legacy-Services
- `Web_Socket_Problem.txt` - WebSocket-Problem-Dokumentation

---

## 🔄 Modul-Grenzen und Verantwortlichkeiten

### Backend-Architektur
- **Routing/Controller**: `app/*/routes.py`
- **Domänenmodelle**: `models/*`
- **Infrastruktur**: `dependencies.py`, Middleware
- **Datenfluss**: Router → Dependencies → Models → DB

### Frontend-Architektur
- **Präsentation**: `components/`
- **Seiten-Komposition**: `pages/`
- **Datenzugriff**: `services/`
- **State/Side-Effects**: `context/`, `hooks/`
- **Hilfen**: `utils/`, `types/`

### Integration
- **REST-API**: Frontend `services/` → Backend `routes/`
- **WebSocket**: `app/websocket/` + Frontend-Client
- **Typen**: `src/types/` spiegeln Backend-Schemata

---

## 📊 Statistiken
- **Backend-Module**: 18 Domänen-Module
- **Frontend-Komponenten**: 152 Komponenten
- **Backend-Modelle**: 13 Hauptmodelle
- **Frontend-Seiten**: 48 Seiten
- **Upload-Dateien**: 146 Assets
- **Migrationen**: 3 Datenbank-Migrationen

---

*Erstellt: $(date)*
*Projekt: Kleinanzeigen-Plattform*
