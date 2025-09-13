import { getImageUrl } from '@/utils/imageUtils';

// Lokale Definitionen um Caching-Probleme zu vermeiden
type EntityType = 'shop' | 'provider' | 'user';

interface EntityRating {
  value: number;
  count: number;
}

interface EntityContact {
  phone?: string;
  email?: string;
  website?: string;
}

interface EntityLinks {
  view?: string;
  message?: string;
}

interface EntityBadges {
  verified?: boolean;
  certified?: boolean;
  recommended?: boolean;
}

interface BaseEntity {
  id: string | number;
  type: EntityType;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  initials?: string;
  location?: string;
  description?: string;
  tags?: string[];
  rating?: EntityRating;
  badges: EntityBadges;
  contact?: EntityContact;
  links?: EntityLinks;
}

interface ShopEntity extends BaseEntity {
  type: 'shop';
  listingsCount?: number;
  priceFrom?: string;
}

interface ProviderEntity extends BaseEntity {
  type: 'provider';
  experienceYears?: number;
  available?: boolean;
  priceFrom?: string;
}

interface UserEntity extends BaseEntity {
  type: 'user';
  memberSince?: string;
}

type Entity = ShopEntity | ProviderEntity | UserEntity;

// Shop-Interface aus shopService
interface Shop {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  image?: string;
  banner?: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  listing_count: number;
  opening_hours?: string;
  social_media?: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
}

// User-Interface aus userService
interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
  location?: string;
  bio?: string;
}

// Dienstleister-Interface aus mockData
interface Dienstleister {
  id: number;
  name: string;
  company: string;
  description: string;
  serviceType: string;
  location: string;
  phone?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  experience: number;
  verified: boolean;
  available: boolean;
}

/**
 * Adapter: Shop → ShopEntity
 */
export const adaptShopToEntity = (shop: Shop): ShopEntity => {
  return {
    id: shop.id,
    type: 'shop',
    name: shop.name, // Firmenname
    subtitle: shop.category, // Spezialität/Kategorie
    avatarUrl: shop.image ? getImageUrl(shop.image) : '/images/noimage.jpeg',
    initials: shop.name.charAt(0).toUpperCase(),
    location: shop.location,
    description: shop.description,
    rating: {
      value: shop.rating,
      count: shop.review_count
    },
    badges: {
      verified: shop.verified,
      recommended: shop.featured
    },
    contact: {
      phone: shop.phone,
      email: shop.email,
      website: shop.website
    },
    links: {
      view: `/shop/${shop.id}` // Shop-Detail-Route
    },
    listingsCount: shop.listing_count,
    priceFrom: undefined // Shop hat kein priceFrom in den aktuellen Daten
  };
};

/**
 * Adapter: Dienstleister → ProviderEntity
 */
export const adaptDienstleisterToEntity = (provider: Dienstleister): ProviderEntity => {
  return {
    id: provider.id,
    type: 'provider',
    name: provider.company, // Firmenname
    subtitle: provider.serviceType, // Spezialität/Service-Type
    avatarUrl: '/images/noimage.jpeg', // Default image since provider doesn't have image property
    initials: provider.company.charAt(0).toUpperCase(),
    location: provider.location,
    description: provider.description,
    tags: [provider.serviceType], // Service-Type als Tag
    rating: {
      value: provider.rating,
      count: provider.reviewCount
    },
    badges: {
      verified: provider.verified,
      certified: provider.verified // Zertifiziert = Verifiziert für Dienstleister
    },
    contact: {
      phone: provider.phone,
      email: provider.email
    },
    links: {
      view: `/dienstleister/${provider.id}`, // Annahme: Provider-Detail-Route
      message: `/messages/${provider.id}` // Annahme: Message-Route
    },
    experienceYears: provider.experience,
    available: provider.available,
    priceFrom: 'Ab 50€' // Mock-Preis aus der ursprünglichen Implementierung
  };
};

/**
 * Adapter: User → UserEntity
 */
export const adaptUserToEntity = (user: User): UserEntity => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Nicht angegeben';
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : undefined;
  
  return {
    id: user.id,
    type: 'user',
    name: fullName,
    subtitle: user.role || 'user',
    avatarUrl: user.avatar ? getImageUrl(user.avatar) : '/images/noimage.jpeg',
    initials: fullName.charAt(0).toUpperCase() + (fullName.split(' ')[1]?.charAt(0) || ''),
    location: user.location || 'Nicht angegeben',
    description: user.bio || 'Keine Beschreibung',
    rating: {
      value: 0,
      count: 0
    },
    badges: {
      verified: user.is_verified || false
    },
    contact: {
      email: user.email
    },
    links: {
      view: `/user/${user.id}`,
      message: `/messages/${user.id}`
    },
    memberSince: memberSince
  };
};

/**
 * Utility-Funktion: Kontakt-Handler
 */
export const createContactHandlers = () => {
  const handleCall = (entity: Entity) => {
    if (entity.contact?.phone) {
      window.open(`tel:${entity.contact.phone}`, '_self');
    }
  };

  const handleEmail = (entity: Entity) => {
    if (entity.contact?.email) {
      window.open(`mailto:${entity.contact.email}`, '_self');
    }
  };

  const handleWebsite = (entity: Entity) => {
    if (entity.contact?.website) {
      window.open(entity.contact.website, '_blank');
    }
  };

  const handleView = (entity: Entity) => {
    if (entity.links?.view) {
      window.location.href = entity.links.view;
    }
  };

  const handleMessage = (entity: Entity) => {
    // Navigiere zur Chat-Seite mit Entity-Kontext
    // Mappe Entity-Typen zu bestehenden Chat-Parametern
    let chatUrl = '/chat';
    
    switch (entity.type) {
      case 'user':
        // Für User: verwende userId Parameter
        chatUrl = `/chat?user=${entity.id}&userName=${encodeURIComponent(entity.name)}`;
        break;
      case 'shop':
      case 'provider':
        // Für Shops/Provider: verwende sellerId Parameter
        chatUrl = `/chat?sellerId=${entity.id}&sellerName=${encodeURIComponent(entity.name)}`;
        break;
      default:
        // Fallback: allgemeine Chat-Seite
        chatUrl = '/chat';
    }
    
    window.location.href = chatUrl;
  };

  return {
    handleCall,
    handleEmail,
    handleWebsite,
    handleView,
    handleMessage
  };
};
