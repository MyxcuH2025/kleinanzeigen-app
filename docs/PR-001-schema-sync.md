# PR #001: Schema-Synchronisation FE/BE

**Branch:** `fix/schema-sync`  
**Status:** 🚧 In Entwicklung  
**Priorität:** P0 (Kritisch)  

## 🎯 Ziel

Frontend kann Backend-Schema korrekt verarbeiten. Behebung der kritischen Inkonsistenz zwischen den Sektionen-Enums.

## 📋 Änderungen

### Frontend
- **`dynamicFormsService.ts`:** Typen von hardcodierten Strings auf Backend-Enum-Werte angepasst
- **`DynamicForm.tsx`:** Sektionen-Mapping implementiert für korrekte Anzeige

### Backend
- Keine Änderungen (bereits korrekt implementiert)

## 🔧 Technische Details

### Vorher (Frontend)
```typescript
// Hardcodierte Strings
section: 'specs' | 'additional' | 'details'
```

### Nachher (Frontend)
```typescript
// Backend-Enum-Werte
section: 'about_item' | 'specs' | 'about_house' | 'additional' | 'shipping' | 'warranty'
```

### Sektionen-Mapping
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

## ✅ Definition of Done

- [ ] Frontend-Typen stimmen mit Backend überein
- [ ] Alle Sektionen werden korrekt angezeigt
- [ ] Keine Regressionen bei bestehenden Formularen
- [ ] Tests geschrieben & grün

## 🧪 Tests

### Unit Tests
- `DynamicForm.test.tsx` - Sektionen-Rendering
- `dynamicFormsService.test.ts` - Typen-Kompatibilität

### Manuelle Tests
- [ ] Formular lädt korrekt für alle Kategorien
- [ ] Sektionen werden mit korrekten Labels angezeigt
- [ ] Felder werden in richtiger Reihenfolge gerendert

## 🚀 Deployment

**Phase:** P0-Fix (Sofort)  
**Rollback:** Einfach - nur Typen-Änderungen, keine Datenbank-Änderungen

## 📝 Changelog

### Added
- Sektionen-Mapping für alle Backend-Enum-Werte
- Korrekte Typen-Synchronisation zwischen FE/BE

### Changed
- Frontend-Sektionen-Typen von hardcodiert auf Backend-kompatibel
- Sektionen-Labels werden dynamisch aus Mapping geladen

### Fixed
- Schema-Inkonsistenz zwischen Frontend und Backend
- Sektionen werden nicht mehr angezeigt

## 🔗 Abhängigkeiten

- Keine (erster Fix in der Reihe)

## 📚 Weitere Informationen

- **Audit:** [flexible-form-audit.md](./flexible-form-audit.md)
- **Fix-Plan:** [flexible-form-fix-plan.md](./flexible-form-fix-plan.md)
- **Issue:** Schema-Mismatch zwischen FE/BE

---

**Entwickler:** [Name]  
**Reviewer:** [Name]  
**Datum:** [Datum]
