// Basis-Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: string;
  condition: string;
  images: string[];
  userId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  views?: number;
  status?: 'active' | 'inactive' | 'sold' | 'pending' | 'expired' | 'deleted';
  created_at?: string;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: unknown;
  };
  seller?: {
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    userType?: 'private' | 'shop' | 'service';
    badge?: string;
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    farbe: string;
    unfallfrei: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: number | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Filter Types
export interface ListingFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  search?: string;
  sortBy?: 'price' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: string;
  condition: string;
  images: File[];
}

// Component Props Types
export interface AdCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  location: string;
  condition?: string;
  images: string[];
  userId?: string;
  createdAt?: string | Date;
  views?: number;
  status?: string;
  created_at?: string;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: unknown;
  };
  seller?: {
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    farbe: string;
    unfallfrei: boolean;
  };
  isFavorite?: boolean;
  onFavoriteToggle?: () => Promise<void>;
  disabled?: boolean;
  onClick?: () => void;
}

export interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

// Service Types
export interface AuthService {
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  register: (email: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
}

export interface AdService {
  getAllAds: (filters?: ListingFilters) => Promise<Ad[]>;
  getAdById: (id: string) => Promise<Ad | null>;
  createAd: (data: ListingFormData) => Promise<Ad>;
  updateAd: (id: string, data: Partial<Ad>) => Promise<Ad>;
  deleteAd: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

export interface FavoriteService {
  getFavorites: () => Promise<Ad[]>;
  addFavorite: (listingId: string) => Promise<void>;
  removeFavorite: (listingId: string) => Promise<void>;
  isFavorite: (listingId: string) => Promise<boolean>;
}

// Context Types
export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export interface SnackbarContextType {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  hideSnackbar: () => void;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
} 
