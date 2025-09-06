/**
 * Einheitliches Entity-Schema für alle Karten (Shops, Dienstleister, User)
 */

export type EntityType = 'shop' | 'provider' | 'user';

export interface EntityRating {
  value: number;
  count: number;
}

export interface EntityContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface EntityLinks {
  view?: string;
  message?: string;
}

export interface EntityBadges {
  verified?: boolean;
  certified?: boolean;
  recommended?: boolean;
}

// Basis-Entity-Interface
export interface BaseEntity {
  id: string | number;
  type: EntityType;
  name: string;
  subtitle?: string; // Branche/Position/Firma
  avatarUrl?: string;
  initials?: string;
  location?: string;
  description?: string;
  tags?: string[]; // max. 5 sichtbar
  rating?: EntityRating;
  badges: EntityBadges;
  contact?: EntityContact;
  links?: EntityLinks;
}

// Shop-spezifische Felder
export interface ShopEntity extends BaseEntity {
  type: 'shop';
  listingsCount?: number;
  priceFrom?: string;
}

// Provider-spezifische Felder
export interface ProviderEntity extends BaseEntity {
  type: 'provider';
  experienceYears?: number;
  available?: boolean;
  priceFrom?: string;
}

// User-spezifische Felder
export interface UserEntity extends BaseEntity {
  type: 'user';
  memberSince?: string; // Anzeige als "Mitglied seit ..."
}

// Union Type für alle Entity-Varianten
export type Entity = ShopEntity | ProviderEntity | UserEntity;

// Props für EntityCard-Komponente
export interface EntityCardProps {
  entity: Entity;
  onView?: (entity: Entity) => void;
  onMessage?: (entity: Entity) => void;
  onCall?: (entity: Entity) => void;
  onEmail?: (entity: Entity) => void;
  onWebsite?: (entity: Entity) => void;
}
