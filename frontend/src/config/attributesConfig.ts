/**
 * Attribute-Konfiguration synchronisiert mit Backend
 * Basiert auf AUTO_ATTRIBUTES und KLEINANZEIGEN_ATTRIBUTES aus backend/models.py
 */

// Auto-spezifische Attribute (synchronisiert mit Backend)
export const AUTO_ATTRIBUTES = {
  marke: {
    type: 'string',
    label: 'Marke',
    required: true,
    options: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Opel', 'Ford', 'Renault', 'Peugeot', 'Fiat', 'Skoda', 'Seat', 'Nissan', 'Toyota', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Suzuki', 'Mitsubishi', 'Subaru', 'Lexus', 'Infiniti', 'Acura', 'Genesis', 'Alfa Romeo', 'Jaguar', 'Land Rover', 'Porsche', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani', 'Rimac', 'Andere']
  },
  modell: {
    type: 'string',
    label: 'Modell',
    required: true,
    placeholder: 'z.B. 3er, C-Klasse, A4'
  },
  erstzulassung: {
    type: 'integer',
    label: 'Erstzulassung',
    required: true,
    min: 1990,
    max: new Date().getFullYear()
  },
  kilometerstand: {
    type: 'integer',
    label: 'Kilometerstand',
    required: true,
    min: 0,
    max: 999999,
    placeholder: 'z.B. 50000'
  },
  kraftstoff: {
    type: 'string',
    label: 'Kraftstoff',
    required: true,
    options: ['Benzin', 'Diesel', 'Elektro', 'Hybrid', 'Gas', 'Wasserstoff']
  },
  getriebe: {
    type: 'string',
    label: 'Getriebe',
    required: true,
    options: ['Manuell', 'Automatik', 'Halbautomatik', 'CVT']
  },
  farbe: {
    type: 'string',
    label: 'Farbe',
    required: true,
    options: ['Schwarz', 'Weiß', 'Silber', 'Grau', 'Blau', 'Rot', 'Grün', 'Braun', 'Beige', 'Gelb', 'Orange', 'Lila', 'Pink', 'Gold', 'Bronze', 'Andere']
  },
  leistung: {
    type: 'integer',
    label: 'Leistung (PS)',
    required: true,
    min: 1,
    max: 2000,
    placeholder: 'z.B. 150'
  },
  unfallfrei: {
    type: 'boolean',
    label: 'Unfallfrei',
    required: false,
    default: true
  }
} as const;

// Kleinanzeigen-spezifische Attribute (synchronisiert mit Backend)
export const KLEINANZEIGEN_ATTRIBUTES = {
  kategorie: {
    type: 'string',
    label: 'Unterkategorie',
    required: true,
    options: ['Elektronik', 'Möbel', 'Kleidung', 'Sport', 'Bücher', 'Spielzeug', 'Haushalt', 'Garten', 'Werkzeug', 'Kunst', 'Antiquitäten', 'Musik', 'Filme', 'Spiele', 'Computer', 'Handy', 'Fahrrad', 'Motorrad', 'Boot', 'Camping', 'Reisen', 'Tiere', 'Pflanzen', 'Lebensmittel', 'Getränke', 'Kosmetik', 'Gesundheit', 'Bildung', 'Dienstleistungen', 'Andere']
  },
  zustand: {
    type: 'string',
    label: 'Zustand',
    required: true,
    options: ['Neu', 'Wie neu', 'Sehr gut', 'Gut', 'Befriedigend', 'Defekt']
  },
  versand: {
    type: 'boolean',
    label: 'Versand möglich',
    required: false,
    default: false
  },
  garantie: {
    type: 'boolean',
    label: 'Garantie vorhanden',
    required: false,
    default: false
  },
  abholung: {
    type: 'boolean',
    label: 'Abholung möglich',
    required: false,
    default: true
  },
  verhandelbar: {
    type: 'boolean',
    label: 'Preis verhandelbar',
    required: false,
    default: false
  }
} as const;

// Kategorie-zu-Attributen-Mapping (synchronisiert mit Backend)
export const getCategoryAttributes = (category: string) => {
  switch (category) {
    case 'autos':
      return AUTO_ATTRIBUTES;
    case 'kleinanzeigen':
      return KLEINANZEIGEN_ATTRIBUTES;
    default:
      return {};
  }
};

// Attribute-Typen für TypeScript
export type AttributeType = 'string' | 'integer' | 'boolean';
export type AttributeConfig = {
  type: AttributeType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  default?: any;
};

export type AttributesConfig = Record<string, AttributeConfig>;
