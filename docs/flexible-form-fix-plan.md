# Flexible Formular Fix-Plan

**Datum:** $(date)  
**Status:** Plan erstellt  
**Version:** 1.0  

## 🎯 Übersicht

Dieser Plan beschreibt die konkreten Maßnahmen zur Behebung der im Audit identifizierten Probleme. Alle Änderungen folgen dem "oyl ye" Workflow: **saubere, kleine Schritte, nichts brechen**.

## 🚨 P0 - Kritisch (Bug/Bruchgefahr)

### 1. Schema-Synchronisation FE/BE
**Ziel:** Frontend kann Backend-Schema korrekt verarbeiten  
**Betroffene Dateien:**
- `frontend/src/services/dynamicFormsService.ts`
- `frontend/src/components/DynamicForm.tsx`

**Maßnahmen:**
1. **Frontend-Typen anpassen:**
   ```typescript
   // Vorher: Hardcodierte Strings
   section: 'specs' | 'additional' | 'details'
   
   // Nachher: Backend-Enum-Werte
   section: 'about_item' | 'specs' | 'about_house' | 'additional' | 'shipping' | 'warranty'
   ```

2. **Sektionen-Mapping in DynamicForm.tsx:**
   ```typescript
   const getSectionLabel = (section: string) => {
     const labels = {
       'about_item': 'Über den Artikel',
       'specs': 'Spezifikationen', 
       'about_house': 'Über das Haus',
       'additional': 'Zusätzliche Informationen',
       'shipping': 'Versand & Abholung',
       'warranty': 'Garantie & Service'
     };
     return labels[section] || section;
   };
   ```

**Zeitaufwand:** 2-3 Stunden  
**Risiko:** Niedrig (nur Typen-Änderungen)  
**Abhängigkeiten:** Keine  

### 2. `visible_if` Conditional Logic implementieren
**Ziel:** Abhängige Felder werden korrekt angezeigt/versteckt  
**Betroffene Dateien:**
- `frontend/src/components/DynamicForm.tsx`
- `frontend/src/utils/conditionalLogic.ts` (neu)

**Maßnahmen:**
1. **Utility-Funktion für Conditional Logic:**
   ```typescript
   // utils/conditionalLogic.ts
   export const evaluateVisibleIf = (
     condition: string, 
     formValues: Record<string, any>
   ): boolean => {
     try {
       const parsed = JSON.parse(condition);
       // Einfache Bedingungsauswertung implementieren
       return evaluateCondition(parsed, formValues);
     } catch {
       return true; // Fallback: immer anzeigen
     }
   };
   ```

2. **Integration in DynamicForm:**
   ```typescript
   const shouldShowField = (field: FormFieldSchema) => {
     if (!field.visible_if) return true;
     return evaluateVisibleIf(field.visible_if, formValues);
   };
   ```

**Zeitaufwand:** 4-6 Stunden  
**Risiko:** Mittel (neue Logik)  
**Abhängigkeiten:** Schema-Synchronisation  

### 3. `order_index` vollständig synchronisieren
**Ziel:** Felder werden in korrekter Reihenfolge angezeigt  
**Betroffene Dateien:**
- `frontend/src/services/dynamicFormsService.ts`
- `frontend/src/components/DynamicForm.tsx`

**Maßnahmen:**
1. **FormFieldSchema Interface erweitern:**
   ```typescript
   export interface FormFieldSchema {
     // ... bestehende Felder
     order_index: number; // Hinzufügen
   }
   ```

2. **Sortierung in DynamicForm korrigieren:**
   ```typescript
   .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
   ```

**Zeitaufwand:** 1-2 Stunden  
**Risiko:** Sehr niedrig  
**Abhängigkeiten:** Keine  

## ⚠️ P1 - Struktur/UX

### 4. Server-Side Filter implementieren
**Ziel:** Filter werden serverseitig verarbeitet, nicht clientseitig "gefaked"  
**Betroffene Dateien:**
- `backend/main.py` (neue Endpoints)
- `frontend/src/services/dynamicFormsService.ts`
- `frontend/src/components/SearchBar.tsx`

**Maßnahmen:**
1. **Backend: Neuer Filter-Endpoint:**
   ```python
   @app.post("/api/dynamic/filter")
   async def filter_listings_by_attributes(
       filters: Dict[str, Any],
       category_id: int,
       session: Session = Depends(get_session)
   ):
       # Dynamische Filter-Logik implementieren
       pass
   ```

