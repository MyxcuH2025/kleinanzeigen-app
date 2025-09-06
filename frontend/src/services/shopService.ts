// Shop Service - Verwaltet alle Shop-bezogenen API-Aufrufe
export interface Shop {
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

export interface ShopCreate {
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  opening_hours?: string;
  social_media?: string;
}

export interface ShopUpdate {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string;
  social_media?: string;
}

export interface ShopReview {
  id: number;
  shop_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name: string;
}

export interface ShopReviewCreate {
  shop_id: number;
  rating: number;
  comment?: string;
}

export interface ShopsResponse {
  shops: Shop[];
  total: number;
}

const API_BASE_URL = 'http://localhost:8000/api';

class ShopService {
  private baseUrl = '/api/shops';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getShops(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    location?: string;
    verified?: boolean;
    featured?: boolean;
  }): Promise<Shop[]> {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.verified !== undefined) searchParams.append('verified', params.verified.toString());
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());

    const response = await fetch(`${API_BASE_URL}/shops?${searchParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getShop(shopId: number): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createShop(shopData: ShopCreate): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/shops`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(shopData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateShop(shopId: number, shopData: ShopUpdate): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(shopData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteShop(shopId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getShopReviews(shopId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<ShopReview[]> {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/shops/${shopId}/reviews?${searchParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createShopReview(shopId: number, reviewData: ShopReviewCreate): Promise<ShopReview> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Hilfsfunktionen für Kategorien und Standorte
  async getShopCategories(): Promise<string[]> {
    const shops = await this.getShops({ limit: 1000 });
    const categories = [...new Set(shops.map(shop => shop.category))];
    return categories.sort();
  }

  async getShopLocations(): Promise<string[]> {
    const shops = await this.getShops({ limit: 1000 });
    const locations = [...new Set(shops.map(shop => shop.location))];
    return locations.sort();
  }
}

export const shopService = new ShopService();
