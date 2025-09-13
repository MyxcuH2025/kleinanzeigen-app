import { getFullApiUrl } from '@/config/config';

export interface RatingCreate {
  rating: number;
  comment?: string;
}

export interface SellerRatingCreate {
  rating_value: number;
  review?: string;
  communication_rating: number;
  shipping_rating: number;
  item_condition_rating: number;
}

export interface Rating {
  id: number;
  rating: number;
  review?: string;
  is_verified_purchase: boolean;
  created_at: string;
  reviewer: {
    id: number;
    name: string;
  };
}

export interface SellerRating {
  id: number;
  rating: number;
  review?: string;
  communication_rating: number;
  shipping_rating: number;
  item_condition_rating: number;
  created_at: string;
  reviewer: {
    id: number;
    name: string;
  };
}

export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: Array<{
    rating: number;
    count: number;
  }>;
}

export interface SellerRatingStats {
  average_rating: number;
  average_communication: number;
  average_shipping: number;
  average_condition: number;
  total_ratings: number;
}

export interface RatingResponse {
  ratings: Rating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: RatingStats;
}

export interface SellerRatingResponse {
  ratings: SellerRating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: SellerRatingStats;
}

export const ratingService = {
  // Listing bewerten
  async rateListing(listingId: number, ratingData: RatingCreate): Promise<{ message: string; rating_id: number }> {
    const response = await fetch(getFullApiUrl(`api/listings/${listingId}/rate`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ratingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Fehler beim Erstellen der Bewertung');
    }

    return await response.json();
  },

  // Bewertungen für ein Listing abrufen
  async getListingRatings(listingId: number, page: number = 1, limit: number = 10): Promise<RatingResponse> {
    const response = await fetch(
      getFullApiUrl(`api/listings/${listingId}/ratings?page=${page}&limit=${limit}`),
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Fehler beim Laden der Bewertungen');
    }

    return await response.json();
  },

  // Verkäufer bewerten
  async rateSeller(userId: number, ratingData: SellerRatingCreate): Promise<{ message: string; rating_id: number }> {
    const response = await fetch(getFullApiUrl(`api/users/${userId}/rate-seller`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ratingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Fehler beim Erstellen der Verkäufer-Bewertung');
    }

    return await response.json();
  },

  // Verkäufer-Bewertungen abrufen
  async getSellerRatings(userId: number, page: number = 1, limit: number = 10): Promise<SellerRatingResponse> {
    const response = await fetch(
      getFullApiUrl(`api/users/${userId}/seller-ratings?page=${page}&limit=${limit}`),
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Fehler beim Laden der Verkäufer-Bewertungen');
    }

    return await response.json();
  }
}; 
