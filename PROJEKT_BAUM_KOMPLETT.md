# 🌳 KOMPLETTER PROJEKT-BAUM - Kleinanzeigen-Plattform
*Generiert von 10 Super-Team-Experten für vollständige Übersicht*

## 📊 PROJEKT-STATISTIKEN
- **Backend**: 18 Domänen-Module, 13 Hauptmodelle, 34 Performance-Indizes
- **Frontend**: 152 Komponenten, 48 Seiten, Code-Splitting implementiert
- **Gesamt**: 400+ Dateien, 50.000+ Zeilen Code
- **Performance**: Optimiert für 40.000+ User

---

## 🏗️ HAUPTSTRUKTUR

```
kleinanzeigen/
├── 📁 backend/                    # FastAPI Backend (Python)
├── 📁 frontend/                   # React Frontend (TypeScript)
├── 📁 docs/                       # Dokumentation
├── 📁 testsprite_tests/           # Test-Suite
└── 📄 Konfigurations-Dateien
```

---

## 🔧 BACKEND-ARCHITEKTUR

### 📁 backend/
```
backend/
├── 📄 main.py                     # FastAPI App-Start, CORS, DB-Init
├── 📄 config.py                   # Konfiguration (DB, CORS, Redis)
├── 📄 requirements.txt            # Python-Dependencies
├── 📄 database.db                 # SQLite-Hauptdatenbank
├── 📄 database.db-shm             # SQLite Shared Memory
├── 📄 database.db-wal             # SQLite Write-Ahead Log
├── 📄 backend.log                 # Backend-Log-Datei
├── 📁 venv/                       # Python Virtual Environment
├── 📁 uploads/                    # User-Uploads (314 Dateien)
│   ├── 📁 jpg/ (114 Dateien)
│   ├── 📁 mp4/ (85 Dateien)
│   ├── 📁 webp/ (52 Dateien)
│   └── 📁 andere Formate
├── 📁 email_templates/            # HTML-Email-Templates
│   ├── 📄 password_reset.html
│   ├── 📄 verification.html
│   ├── 📄 verification_approved.html
│   ├── 📄 verification_rejected.html
│   └── 📄 verification_submitted.html
├── 📁 migrations/                 # Datenbank-Migrationen
│   ├── 📄 migration_runner.py
│   ├── 📄 001_create_dynamic_forms_tables.py
│   ├── 📄 001_fix_user_names.py
│   ├── 📄 002_add_last_activity.py
│   ├── 📄 003_add_highlighted_field.py
│   ├── 📄 004_add_performance_indexes.py
│   └── 📄 005_add_stories_tables.py
├── 📁 models/                     # SQLModel-Datenmodelle
│   ├── 📄 __init__.py
│   ├── 📄 user.py                 # User-Model (Hauptmodell)
│   ├── 📄 listing.py              # Anzeigen-Model
│   ├── 📄 category.py             # Kategorien-Model
│   ├── 📄 chat.py                 # Chat-Models (Conversation, Message)
│   ├── 📄 story.py                # Stories-Model
│   ├── 📄 notification.py         # Benachrichtigungen
│   ├── 📄 favorite.py             # Favoriten
│   ├── 📄 follow.py               # Follow-System
│   ├── 📄 report.py               # Meldungen
│   ├── 📄 shop.py                 # Shop-System
│   ├── 📄 template.py             # Formular-Templates
│   ├── 📄 verification.py         # Verifikation
│   ├── 📄 event.py                # Events
│   ├── 📄 user_requests.py        # User-Requests
│   └── 📄 enums.py                # Enumerations
└── 📁 app/                        # FastAPI-Anwendung
    ├── 📄 dependencies.py         # Shared Dependencies
    ├── 📁 auth/                   # Authentifizierung
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 users/                  # Benutzer-Management
    │   ├── 📄 routes.py
    │   ├── 📄 models.py
    │   └── 📄 utils.py
    ├── 📁 listings/               # Anzeigen-Management
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 categories/             # Kategorien-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 conversations/          # Chat-System
    │   ├── 📄 routes.py           # ⚠️ AKTUELLER FEHLER-BEREICH
    │   └── 📄 models.py
    ├── 📁 stories/                # Stories-System
    │   ├── 📄 routes.py
    │   ├── 📄 models.py
    │   ├── 📄 utils.py
    │   ├── 📄 media_processor.py
    │   ├── 📄 views.py
    │   ├── 📄 reactions.py
    │   ├── 📄 analytics.py
    │   ├── 📄 moderation.py
    │   ├── 📄 notifications.py
    │   ├── 📄 cleanup.py
    │   └── 📄 websocket.py
    ├── 📁 websocket/              # WebSocket-Management
    │   ├── 📄 routes.py
    │   ├── 📄 manager.py
    │   ├── 📄 connection_pool.py
    │   └── 📄 auth.py
    ├── 📁 notifications/          # Benachrichtigungen
    │   ├── 📄 routes.py
    │   ├── 📄 models.py
    │   └── 📄 utils.py
    ├── 📁 search/                 # Such-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 feed/                   # Personalisierte Feeds
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 favorites/              # Favoriten-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 follow/                 # Follow-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 reports/                # Meldungs-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 shops/                  # Shop-System
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 forms/                  # Dynamische Formulare
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 upload/                 # File-Upload
    │   ├── 📄 routes.py
    │   └── 📄 utils.py
    ├── 📁 admin/                  # Admin-Panel
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 admin_categories/       # Admin-Kategorien
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 templates/              # Email-Templates
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 ai/                     # AI-Features
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    ├── 📁 cache/                  # Caching-System
    │   ├── 📄 routes.py
    │   ├── 📄 redis.py
    │   ├── 📄 decorators.py
    │   └── 📄 utils.py
    ├── 📁 performance/            # Performance-Monitoring
    │   ├── 📄 routes.py
    │   ├── 📄 models.py
    │   └── 📄 utils.py
    ├── 📁 rate_limiting/          # Rate-Limiting
    │   ├── 📄 routes.py
    │   ├── 📄 decorators.py
    │   ├── 📄 models.py
    │   ├── 📄 redis.py
    │   └── 📄 utils.py
    ├── 📁 system/                 # System-Utilities
    │   ├── 📄 routes.py
    │   └── 📄 models.py
    └── 📁 middleware/             # Custom Middleware
        └── 📄 cors.py
```

