// Breadcrumb Service für dynamische Kategorie-Navigation
import { categories as frontendCategories } from '@/data/categories';

export interface BreadcrumbItem {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  url?: string;
}

export interface CategoryHierarchy {
  mainCategory: BreadcrumbItem;
  subcategory?: BreadcrumbItem;
  item?: BreadcrumbItem;
}

class BreadcrumbService {
  private categories: any[] = [];
  private subcategories: any[] = [];
  private items: any[] = [];

  // Kategorien vom Frontend laden (statt Backend)
  async loadCategories() {
    try {
      // Verwende Frontend-Kategorien statt Backend
      this.categories = frontendCategories.map((cat, index) => ({
        id: index + 1,
        value: cat.value,
        label: cat.label,
        icon: cat.icon,
        subcategories: cat.subcategories
      }));
      
      console.log('🍞 Frontend categories loaded:', this.categories.length, 'categories');
    } catch (error) {
      console.error('Fehler beim Laden der Frontend-Kategorien:', error);
    }
  }

  // Subkategorien für eine Hauptkategorie laden
  async loadSubcategories(categoryValue: string) {
    try {
      const response = await fetch(`http://localhost:8000/api/categories/${categoryValue}/subcategories`);
      if (response.ok) {
        this.subcategories = await response.json();
      }
    } catch (error) {
      console.error('Fehler beim Laden der Subkategorien:', error);
    }
  }

  // Breadcrumb-Pfad für eine Kategorie erstellen
  getBreadcrumbPath(categoryValue: string, subcategoryValue?: string, itemValue?: string): BreadcrumbItem[] {
    const path: BreadcrumbItem[] = [];

    // Hauptkategorie finden
    const mainCategory = this.categories.find(cat => cat.value === categoryValue);
    if (mainCategory) {
      path.push({
        id: mainCategory.id,
        name: mainCategory.label,
        slug: mainCategory.value,
        icon: mainCategory.icon,
        url: `/category/${mainCategory.value}`
      });

      // Subkategorie hinzufügen (falls vorhanden)
      if (subcategoryValue && mainCategory.subcategories) {
        const subcategory = mainCategory.subcategories.find(sub => sub.value === subcategoryValue);
        if (subcategory) {
          path.push({
            id: subcategory.id || 999,
            name: subcategory.label,
            slug: subcategory.value,
            icon: subcategory.icon || '📦',
            url: `/category/${categoryValue}/${subcategory.value}`
          });

          // Item hinzufügen (falls vorhanden)
          if (itemValue && subcategory.items) {
            const item = subcategory.items.find(item => item === itemValue);
            if (item) {
              path.push({
                id: 9999,
                name: item,
                slug: item.toLowerCase().replace(/\s+/g, '-'),
                icon: '🔹',
                url: `/category/${categoryValue}/${subcategoryValue}/${item.toLowerCase().replace(/\s+/g, '-')}`
              });
            }
          }
        }
      }
    }

    return path;
  }

  // Breadcrumb für Create-Listing erstellen
  getCreateListingBreadcrumb(
    categoryValue: string, 
    listingType: 'offer' | 'request' = 'offer',
    subcategoryValue?: string | null,
    itemValue?: string | null
  ): BreadcrumbItem[] {
    const path: BreadcrumbItem[] = [];

    // Hauptkategorie finden
    const mainCategory = this.categories.find(cat => cat.value === categoryValue);
    if (mainCategory) {
      path.push({
        id: mainCategory.id,
        name: mainCategory.label,
        slug: mainCategory.value,
        icon: mainCategory.icon,
        url: `/category/${mainCategory.value}`
      });
    } else {
      // Fallback für unbekannte Kategorien
      const fallbackCategory = this.getFallbackCategory(categoryValue);
      path.push({
        id: 999,
        name: fallbackCategory.label,
        slug: categoryValue,
        icon: fallbackCategory.icon,
        url: `/category/${categoryValue}`
      });
    }

    // Unterkategorie hinzufügen, falls vorhanden
    if (subcategoryValue) {
      const subcategory = this.subcategories.find(sub => sub.value === subcategoryValue);
      if (subcategory) {
        path.push({
          id: subcategory.id,
          name: subcategory.label,
          slug: subcategory.value,
          icon: subcategory.icon || '📦',
          url: `/category/${subcategory.value}`
        });
      }
    }

    // Typ/Item hinzufügen, falls vorhanden
    if (itemValue) {
      path.push({
        id: 997, // Dummy ID
        name: itemValue,
        slug: itemValue.toLowerCase().replace(/\s+/g, '-'),
        icon: '🏷️'
      });
    }

    // Listing-Typ hinzufügen
    const typeLabel = listingType === 'offer' ? 'Ich biete' : 'Ich suche';
    path.push({
      id: 998, // Dummy ID
      name: typeLabel,
      slug: listingType,
      icon: listingType === 'offer' ? '📤' : '🔍'
    });

    return path;
  }

  // Breadcrumb für User-Profil erstellen
  getUserProfileBreadcrumb(userName: string, userId: number): BreadcrumbItem[] {
    return [
      {
        id: 0,
        name: 'Home',
        slug: 'home',
        icon: '🏠',
        url: '/'
      },
      {
        id: userId,
        name: userName,
        slug: `user-${userId}`,
        icon: '👤',
        url: `/user/${userId}`
      }
    ];
  }

  // Breadcrumb für Listing-Detail erstellen
  getListingBreadcrumb(categoryValue: string, listingTitle: string, listingId: number): BreadcrumbItem[] {
    const path: BreadcrumbItem[] = [];

    // Hauptkategorie finden
    const mainCategory = this.categories.find(cat => cat.value === categoryValue);
    if (mainCategory) {
      path.push({
        id: mainCategory.id,
        name: mainCategory.label,
        slug: mainCategory.value,
        icon: mainCategory.icon,
        url: `/category/${mainCategory.value}`
      });
    } else {
      // Fallback für unbekannte Kategorien
      const fallbackCategory = this.getFallbackCategory(categoryValue);
      path.push({
        id: 999,
        name: fallbackCategory.label,
        slug: categoryValue,
        icon: fallbackCategory.icon,
        url: `/category/${categoryValue}`
      });
    }

    // Listing-Titel (gekürzt)
    const shortTitle = listingTitle.length > 30 ? listingTitle.substring(0, 30) + '...' : listingTitle;
    path.push({
      id: listingId,
      name: shortTitle,
      slug: `listing-${listingId}`,
      icon: '📄',
      url: `/listings/${listingId}`
    });

    return path;
  }

  // Fallback-Kategorien für unbekannte Werte
  private getFallbackCategory(categoryValue: string): { label: string; icon: string } {
    // Verwende Frontend-Kategorien für Fallback
    const frontendCategory = frontendCategories.find(cat => cat.value === categoryValue);
    if (frontendCategory) {
      return { label: frontendCategory.label, icon: frontendCategory.icon };
    }

    // Fallback für unbekannte Kategorien
    return { label: 'Kategorie', icon: '📦' };
  }
}

export const breadcrumbService = new BreadcrumbService();
