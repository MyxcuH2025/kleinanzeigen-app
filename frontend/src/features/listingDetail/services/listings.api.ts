import { apiService } from '@/services/api';
import { ListingDetail, ListingSummary, PhoneRevealResponse, ApiResponse } from '../types';

/**
 * Premium Detail-Seite API Services
 * Gemäß Spezifikation für Kleinanzeigen-Plattform
 */

// Base API endpoints
const LISTINGS_API = '/api/listings';
const CHATS_API = '/api/chats';

/**
 * Get listing by ID with Redis caching
 * GET /api/listings/{id}
 */
export const getListingById = async (id: string): Promise<ListingDetail> => {
  try {
    const backendListing = await apiService.get(`${LISTINGS_API}/${id}`);
    
    // Backend listing data received successfully
    
    if (!backendListing) {
      throw new Error('Keine Daten vom Backend erhalten');
    }
    
    const frontendListing: ListingDetail = {
      id: (backendListing as any).id.toString(),
      title: (backendListing as any).title,
      price: (backendListing as any).price,
      currency: 'EUR',
      location: {
        city: (backendListing as any).location || 'Berlin',
        lat: 52.5200,
        lng: 13.4050
      },
      category: (backendListing as any).category,
      condition: (backendListing as any).attributes?.condition || (backendListing as any).condition || 'gebraucht',
      createdAt: (backendListing as any).created_at,
      updatedAt: (backendListing as any).updated_at,
      views: (backendListing as any).views || 0,
      favorites: (backendListing as any).favorites_count || 0,
      media: ((backendListing as any).images || []).map((img: string, index: number) => ({
        id: index.toString(),
        url: img,
        type: 'image' as const
      })),
      attributes: (backendListing as any).attributes || {},
      descriptionMd: (backendListing as any).description || '',
        seller: {
          id: (backendListing as any).seller?.id?.toString() || '1',
          displayName: (backendListing as any).seller?.name || (backendListing as any).seller?.display_name || 'Unbekannter Verkäufer',
          avatarUrl: (backendListing as any).seller?.avatar ? `/api/images/${(backendListing as any).seller.avatar}` : undefined,
        verified: {
          phone: (backendListing as any).seller?.userType === 'verified_seller' || false,
          id: (backendListing as any).seller?.userType === 'verified_seller' || false,
          bank: (backendListing as any).seller?.userType === 'verified_seller' || false
        },
        rating: (backendListing as any).seller?.rating || 4.5,
        reviewsCount: (backendListing as any).seller?.reviewCount || 0,
        memberSince: (backendListing as any).seller?.created_at || '2022-01-01',
        lastActiveAt: (backendListing as any).seller?.last_login || new Date().toISOString(),
        isOnline: Math.random() > 0.5, // Random online status
        responseTime: 'Normal' // Placeholder - will be loaded from getUserStats
      },
      isFavorited: (backendListing as any).is_favorited || false,
      listingIdPublic: `#${(backendListing as any).id.toString().padStart(6, '0')}`,
      status: (backendListing as any).status || 'active'
    };
    
    return frontendListing;
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    throw new Error(error.response?.data?.message || 'Fehler beim Laden der Anzeige');
  }
};

/**
 * Get similar listings within radius
 * GET /api/listings/{id}/similar?radiusKm=5
 */
export const getSimilarListings = async (
  id: string, 
  radiusKm: number = 5
): Promise<ListingSummary[]> => {
  try {
    const response = await apiService.get(
      `${LISTINGS_API}/${id}/similar?radius_km=${radiusKm}&limit=6`
    );
    console.log('Similar listings response:', response);
    return response as any; // Backend returns array directly
  } catch (error: any) {
    console.error('Fehler beim Laden ähnlicher Anzeigen:', error);
    return []; // Return empty array for non-critical error
  }
};

/**
 * Toggle favorite status
 * POST /api/listings/{id}/favorite
 */
