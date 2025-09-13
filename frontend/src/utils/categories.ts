// Kategorie-Definitionen für Frontend und Backend
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES = {
  kleinanzeigen: [
    { id: "1", name: "Elektronik", slug: "elektronik", icon: "devices", color: "#1976d2", bgColor: "#e3f2fd" },
    { id: "2", name: "Mode & Beauty", slug: "mode-beauty", icon: "style", color: "#e91e63", bgColor: "#fce4ec" },
    { id: "3", name: "Sport & Hobby", slug: "sport-hobby", icon: "sports", color: "#4caf50", bgColor: "#e8f5e8" },
    { id: "4", name: "Immobilien", slug: "immobilien", icon: "home", color: "#ff9800", bgColor: "#fff3e0" },
    { id: "5", name: "Dienstleistungen", slug: "dienstleistungen", icon: "work", color: "#9c27b0", bgColor: "#f3e5f5" },
    { id: "6", name: "Haus & Garten", slug: "haus-garten", icon: "yard", color: "#8bc34a", bgColor: "#f1f8e9" },
    { id: "7", name: "Spielzeug", slug: "spielzeug", icon: "toys", color: "#ff5722", bgColor: "#fbe9e7" },
    { id: "8", name: "Bücher & Medien", slug: "buecher-medien", icon: "book", color: "#795548", bgColor: "#efebe9" }
  ],
  autos: [
    { id: "9", name: "Auto Teile", slug: "auto-teile", icon: "build", color: "#607d8b", bgColor: "#eceff1" },
    { id: "10", name: "Zubehör", slug: "zubehoer", icon: "settings", color: "#00bcd4", bgColor: "#e0f7fa" },
    { id: "11", name: "Reifen", slug: "reifen", icon: "tire", color: "#ff5722", bgColor: "#fbe9e7" },
    { id: "12", name: "Werkzeuge", slug: "werkzeuge", icon: "handyman", color: "#795548", bgColor: "#efebe9" }
  ]
};

export const getAllCategories = (): Category[] => {
  return [...CATEGORIES.kleinanzeigen, ...CATEGORIES.autos];
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  const allCategories = getAllCategories();
  return allCategories.find(cat => cat.slug === slug);
};

export const getCategoriesByTheme = (theme: 'kleinanzeigen' | 'autos'): Category[] => {
  return CATEGORIES[theme] || [];
}; 
