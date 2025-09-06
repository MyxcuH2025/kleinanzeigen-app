import { API_BASE_URL } from '../config/config';

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  verification_state: string;
  verification_text: string;
  is_verified: boolean;
  created_at: string;
  location: string;
  phone: string;
  bio: string;
  website?: string;
  avatar?: string;
}

export interface UserListing {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  is_featured: boolean;
  view_count: number;
  contact_phone?: string;
  contact_email?: string;
  condition?: string;
  delivery_options: string[];
}

export interface UserProfileResponse {
  user: UserProfile;
  listings: UserListing[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export const userProfileService = {
  async getUserProfile(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserProfileResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Token aus localStorage holen (falls vorhanden)
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Authorization Header nur hinzufügen wenn Token vorhanden
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Laden des User-Profils: ${response.statusText}`);
    }

    return response.json();
  },
};