2. **Frontend: Filter-Service erweitern:**
   ```typescript
   async filterByAttributes(
     categoryId: number, 
     filters: Record<string, any>
   ): Promise<Listing[]> {
     return this.post(`/api/dynamic/filter?category_id=${categoryId}`, filters);
   }
   ```

**Zeitaufwand:** 8-12 Stunden  
**Risiko:** Mittel (neue Backend-Logik)  
**Abhängigkeiten:** P0-Fixes  

### 5. Validierung vereinheitlichen
**Ziel:** Gleiche Validierungsregeln in FE und BE  
**Betroffene Dateien:**
- `frontend/src/utils/validation.ts` (neu)
- `frontend/src/components/DynamicForm.tsx`

**Maßnahmen:**
1. **Client-Side Validierung implementieren:**
   ```typescript
   // utils/validation.ts
   export const validateField = (
     field: FormFieldSchema, 
     value: any
   ): string | null => {
     // Gleiche Regeln wie Backend
     if (field.required && !value) {
       return `${field.label} ist erforderlich`;
     }
     // Weitere Validierungen...
   };
   ```

2. **In DynamicForm integrieren:**
   ```typescript
   const validateForm = (): boolean => {
     const errors: Record<string, string> = {};
     formSchema.fields.forEach(field => {
       const error = validateField(field, formValues[field.key]);
       if (error) errors[field.key] = error;
     });
     setValidationErrors(errors);
     return Object.keys(errors).length === 0;
   };
   ```

**Zeitaufwand:** 6-8 Stunden  
**Risiko:** Niedrig  
**Abhängigkeiten:** P0-Fixes  

### 6. i18n-System einführen
**Ziel:** Übersetzungsschlüssel für alle Labels  
**Betroffene Dateien:**
- `frontend/src/locales/` (neu)
- `frontend/src/components/DynamicForm.tsx`
- `frontend/src/services/dynamicFormsService.ts`

**Maßnahmen:**
1. **Übersetzungsdateien erstellen:**
   ```json
   // locales/de.json
   {
     "sections": {
       "about_item": "Über den Artikel",
       "specs": "Spezifikationen"
     },
     "common": {
       "required": "erforderlich",
       "save": "Speichern"
     }
   }
   ```

2. **i18n-Hook implementieren:**
   ```typescript
   const useTranslation = () => {
     const [locale, setLocale] = useState('de');
     const t = (key: string) => translations[locale][key] || key;
     return { t, locale, setLocale };
   };
   ```

**Zeitaufwand:** 8-10 Stunden  
**Risiko:** Niedrig  
**Abhängigkeiten:** P0-Fixes  

## 🔧 P2 - DX/Tests

### 7. Test-Suite implementieren
**Ziel:** 90%+ Coverage, Happy-Path E2E grün  
**Betroffene Dateien:**
- `backend/tests/test_dynamic_forms.py` (neu)
- `frontend/src/components/__tests__/DynamicForm.test.tsx` (neu)
- `e2e/dynamic-form.spec.ts` (neu)

**Maßnahmen:**
1. **Backend: FastAPI TestClient:**
   ```python
   def test_get_category_form_schema():
       response = client.get("/api/dynamic/forms/1")
       assert response.status_code == 200
       # Weitere Assertions...
   ```

2. **Frontend: React Testing Library:**
   ```typescript
   test('renders form fields correctly', () => {
     render(<DynamicForm categoryId={1} onSubmit={mockOnSubmit} />);
     expect(screen.getByText('Marke')).toBeInTheDocument();
   });
   ```

3. **E2E: Playwright:**
   ```typescript
   test('complete form submission flow', async ({ page }) => {
     await page.goto('/create-listing');
     await page.selectOption('[name="category"]', '1');
     // Weitere Schritte...
   });
   ```

**Zeitaufwand:** 12-16 Stunden  
**Risiko:** Niedrig  
**Abhängigkeiten:** P1-Fixes  

### 8. Dead Code entfernen & Bundle optimieren
**Ziel:** Sauberer Code, optimierte Bundle-Größe  
**Betroffene Dateien:**
- Alle `CreateListing*` Varianten
- Hardcodierte Kategorien in Backend
- Unbenutzte Imports/Assets

**Maßnahmen:**
1. **Doppelte Komponenten konsolidieren:**
   - `CreateListing.tsx` als Hauptkomponente
   - Andere Varianten entfernen
   - Imports aktualisieren

2. **Backend bereinigen:**
   - `CATEGORIES` Dictionary entfernen
   - Alte Endpoints deprecaten
   - Unbenutzte Imports entfernen