---

## 🎨 FRONTEND-ARCHITEKTUR

### 📁 frontend/
```
frontend/
├── 📄 package.json                # Dependencies & Scripts
├── 📄 package-lock.json           # Lock-File
├── 📄 vite.config.ts              # Vite-Konfiguration
├── 📄 tailwind.config.js          # Tailwind-CSS-Konfiguration
├── 📄 tsconfig.json               # TypeScript-Konfiguration
├── 📄 eslint.config.js            # ESLint-Konfiguration
├── 📄 jest.config.js              # Jest-Test-Konfiguration
├── 📄 index.html                  # HTML-Template
├── 📁 public/                     # Statische Assets
│   ├── 📁 images/                 # Bilder (19 Dateien)
│   │   ├── 📄 noimage.jpeg        # Platzhalter-Bild
│   │   ├── 📄 logo.svg
│   │   └── 📄 andere Icons/PNGs
│   ├── 📁 videos/                 # Videos
│   ├── 📄 manifest.json           # PWA-Manifest
│   ├── 📄 sw.js                   # Service Worker
│   └── 📄 vite.svg
├── 📁 dist/                       # Build-Output
│   ├── 📁 assets/                 # Kompilierte Assets
│   ├── 📁 images/                 # Kopierte Bilder
│   ├── 📁 videos/                 # Kopierte Videos
│   ├── 📄 index.html
│   ├── 📄 manifest.json
│   └── 📄 sw.js
├── 📁 coverage/                   # Test-Coverage-Reports
├── 📁 node_modules/               # Dependencies
└── 📁 src/                        # Source-Code
    ├── 📄 main.tsx                # App-Entry-Point
    ├── 📄 App.tsx                 # Haupt-App-Komponente
    ├── 📄 App.css                 # App-Styles
    ├── 📄 index.css               # Global-Styles
    ├── 📄 theme.ts                # MUI-Theme-Konfiguration
    ├── 📄 api.ts                  # API-Client
    ├── 📄 vite-env.d.ts           # Vite-Types
    ├── 📄 setupTests.ts           # Test-Setup
    ├── 📁 components/             # Wiederverwendbare Komponenten (175 Dateien)
    │   ├── 📁 ui/                 # UI-Komponenten
    │   │   ├── 📄 Button.tsx
    │   │   ├── 📄 Card.tsx
    │   │   ├── 📄 Input.tsx
    │   │   ├── 📄 Modal.tsx
    │   │   └── 📄 andere UI-Komponenten
    │   ├── 📁 forms/              # Formular-Komponenten
    │   │   ├── 📄 CreateListing_Optimized.tsx
    │   │   ├── 📄 LoginForm.tsx
    │   │   ├── 📄 RegisterForm.tsx
    │   │   └── 📄 andere Formulare
    │   ├── 📁 layout/             # Layout-Komponenten
    │   │   ├── 📄 Header.tsx
    │   │   ├── 📄 Sidebar.tsx
    │   │   ├── 📄 Footer.tsx
    │   │   └── 📄 Navigation.tsx
    │   ├── 📁 chat/               # Chat-Komponenten
    │   │   ├── 📄 ChatInterface.tsx
    │   │   ├── 📄 MessageBubble.tsx
    │   │   ├── 📄 ChatSidebar.tsx
    │   │   └── 📄 EnhancedChatSidebar.tsx
    │   ├── 📁 listing/            # Anzeigen-Komponenten
    │   │   ├── 📄 ListingCard.tsx
    │   │   ├── 📄 ListingList.tsx
    │   │   ├── 📄 ListingGrid.tsx
    │   │   └── 📄 ListingFilters.tsx
    │   └── 📄 andere Komponenten
    ├── 📁 pages/                  # Seiten-Komponenten (48 Dateien)
    │   ├── 📄 HomePage.tsx        # Startseite
    │   ├── 📄 LoginPage.tsx       # Login-Seite
    │   ├── 📄 RegisterPage.tsx    # Registrierung
    │   ├── 📄 ChatPage.tsx        # Chat-Seite ⚠️ AKTUELLER FEHLER-BEREICH
    │   ├── 📄 ListingDetailPage.tsx # Anzeigen-Details
    │   ├── 📄 CreateListingPage.tsx # Anzeige erstellen
    │   ├── 📄 SearchResultsPage.tsx # Suchergebnisse
    │   ├── 📄 UserProfilePage.tsx # Benutzer-Profil
    │   ├── 📄 StoriesPage.tsx     # Stories-Seite
    │   ├── 📄 AdminPage.tsx       # Admin-Panel
    │   └── 📄 andere Seiten
    ├── 📁 features/               # Feature-spezifische Komponenten (38 Dateien)
    │   ├── 📁 stories/            # Stories-Feature
    │   │   ├── 📄 StoriesPage.tsx
    │   │   ├── 📄 StoryViewer.tsx
    │   │   ├── 📄 SuperTeamStoryViewer.tsx # ⚠️ AKTUELLER FEHLER-BEREICH
    │   │   ├── 📄 StoryCard.tsx
    │   │   └── 📄 StoryUpload.tsx
    │   ├── 📁 listingDetail/      # Anzeigen-Details
    │   │   ├── 📄 ListingDetailPage.tsx
    │   │   ├── 📄 ListingImages.tsx
    │   │   ├── 📄 ListingInfo.tsx
    │   │   └── 📄 ListingActions.tsx
    │   ├── 📁 chat/               # Chat-Feature
    │   │   ├── 📄 ChatInterface.tsx
    │   │   ├── 📄 MessageList.tsx
    │   │   └── 📄 MessageInput.tsx
    │   └── 📁 andere Features
    ├── 📁 services/               # API-Services (22 Dateien)
    │   ├── 📄 chatService.ts      # Chat-API ⚠️ AKTUELLER FEHLER-BEREICH
    │   ├── 📄 authService.ts      # Auth-API
    │   ├── 📄 listingService.ts   # Listing-API
    │   ├── 📄 userService.ts      # User-API
    │   ├── 📄 storiesApi.ts       # Stories-API
    │   ├── 📄 storiesWebsocket.ts # Stories-WebSocket
    │   ├── 📄 notificationService.ts # Notifications-API
    │   ├── 📄 searchService.ts    # Search-API
    │   ├── 📄 uploadService.ts    # Upload-API
    │   └── 📄 andere Services
    ├── 📁 context/                # React Context (7 Dateien)
    │   ├── 📄 AuthContext.tsx     # Auth-Context
    │   ├── 📄 ChatContext.tsx     # Chat-Context
    │   ├── 📄 StoriesContext.tsx  # Stories-Context
    │   ├── 📄 NotificationContext.tsx # Notification-Context
    │   └── 📄 andere Contexts
    ├── 📁 hooks/                  # Custom Hooks (11 Dateien)
    │   ├── 📄 useAuth.ts          # Auth-Hook
    │   ├── 📄 useChat.ts          # Chat-Hook
    │   ├── 📄 useStories.ts       # Stories-Hook
    │   ├── 📄 useWebSocket.ts     # WebSocket-Hook
    │   └── 📄 andere Hooks
    ├── 📁 utils/                  # Utility-Funktionen (29 Dateien)
    │   ├── 📄 imageUtils.ts       # Bild-Utilities ⚠️ AKTUELLER FEHLER-BEREICH
    │   ├── 📄 dateUtils.ts        # Datum-Utilities
    │   ├── 📄 formatUtils.ts      # Format-Utilities
    │   ├── 📄 validationUtils.ts  # Validierung-Utilities
    │   ├── 📄 apiUtils.ts         # API-Utilities
    │   ├── 📄 websocketUtils.ts   # WebSocket-Utilities
    │   └── 📄 andere Utilities
    ├── 📁 types/                  # TypeScript-Types (4 Dateien)
    │   ├── 📄 auth.ts             # Auth-Types
    │   ├── 📄 listing.ts          # Listing-Types
    │   ├── 📄 chat.ts             # Chat-Types
    │   └── 📄 user.ts             # User-Types
    ├── 📁 config/                 # Konfiguration (3 Dateien)
    │   ├── 📄 api.ts              # API-Config
    │   ├── 📄 websocket.ts        # WebSocket-Config
    │   └── 📄 constants.ts        # Konstanten
    ├── 📁 data/                   # Statische Daten
    │   └── 📄 categories.ts       # Kategorien-Daten
    ├── 📁 assets/                 # Assets (26 Dateien)
    │   ├── 📁 icons/              # SVG-Icons
    │   ├── 📁 images/             # Bilder
    │   └── 📁 fonts/              # Schriftarten
    ├── 📁 lib/                    # Bibliotheken
    └── 📁 adapters/               # Adapter (1 Datei)
        └── 📄 apiAdapter.ts
```

