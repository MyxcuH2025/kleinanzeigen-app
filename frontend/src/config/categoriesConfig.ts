export type SelectFilter = {
  type: 'select';
  key: string;
  label: string;
  options: string[];
};

export type RangeFilter = {
  type: 'range';
  key: string;
  label: string;
  min: number;
  max: number;
};

export type FilterType = SelectFilter | RangeFilter;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id: number;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Autos",
    slug: "autos",
    description: "Fahrzeuge, Ersatzteile & Zubehör",
    icon: "/images/categories/bmw_156x90_enhanced.png",
    sort_order: 1,
    subcategories: [
      { id: 201, name: "Autos", slug: "autos", parent_id: 1 },
      { id: 202, name: "Motorräder", slug: "motorraeder", parent_id: 1 },
      { id: 203, name: "Wohnmobil", slug: "wohnmobil", parent_id: 1 },
      { id: 204, name: "LKW", slug: "lkw", parent_id: 1 },
      { id: 205, name: "Ersatzteile", slug: "ersatzteile", parent_id: 1 }
    ]
  },
  {
    id: 2,
    name: "Kleinanzeigen",
    slug: "kleinanzeigen",
    description: "Alles andere - von Elektronik bis Sport",
    icon: "/images/categories/iphone_electronics_icon.png",
    sort_order: 2,
    subcategories: [
      { id: 101, name: "Elektronik", slug: "elektronik", parent_id: 2 },
      { id: 102, name: "Haus & Garten", slug: "haus-garten", parent_id: 2 },
      { id: 103, name: "Mode & Beauty", slug: "mode-beauty", parent_id: 2 },
      { id: 104, name: "Sport & Hobby", slug: "sport-freizeit", parent_id: 2 },
      { id: 105, name: "Bücher & Medien", slug: "buecher-medien", parent_id: 2 },
      { id: 106, name: "Spielzeug & Spiele", slug: "spielzeug-spiele", parent_id: 2 },
      { id: 107, name: "Tiere & Zubehör", slug: "tiere-zubehoer", parent_id: 2 },
      { id: 108, name: "Musik & Instrumente", slug: "musik-instrumente", parent_id: 2 }
    ]
  }
];

// Filter-Konfiguration für jede Kategorie
export const categoryFilters: Record<string, FilterType[]> = {
  autos: [
    {
      type: 'select',
      key: 'kategorie',
      label: 'Kategorie',
      options: ['Autos', 'Motorräder', 'Wohnmobil', 'LKW', 'Ersatzteile']
    },
    {
      type: 'select',
      key: 'marke',
      label: 'Marke',
      options: ['BMW', 'Mercedes', 'Audi', 'VW', 'Opel', 'Ford', 'Andere']
    },
    {
      type: 'select',
      key: 'getriebe',
      label: 'Getriebe',
      options: ['Manuell', 'Automatik']
    },
    {
      type: 'range',
      key: 'erstzulassung',
      label: 'Erstzulassung',
      min: 1990,
      max: 2024
    },
    {
      type: 'range',
      key: 'kilometerstand',
      label: 'Kilometerstand',
      min: 0,
      max: 500000
    }
  ],
  kleinanzeigen: [
    {
      type: 'select',
      key: 'zustand',
      label: 'Zustand',
      options: ['Neu', 'Gebraucht', 'Defekt']
    },
    {
      type: 'select',
      key: 'versand',
      label: 'Versand',
      options: ['Ja', 'Nein', 'Verhandelbar']
    },
    {
      type: 'select',
      key: 'kategorie',
      label: 'Kategorie',
      options: [
        'Elektronik', 
        'Haus & Garten', 
        'Mode & Beauty', 
        'Sport & Hobby', 
        'Bücher & Medien',
        'Spielzeug & Spiele',
        'Tiere & Zubehör',
        'Musik & Instrumente'
      ]
    }
  ]
};

// Hilfsfunktionen
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};

export const getSubCategoryBySlug = (parentSlug: string, subSlug: string): SubCategory | undefined => {
  const category = getCategoryBySlug(parentSlug);
  return category?.subcategories?.find(sub => sub.slug === subSlug);
}; 