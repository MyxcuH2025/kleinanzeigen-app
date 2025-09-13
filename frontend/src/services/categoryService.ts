import { getFullApiUrl } from '@/config/config';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: number | null;
  sort_order: number;
  children_count: number;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: number | null;
  sort_order: number;
  subcategories: Subcategory[];
}

export interface CategoryListingsResponse {
  listings: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    category: string;
    subcategory: string | null;
    min_price: number | null;
    max_price: number | null;
    location: string | null;
    condition: string | null;
  };
}

export interface CategoryStats {
  category: string;
  total_listings: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_ranges: Record<string, number>;
  locations: string[];
  conditions: string[];
}

export interface CategoryFilters {
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  condition?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

class CategoryService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(getFullApiUrl(`api${endpoint}`), {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllCategories(parentId?: number): Promise<Category[]> {
    const params = parentId ? `?parent_id=${parentId}` : '';
    return this.request<Category[]>(`/categories${params}`);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDetail> {
    return this.request<CategoryDetail>(`/categories/${slug}`);
  }

  async getListingsByCategory(slug: string, filters: CategoryFilters = {}): Promise<CategoryListingsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/categories/${slug}/listings${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CategoryListingsResponse>(endpoint);
  }

  async getCategoryStats(slug: string): Promise<CategoryStats> {
    return this.request<CategoryStats>(`/categories/${slug}/stats`);
  }

  // Hilfsfunktion für Filter-Parameter
  buildFilterParams(filters: CategoryFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return params;
  }
}

export const categoryService = new CategoryService(); 