---

## 📋 DOKUMENTATION

### 📁 docs/
```
docs/
├── 📄 dynamic-forms-audit.md      # Formular-Audit
├── 📄 flexible-form-audit.md      # Flexibles Formular-Audit
├── 📄 flexible-form-fix-plan.md   # Formular-Fix-Plan
└── 📄 PR-001-schema-sync.md       # Schema-Sync PR
```

---

## 🧪 TESTING

### 📁 testsprite_tests/
```
testsprite_tests/
├── 📁 tmp/                        # Temporäre Test-Dateien
│   ├── 📄 test-results.json
│   └── 📄 coverage-report.json
└── 📄 test-config.json            # Test-Konfiguration
```

---

## ⚙️ KONFIGURATION

### Root-Level Dateien
```
kleinanzeigen/
├── 📄 README.md                   # Haupt-Dokumentation
├── 📄 docker-compose.yml          # Docker-Konfiguration
├── 📄 env.production              # Produktions-Umgebung
├── 📄 env.production.example      # Produktions-Beispiel
├── 📄 setup_production.py         # Produktions-Setup
├── 📄 start_backend.bat           # Backend-Start-Script
├── 📄 start_frontend.bat          # Frontend-Start-Script
├── 📄 MODULARISIERUNG_UEBERSICHT.md # Modularisierungs-Übersicht
├── 📄 PERFORMANCE_OPTIMIERUNGEN.md # Performance-Dokumentation
├── 📄 PRODUCTION_SETUP.md         # Produktions-Setup-Guide
├── 📄 REDIS_STRATEGIE.md          # Redis-Strategie
├── 📄 SUPER_TEAM_ROADMAP.md       # Super-Team-Roadmap
├── 📄 WEBSOCKET_CHAT_CRITICAL.md  # WebSocket-Chat-Kritisch
├── 📄 WEBSOCKET_TODO.md           # WebSocket-TODO
├── 📄 WEBSOCKET_TROUBLESHOOTING.md # WebSocket-Troubleshooting
├── 📄 CHAT_SCROLL_TROUBLESHOOTING.md # Chat-Scroll-Troubleshooting
├── 📄 CHAT_TEST_CHECKLIST.md      # Chat-Test-Checkliste
├── 📄 CHAT_WEBSOCKET_BACKUP.md    # Chat-WebSocket-Backup
├── 📄 BACKUP_FILES_README.md      # Backup-Dateien-README
└── 📄 PROJEKT_BAUM_KOMPLETT.md    # Diese Datei
```

