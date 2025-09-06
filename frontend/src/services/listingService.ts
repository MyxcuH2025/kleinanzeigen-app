import { config, getFullApiUrl } from '@/config/config';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted' | 'pending';

export const listingService = {
  async updateStatus(listingId: string, status: ListingStatus): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');
    
    const response = await fetch(getFullApiUrl(`api/listings/${listingId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(status)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Fehler beim Aktualisieren des Status');
    }
  },

  async deleteListing(listingId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht eingeloggt');
    
    const response = await fetch(getFullApiUrl(`api/listings/${listingId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Fehler beim Löschen der Anzeige');
    }
  }
}; 