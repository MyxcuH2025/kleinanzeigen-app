import { config, getFullApiUrl } from '@/config/config';

export interface Favorite {
  id?: string;
  userId: string;
  adId: string;
  createdAt: Date;
}

export interface FavoriteWithListing {
  favorite_id: number;
  created_at: string;
  listing: {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    images: string;
    user_id: number;
    created_at: string;
  };
}

class FavoriteService {
  private baseUrl = getFullApiUrl('api/favorites');

  async getFavorites(): Promise<FavoriteWithListing[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');

    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Favoriten');
    }

    const data = await response.json();
    return data.favorites || [];
  }

  async addFavorite(listingId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');

    const response = await fetch(`${this.baseUrl}/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Bitte melde dich an, um Favoriten hinzuzufügen');
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail === 'Listing is already in favorites') {
          throw new Error('Anzeige ist bereits in deinen Favoriten');
        } else {
          throw new Error('Fehler beim Hinzufügen zur Merkliste');
        }
      } else {
        throw new Error('Fehler beim Hinzufügen zur Merkliste');
      }
    }
  }

  async removeFavorite(listingId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');

    const response = await fetch(`${this.baseUrl}/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Entfernen aus der Merkliste');
    }
  }

  async checkFavorite(listingId: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await fetch(`${this.baseUrl}/${listingId}/check`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
              if (false) { // Debug disabled
        console.error('Fehler beim Prüfen des Favoriten-Status:', response.status);
      }
      return false;
    }

    const data = await response.json();
    return data.isFavorite || false;
  }

  async toggleFavorite(listingId: string): Promise<boolean> {
    try {
      const isFavorite = await this.checkFavorite(listingId);
      
      if (isFavorite) {
        await this.removeFavorite(listingId);
        return false;
      } else {
        await this.addFavorite(listingId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService(); 