---

## 🚨 AKTUELLE FEHLER-BEREICHE

### ⚠️ KRITISCHE DATEIEN (Chat-Fehler)
1. **`backend/app/conversations/routes.py`** - 500-Fehler bei POST /api/conversations
2. **`frontend/src/pages/ChatPage.tsx`** - Chat-UI-Integration
3. **`frontend/src/services/chatService.ts`** - API-Service-Fehler
4. **`frontend/src/features/stories/components/SuperTeamStoryViewer.tsx`** - Story-Chat-Integration
5. **`frontend/src/utils/imageUtils.ts`** - Bild-Utility-Fehler
6. **`frontend/src/features/listingDetail/ListingDetailPage.tsx`** - Listing-Chat-Integration

---

## 📊 MODULE-ÜBERSICHT

### 🔧 Backend-Module (18)
- **auth** - Authentifizierung & Autorisierung
- **users** - Benutzer-Management
- **listings** - Anzeigen-Management
- **categories** - Kategorien-System
- **conversations** - Chat-System ⚠️
- **stories** - Stories-System
- **websocket** - WebSocket-Management
- **notifications** - Benachrichtigungen
- **search** - Such-System
- **feed** - Personalisierte Feeds
- **favorites** - Favoriten-System
- **follow** - Follow-System
- **reports** - Meldungs-System
- **shops** - Shop-System
- **forms** - Dynamische Formulare
- **upload** - File-Upload
- **admin** - Admin-Panel
- **performance** - Performance-Monitoring

