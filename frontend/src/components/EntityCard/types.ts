// EntityCard Types
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

export interface BaseEntity {
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

export interface ShopEntity extends BaseEntity {
  type: 'shop';
  listingsCount?: number;
  priceFrom?: string;
}

export interface ProviderEntity extends BaseEntity {
  type: 'provider';
  experienceYears?: number;
  available?: boolean;
  priceFrom?: string;
}

export interface UserEntity extends BaseEntity {
  type: 'user';
  memberSince?: string;
}

export type Entity = ShopEntity | ProviderEntity | UserEntity;

export interface EntityCardProps {
  entity: Entity;
  onView?: (entity: Entity) => void;
  onMessage?: (entity: Entity) => void;
  onProfile?: (entity: Entity) => void;
}

