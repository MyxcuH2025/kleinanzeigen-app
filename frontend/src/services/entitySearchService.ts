import { shopService } from './shopService';
import { userService } from './userService';

// Mock-Daten für Dienstleister (da kein Service existiert)
const mockDienstleister = [
  {
    id: 1,
    name: "Max Mustermann",
    company: "MeisterHand GmbH",
    description: "Professionelle Handwerkerdienstleistungen für Haus und Garten. Über 10 Jahre Erfahrung.",
    serviceType: "Handwerk",
    location: "Berlin",
    phone: "+49 30 12345678",
    email: "max@meisterhand.de",
    rating: 4.8,
    reviewCount: 127,
    experience: 10,
    verified: true,
    available: true,
    image: "/images/noimage.jpeg"
  },
  {
    id: 2,
    name: "Anna Schmidt",
    company: "PixelCraft Studios",
    description: "Kreative Grafikdesign- und Webentwicklungsdienstleistungen. Moderne und innovative Lösungen.",
    serviceType: "Design",
    location: "Berlin",
    phone: "+49 30 87654321",
    email: "anna@pixelcraft.de",
    rating: 4.9,
    reviewCount: 89,
    experience: 7,
    verified: true,
    available: true,
    image: "/images/noimage.jpeg"
  },
  {
    id: 3,
    name: "Thomas Weber",
    company: "TechGuard Solutions",
    description: "Schneller und zuverlässiger IT-Support für Unternehmen. 24/7 Verfügbarkeit.",
    serviceType: "IT-Support",
    location: "München",
    phone: "+49 89 11223344",
    email: "thomas@techguard.de",
    rating: 4.7,
    reviewCount: 203,
    experience: 12,
    verified: true,
    available: false,
    image: "/images/noimage.jpeg"
  },
  {
    id: 4,
    name: "Lisa Müller",
    company: "VitalFit Center",
    description: "Personaltraining und Wellness-Massagen. Individuelle Betreuung für Ihre Gesundheit.",
    serviceType: "Fitness",
    location: "Hamburg",
    phone: "+49 40 55667788",
    email: "lisa@vitalfit.de",
    rating: 4.6,
    reviewCount: 156,
    experience: 8,
    verified: true,
    available: true,
    image: "/images/noimage.jpeg"
  },
  {
    id: 5,
    name: "Michael Bauer",
    company: "ArchitekturWerk",
    description: "Architektur und Bauplanung. Von der ersten Idee bis zur Umsetzung.",
    serviceType: "Architektur",
    location: "Köln",
    phone: "+49 221 99887766",
    email: "michael@architekturwerk.de",
    rating: 4.9,
    reviewCount: 94,
    experience: 15,
    verified: true,
    available: true,
    image: "/images/noimage.jpeg"
  }
];

export type EntityType = 'all' | 'shops' | 'providers' | 'users';

export interface EntitySearchParams {
  type: EntityType;
  search?: string;
  location?: string;
  verified?: boolean;
  sortBy?: 'name' | 'rating' | 'created' | 'verified';
  limit?: number;
  offset?: number;
}

export interface EntitySearchResult {
  entities: any[];
  totalCount: number;
  hasMore: boolean;
}

export const entitySearchService = {
  async searchEntities(params: EntitySearchParams): Promise<EntitySearchResult> {
    const { type, search, location, verified, sortBy = 'name', limit = 20, offset = 0 } = params;
    
    let allEntities: any[] = [];
    
    // Shops laden
    if (type === 'all' || type === 'shops') {
      try {
        const shopsResponse = await shopService.getShops();
        const shops = shopsResponse.map(shop => ({ ...shop, _entityType: 'shop' }));
        allEntities = [...allEntities, ...shops];
      } catch (error) {
        console.warn('Fehler beim Laden der Shops:', error);
      }
    }
    
    // Dienstleister laden (Mock-Daten - TODO: Backend Service implementieren)
    if (type === 'all' || type === 'providers') {
      const providers = mockDienstleister.map(provider => ({ ...provider, _entityType: 'provider' }));
      allEntities = [...allEntities, ...providers];
    }
    
    // Users laden
    if (type === 'all' || type === 'users') {
      try {
        const usersResponse = await userService.getUsers(100, 0); // Mehr User laden
        const users = usersResponse.users.map(user => ({ ...user, _entityType: 'user' }));
        allEntities = [...allEntities, ...users];
      } catch (error) {
        console.warn('Fehler beim Laden der User:', error);
      }
    }
    
    // Filter anwenden
    let filteredEntities = allEntities;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEntities = filteredEntities.filter(entity => {
        const name = entity.name?.toLowerCase() || '';
        const description = entity.description?.toLowerCase() || '';
        const company = entity.company?.toLowerCase() || '';
        const email = entity.email?.toLowerCase() || '';
        const serviceType = entity.serviceType?.toLowerCase() || '';
        const category = entity.category?.toLowerCase() || '';
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               company.includes(searchLower) ||
               email.includes(searchLower) ||
               serviceType.includes(searchLower) ||
               category.includes(searchLower);
      });
    }
    
    if (location) {
      const locationLower = location.toLowerCase();
      filteredEntities = filteredEntities.filter(entity => {
        const entityLocation = entity.location?.toLowerCase() || '';
        return entityLocation.includes(locationLower);
      });
    }
    
    if (verified !== undefined) {
      filteredEntities = filteredEntities.filter(entity => {
        if (entity._entityType === 'shop') {
          return entity.verified === verified;
        } else if (entity._entityType === 'provider') {
          return entity.verified === verified;
        } else if (entity._entityType === 'user') {
          return entity.is_verified === verified;
        }
        return true;
      });
    }
    
    // Sortierung anwenden
    filteredEntities.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'created':
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        case 'verified':
          const verifiedA = a.verified || a.is_verified || false;
          const verifiedB = b.verified || b.is_verified || false;
          return verifiedB ? 1 : -1;
        default:
          return 0;
      }
    });
    
    // Paginierung anwenden
    const totalCount = filteredEntities.length;
    const paginatedEntities = filteredEntities.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;
    
    return {
      entities: paginatedEntities,
      totalCount,
      hasMore
    };
  },
  
  async getEntityStats(): Promise<{ shops: number; providers: number; users: number; total: number }> {
    try {
      const [shopsResponse, usersResponse] = await Promise.all([
        shopService.getShops(),
        userService.getUsers(100, 0)
      ]);
      
      const shopsCount = shopsResponse.length;
      const providersCount = mockDienstleister.length;
      const usersCount = usersResponse.users.length;
      
      return {
        shops: shopsCount,
        providers: providersCount,
        users: usersCount,
        total: shopsCount + providersCount + usersCount
      };
    } catch (error) {
      console.warn('Fehler beim Laden der Statistiken:', error);
      return {
        shops: 0,
        providers: mockDienstleister.length,
        users: 0,
        total: mockDienstleister.length
      };
    }
  }
};
