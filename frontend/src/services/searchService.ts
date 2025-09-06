import { config, getFullApiUrl } from '@/config/config';

export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  onlyWithImages?: boolean;
  onlyVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // Neue erweiterte Filter
  dateRange?: string;
  status?: string[];
  sellerType?: string;
  hasWarranty?: boolean;
  negotiable?: boolean;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
}

export interface SearchResponse {
  listings: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const searchService = {
  async searchListings(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.query) params.set('search', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.location) params.set('location', filters.location);
    if (filters.priceMin !== undefined) params.set('price_min', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.set('price_max', filters.priceMax.toString());
    if (filters.condition && filters.condition.length > 0) params.set('condition', filters.condition.join(','));
    if (filters.onlyWithImages) params.set('only_with_images', 'true');
    if (filters.onlyVerified) params.set('only_verified', 'true');
    if (filters.sortBy) params.set('sort_by', filters.sortBy);
    if (filters.sortOrder) params.set('sort_order', filters.sortOrder);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    
    // Neue erweiterte Filter
    if (filters.dateRange) params.set('date_range', filters.dateRange);
    if (filters.status && filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.sellerType) params.set('seller_type', filters.sellerType);
    if (filters.hasWarranty) params.set('has_warranty', 'true');
    if (filters.negotiable) params.set('negotiable', 'true');
    if (filters.deliveryAvailable) params.set('delivery_available', 'true');
    if (filters.pickupAvailable) params.set('pickup_available', 'true');
    
    const url = `${getFullApiUrl('api/listings')}?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Debug: Log the response structure
    console.log('SearchService response:', data);
    
    // Ensure the response has the expected structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    // If response is an array (old format), wrap it in the expected structure
    if (Array.isArray(data)) {
      return {
        listings: data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: data.length,
          pages: Math.ceil(data.length / (filters.limit || 20))
        }
      };
    }
    
    // If response has listings property, return as-is
    if (data.listings) {
      return data;
    }
    
    // Fallback: treat the entire response as listings
    return {
      listings: [data],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: 1,
        pages: 1
      }
    };
  },

  // Debounced search function
  debounceSearch: (() => {
    let timeoutId: NodeJS.Timeout;
    return (filters: SearchFilters, callback: (results: SearchResponse) => void, delay: number = 300) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const results = await searchService.searchListings(filters);
          callback(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      }, delay);
    };
  })()
}; 