### 🎨 Frontend-Features (8 Hauptbereiche)
- **Stories** - Story-System mit Viewer
- **Chat** - Vollständiges Chat-System
- **Listings** - Anzeigen-Management
- **User-Profile** - Benutzer-Profile
- **Search** - Such-Funktionalität
- **Admin** - Admin-Panel
- **Forms** - Dynamische Formulare
- **Notifications** - Benachrichtigungen

---

## 🎯 PERFORMANCE-OPTIMIERUNGEN

### ✅ Implementiert
- **34 Datenbank-Indizes** für kritische Queries
- **Connection Pooling** (20 Verbindungen + 30 Overflow)
- **Code-Splitting** mit React.lazy()
- **Bundle-Optimierung** (15% Reduktion)
- **N+1 Query Problem** behoben
- **Performance-Monitoring** in Echtzeit

### 🔄 Geplant
- **Redis Caching** für häufige Daten
- **Rate Limiting** für API-Schutz
- **Full-text Search** mit Elasticsearch
- **Test-Suite** (Unit, Integration, E2E)

---

## 🔗 INTEGRATION-PUNKTE

### Chat-System-Integration
1. **Stories → Chat** - Story-Antworten erscheinen im Chat
2. **Listing-Details → Chat** - Nachrichten von Anzeigen-Details
3. **User-Profile → Chat** - Direkte Benutzer-Nachrichten
4. **WebSocket → Chat** - Echtzeit-Nachrichten

### API-Endpoints (Kritisch)
- `POST /api/conversations` - ⚠️ 500-Fehler
- `GET /api/conversations` - Chat-Liste
- `POST /api/messages` - Nachricht senden
- `WebSocket /ws/chat` - Echtzeit-Chat
- `WebSocket /ws/stories` - Story-Updates

---

*Generiert von 10 Super-Team-Experten für vollständige Projekt-Übersicht*
*Letztes Update: 18. September 2025*
*Status: 🔴 Kritische Chat-Fehler identifiziert*
