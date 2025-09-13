/**
 * Premium Detail-Seite TypeScript Interfaces
 * Gemäß Spezifikation für Kleinanzeigen-Plattform
 */

export interface ListingDetail {
  id: string;
  title: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  location: { 
    city: string; 
    lat: number; 
    lng: number; 
    distanceKm?: number;
    address?: string;
    postalCode?: string;
    country?: string;
  };
  category: string;
  condition?: 'neu' | 'wie_neu' | 'gebraucht' | 'defekt';
  createdAt: string;
  updatedAt?: string;
  views: number;
  favorites: number;
  media: Array<{ 
    id: string; 
    url: string; 
    thumbUrl?: string; 
    type: 'image' | 'video';
    alt?: string;
  }>;
  attributes: Record<string, string | number | boolean>;
  descriptionMd: string;
  seller: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    verified: { 
      phone: boolean; 
      id: boolean; 
      bank: boolean;
    };
    rating?: number; // 0-5
    reviewsCount?: number;
    memberSince: string;
    lastActiveAt?: string;
    isOnline?: boolean;
    responseTime?: string;
    email?: string;
    phone?: string;
  };
  isFavorited?: boolean;
  listingIdPublic: string; // z.B. #A1B2C3
  status: 'active' | 'paused' | 'draft' | 'expired' | 'sold';
}

export interface ListingSummary {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: { city: string; distanceKm?: number };
  category: string;
  condition?: string;
  createdAt: string;
  views: number;
  favorites: number;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  seller: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    rating?: number;
    isOnline?: boolean;
  };
  isFavorited?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'seller';
  timestamp: string;
  read: boolean;
  type?: 'text' | 'image' | 'file';
}

export interface ChatConversation {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ReportData {
  reason: 'spam' | 'fake' | 'inappropriate' | 'scam' | 'other';
  message: string;
  listingId: string;
}

export interface PhoneRevealResponse {
  phone: string;
  revealedAt: string;
  expiresAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// State Management Types
export interface ListingDetailState {
  listing: ListingDetail | null;
  similarListings: ListingSummary[];
  loading: boolean;
  error: string | null;
  isFavorited: boolean;
  phoneRevealed: boolean;
  revealedPhone: string | null;
  chatOpen: boolean;
  reportOpen: boolean;
}

export interface ListingDetailActions {
  loadListing: (id: string) => Promise<void>;
  loadSimilarListings: (id: string, radiusKm?: number) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  revealPhone: (id: string) => Promise<void>;
  incrementView: (id: string) => Promise<void>;
  startChat: (listingId: string, sellerId: string) => Promise<string>;
  reportListing: (data: ReportData) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  openReport: () => void;
  closeReport: () => void;
}

// Component Props Types
export interface ImageGalleryProps {
  images: ListingDetail['media'];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onFullscreen: () => void;
  onZoom: () => void;
  getImageUrl: (path: string) => string;
}

export interface PriceHeaderProps {
  listing: ListingDetail;
  onToggleFavorite: () => void;
  onShare: () => void;
  isFavorited: boolean;
}

export interface AttributesGridProps {
  attributes: Record<string, string | number | boolean>;
  title?: string;
}

export interface DescriptionBlockProps {
  description: string;
  title?: string;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export interface SellerCardProps {
  seller: ListingDetail['seller'];
  onContact: (method: 'chat' | 'phone' | 'email') => void;
  onViewProfile: () => void;
}

export interface ContactActionsProps {
  listing: ListingDetail;
  onStartChat: () => void;
  onRevealPhone: () => void;
  onSendEmail: () => void;
  canContact: boolean;
  phoneRevealed: boolean;
}

export interface MapSectionProps {
  location: ListingDetail['location'];
  listingTitle: string;
  onViewSimilar: () => void;
}

export interface SafetyAndActionsProps {
  listingId: string;
  listingIdPublic: string;
  onReport: () => void;
}

export interface SimilarListingsProps {
  listings: ListingSummary[];
  loading: boolean;
  onListingClick: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare: (id: string) => void;
}

export interface StickyMobileBarProps {
  listing: ListingDetail;
  onToggleFavorite: () => void;
  onContact: () => void;
  isFavorited: boolean;
}

export interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  conversation: ChatConversation | null;
  onSendMessage: (text: string) => void;
  loading: boolean;
}

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReportData) => void;
  loading: boolean;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export type ContactMethod = 'chat' | 'phone' | 'email';

export type ReportReason = 'spam' | 'fake' | 'inappropriate' | 'scam' | 'other';