3. **Bundle-Analyse:**
   ```bash
   npm run build -- --analyze
   # Große Dependencies identifizieren
   ```

**Zeitaufwand:** 4-6 Stunden  
**Risiko:** Niedrig  
**Abhängigkeiten:** Alle vorherigen Fixes  

### 9. Performance-Optimierung
**Ziel:** Schnelle Ladezeiten, effiziente Filter  
**Betroffene Dateien:**
- `backend/models_dynamic.py`
- `backend/migrations/` (neue Indizes)

**Maßnahmen:**
1. **Datenbank-Indizes:**
   ```sql
   -- Neue Migration
   CREATE INDEX idx_attributes_filterable ON attributes(is_filterable);
   CREATE INDEX idx_category_attributes_order ON category_attributes(order_index);
   ```

2. **Frontend-Optimierung:**
   - `React.memo` für statische Komponenten
   - `useCallback` für Event-Handler
   - Lazy Loading für große Komponenten

**Zeitaufwand:** 6-8 Stunden  
**Risiko:** Niedrig  
**Abhängigkeiten:** P1-Fixes  

## 📅 Zeitplan

### Woche 1: P0-Fixes
- **Tag 1-2:** Schema-Synchronisation
- **Tag 3-4:** `visible_if` implementieren  
- **Tag 5:** `order_index` korrigieren

### Woche 2: P1-Fixes
- **Tag 1-3:** Server-Side Filter
- **Tag 4-5:** Validierung vereinheitlichen

### Woche 3: P1-Fixes (Fortsetzung)
- **Tag 1-3:** i18n-System
- **Tag 4-5:** Testing & Bugfixes

### Woche 4: P2-Fixes
- **Tag 1-3:** Test-Suite
- **Tag 4-5:** Dead Code entfernen & Performance

## 🚀 Deployment-Strategie

### Phase 1: P0-Fixes (Sofort)
- **Branch:** `fix/schema-sync`
- **Deployment:** Nach jedem Fix einzeln
- **Rollback:** Einfach (nur Typen-Änderungen)

### Phase 2: P1-Fixes (Woche 2-3)
- **Branch:** `feature/server-side-filters`
- **Deployment:** Nach Feature-Komplettierung
- **Rollback:** Mittelschwer (neue Backend-Logik)

### Phase 3: P2-Fixes (Woche 4)
- **Branch:** `feature/test-suite`
- **Deployment:** Nach Test-Abschluss
- **Rollback:** Einfach (nur Tests/Performance)

## ✅ Definition of Done

### Für jeden Fix:
- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code Review abgeschlossen
- [ ] Dokumentation aktualisiert
- [ ] Keine Regressionen

### Für das Gesamtsystem:
- [ ] Formular rendert **ausschließlich** aus Kategorien-Schema
- [ ] Gleiche Required/Type/Options-Regeln in FE & BE
- [ ] Suche liefert identische Ergebnisse bei gleichen Filtern
- [ ] Bestehende Listings bleiben sichtbar/editierbar
- [ ] 90%+ Feld-Coverage in Unit-Tests
- [ ] Happy-Path E2E grün

## 🔄 Rollback-Plan

### Schema-Synchronisation
- Frontend-Typen auf vorherige Version zurücksetzen
- Keine Datenbank-Änderungen

### `visible_if` Logic
- Feature-Flag einführen
- Bei Problemen: `visible_if` ignorieren, alle Felder anzeigen

### Server-Side Filter
- Fallback auf clientseitige Filter
- Backend-Endpoint deaktivieren

---

**Plan erstellt von:** AI Assistant  
**Nächste Überprüfung:** Nach P0-Fixes  
**Geschätzter Gesamtaufwand:** 6-8 Wochen (1-2 Entwickler)

---

## 📊 Fortschritt

### ✅ Abgeschlossen (P1 - Struktur/UX)
- **DynamicForm Refactor:** FieldFactory, SectionRenderer, visibleIf implementiert
- **Detailseite:** DynamicListingDetail mit Abschnittsrendere und leeren Feldern ausgeblendet
- **i18n-System:** Vollständige Übersetzungen für DE/EN/RU, useTranslation Hook
- **Validierung:** Client-Side Validierung mit Backend-Regeln synchronisiert
- **Image-Integration:** Robuste Bildverarbeitung mit Fallback-System

### 🔄 In Bearbeitung
- **P2 - DX/Tests:** Test-Suite implementieren, Dead Code entfernen

### ⏳ Ausstehend
- **P2 - DX/Tests:** Bundle-Analyse & Performance-Optimierung