export const toggleFavoriteListing = async (id: string): Promise<void> => {
  try {
    await apiService.post(`${LISTINGS_API}/${id}/favorite`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Aktualisieren der Favoriten');
  }
};

/**
 * Reveal phone number (authenticated users only)
 * POST /api/listings/{id}/reveal-phone
 */
export const revealPhoneNumber = async (id: string): Promise<PhoneRevealResponse> => {
  try {
    const response = await apiService.post<ApiResponse<PhoneRevealResponse>>(
      `${LISTINGS_API}/${id}/reveal-phone`
    );
    return (response as any).data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Anzeigen der Telefonnummer');
  }
};

/**
 * Increment view count (with throttling)
 * POST /api/listings/{id}/views
 */
export const incrementListingView = async (id: string): Promise<void> => {
  try {
    await apiService.post(`${LISTINGS_API}/${id}/views`);
  } catch (error: any) {
    // Don't throw error for view increment as it's not critical
    console.warn('Fehler beim Aktualisieren der Aufrufe:', error);
  }
};

/**
 * Start chat conversation
 * POST /api/chats
 */
export const startChatConversation = async (
  listingId: string, 
  sellerId: string
): Promise<string> => {
  try {
    const response = await apiService.post<ApiResponse<{ chatId: string }>>(
      CHATS_API,
      { listingId, sellerId }
    );
    return (response as any).data.chatId;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Starten des Chats');
  }
};

/**
 * Report listing
 * POST /api/listings/{id}/report
 */
export const reportListing = async (data: {
  reason: string;
  message: string;
  listingId: string;
}): Promise<void> => {
  try {
    await apiService.post(`${LISTINGS_API}/${data.listingId}/report`, {
      reason: data.reason,
      message: data.message
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Melden der Anzeige');
  }
};

/**
 * Get user public profile
 * GET /api/users/{userId}/public
 */
export const getUserPublicProfile = async (userId: string) => {
  try {
    const response = await apiService.get<ApiResponse<any>>(`/api/users/${userId}/public`);
    return (response as any).data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Laden des Benutzerprofils');
  }
};

/**
 * Get user statistics (Seller Stats)
 * GET /api/users/{userId}/stats
 */
export const getUserStats = async (userId: string) => {
  try {
    const response = await apiService.get(`/api/users/${userId}/stats`);
    console.log('User stats response:', response);
    return response;
  } catch (error: any) {
    console.error('Fehler beim Laden der User-Statistiken:', error);
    // Return fallback data
    return {
      user_id: userId,
      display_name: 'Unbekannter Verkäufer',
      avatar_url: null,
      member_since_years: 1.0,
      last_activity: new Date().toISOString(),
      is_online: false,
      response_time: 'Normal',
      active_listings: 0,
      successful_sales: 0,
      rating: 4.5,
      reviews_count: 0,
      verified: {
        phone: false,
        id: false,
        bank: false
      }
    };
  }
};

/**
 * Share listing
 * POST /api/listings/{id}/share
 */
export const shareListing = async (id: string, method: 'copy' | 'social') => {
  try {
    const response = await apiService.post(`${LISTINGS_API}/${id}/share`, { method });
    return (response as any).data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Teilen der Anzeige');
  }
};

/**
 * Get listing statistics
 * GET /api/listings/{id}/stats
 */
export const getListingStats = async (id: string) => {
  try {
    const response = await apiService.get<ApiResponse<any>>(`${LISTINGS_API}/${id}/stats`);
    return (response as any).data.data;
  } catch (error: any) {
    console.error('Fehler beim Laden der Statistiken:', error);
    return null;
  }
};

/**
 * Check if user can contact seller
 * GET /api/listings/{id}/can-contact
 */
export const canContactSeller = async (id: string): Promise<boolean> => {
  try {
    const response = await apiService.get<ApiResponse<{ canContact: boolean }>>(
      `${LISTINGS_API}/${id}/can-contact`
    );
    return (response as any).data.canContact;
  } catch (error: any) {
    console.error('Fehler beim Prüfen der Kontaktmöglichkeit:', error);
    return false;
  }
};

/**
 * Get listing availability
 * GET /api/listings/{id}/availability
 */
export const getListingAvailability = async (id: string) => {
  try {
    const response = await apiService.get<ApiResponse<any>>(`${LISTINGS_API}/${id}/availability`);
    return (response as any).data.data;
  } catch (error: any) {
    console.error('Fehler beim Laden der Verfügbarkeit:', error);
    return null;
  }
};

/**
 * Bookmark listing for later
 * POST /api/listings/{id}/bookmark
 */
export const bookmarkListing = async (id: string): Promise<void> => {
  try {
    await apiService.post(`${LISTINGS_API}/${id}/bookmark`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Speichern der Anzeige');
  }
};

/**
 * Remove bookmark
 * DELETE /api/listings/{id}/bookmark
 */
export const removeBookmark = async (id: string): Promise<void> => {
  try {
    await apiService.delete(`${LISTINGS_API}/${id}/bookmark`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Entfernen der Anzeige');
  }
};

/**
 * Get listing history (for analytics)
 * GET /api/listings/{id}/history
 */
export const getListingHistory = async (id: string) => {
  try {
    const response = await apiService.get<ApiResponse<any>>(`${LISTINGS_API}/${id}/history`);
    return (response as any).data.data;
  } catch (error: any) {
    console.error('Fehler beim Laden der Historie:', error);
    return null;
  }
};
