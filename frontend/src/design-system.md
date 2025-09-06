# 🎨 Design-System Dokumentation

## Farbpalette

### Primary Colors
- **Primary Main:** `#059669` - Modern Green (elegant und professionell)
- **Primary Light:** `#10b981`
- **Primary Dark:** `#047857`

### Secondary Colors
- **Secondary Main:** `#dc2626` - Red für CTAs
- **Secondary Light:** `#ef4444`
- **Secondary Dark:** `#b91c1c`

### Status Colors
- **Success:** `#10b981` / `#34d399` / `#059669`
- **Warning:** `#f59e0b` / `#fbbf24` / `#d97706`
- **Error:** `#ef4444` / `#f87171` / `#dc2626`
- **Info:** `#059669` / `#10b981` / `#047857`

### Grayscale
- **50:** `#f8fafc` - Background
- **100:** `#f1f5f9` - Hover
- **200:** `#e2e8f0` - Divider
- **300:** `#cbd5e1` - Border
- **400:** `#94a3b8` - Placeholder
- **500:** `#64748b` - Secondary Text
- **600:** `#475569` - Disabled
- **700:** `#334155` - Primary Text
- **800:** `#1e293b` - Headings
- **900:** `#0f172a` - Dark Text

## Typography Scale

### Headings
- **H1:** 40px (2.5rem) - Font Weight 800
- **H2:** 32px (2rem) - Font Weight 700
- **H3:** 28px (1.75rem) - Font Weight 700
- **H4:** 24px (1.5rem) - Font Weight 600
- **H5:** 20px (1.25rem) - Font Weight 600
- **H6:** 18px (1.125rem) - Font Weight 600

### Body Text
- **Body1:** 16px (1rem) - Font Weight 400
- **Body2:** 14px (0.875rem) - Font Weight 400
- **Subtitle1:** 16px (1rem) - Font Weight 500
- **Subtitle2:** 14px (0.875rem) - Font Weight 500

### Small Text
- **Caption:** 12px (0.75rem) - Font Weight 500
- **Overline:** 12px (0.75rem) - Font Weight 600, Uppercase

### Interactive Elements
- **Button:** 14px (0.875rem) - Font Weight 600

## Spacing Scale

**Base Unit:** 4px

- **1:** 4px
- **2:** 8px
- **3:** 12px
- **4:** 16px
- **6:** 24px
- **8:** 32px
- **12:** 48px
- **16:** 64px

## Border Radius

- **Base:** 8px
- **Cards:** 12px
- **Chips:** 8px
- **Buttons:** 8px
- **TextFields:** 8px

## Touch Targets (WCAG-konform)

- **Minimum:** 44px x 44px
- **Small:** 32px x 32px (nur für Desktop)
- **Large:** 56px x 56px
- **Buttons:** 44px Höhe
- **IconButtons:** 44px x 44px
- **TextFields:** 44px Höhe

## Shadows

### Elevation Levels
- **Level 1:** `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Level 2:** `0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)`
- **Level 3:** `0 6px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)`

### Interactive Shadows
- **Button Hover:** `0 4px 12px rgba(5, 150, 105, 0.15)`
- **Button Active:** `0 6px 20px rgba(5, 150, 105, 0.25)`
- **Card Hover:** `0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)`

## Breakpoints

- **xs:** 0px
- **sm:** 600px
- **md:** 900px
- **lg:** 1200px
- **xl:** 1536px

## Animation & Transitions

- **Duration:** 0.2s
- **Easing:** ease-in-out
- **Hover Transform:** scale(1.05)
- **Active Transform:** scale(0.95)
- **Card Hover:** translateY(-2px)

## Usage Guidelines

### Buttons
- Verwende `minHeight: '44px'` für WCAG-Konformität
- Verwende `borderRadius: 8` für einheitliche Rundungen
- Verwende `fontWeight: 600` für bessere Lesbarkeit

### Cards
- Verwende `borderRadius: 12` für moderne Optik
- Verwende `boxShadow` Level 1 für Standard-Elevation
- Verwende `transform: translateY(-2px)` für Hover-Effekte

### TextFields
- Verwende `minHeight: '44px'` für Touch-Targets
- Verwende `borderRadius: 8` für Konsistenz
- Verwende `borderWidth: '2px'` für Focus-States

### IconButtons
- Verwende `minWidth/Height: '44px'` für WCAG-Konformität
- Verwende `transform: scale(1.05)` für Hover-Effekte
- Verwende `transform: scale(0.95)` für Active-States
