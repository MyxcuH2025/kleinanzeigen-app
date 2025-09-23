import { getFullApiUrl } from '@/config/config';
import { logger } from '@/utils/logger';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CachedData<unknown>>();
const CACHE_DURATION = 0; // Cache deaktiviert für Debugging

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
};

const clearCache = (): void => {
  cache.clear();

};

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  condition: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: 'active' | 'inactive' | 'sold' | 'pending' | 'expired' | 'deleted';
  views?: number;
  created_at?: string;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
  contactInfo: {
    phone?: string;
    email?: string;
  };
  seller?: {
    id?: number;  // WICHTIG: ID hinzufügen!
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    userType?: string;
    badge?: string;
    isFollowing?: boolean;  // Follow-Status hinzufügen
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string;
    kilometerstand: string;
    kraftstoff: string;
    getriebe: string;
    leistung: string;
    farbe: string;
    unfallfrei: boolean;
  };
}

export const adService = {
  async getAllAds(): Promise<Ad[]> {
    // Cache komplett deaktiviert für frische Daten


    try {
      const response = await fetch(getFullApiUrl('api/listings'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend gibt jetzt ein Objekt mit listings zurück
      const listings = Array.isArray(data) ? data : (data.listings || []);
      
      if (!Array.isArray(listings)) {
        throw new Error('Invalid response format: expected array');
      }

      const processedAds = listings.map((item: unknown) => {
        if (!item || typeof item !== 'object') {
          throw new Error('Invalid item in response');
        }
        
        const ad = item as Record<string, unknown>;
        
        return {
          id: String(ad.id || ''),
          title: String(ad.title || ''),
          description: String(ad.description || ''),
          price: Number(ad.price) || 0,
          location: String(ad.location || ''),
          category: String(ad.category || ''),
          condition: String(ad.condition || ''),
          images: (() => {
            const imagesData = ad.images;
            if (Array.isArray(imagesData) && imagesData.length > 0) {
              return imagesData.map(img => {
                const imagePath = String(img);
                // Entferne JSON-Array-Syntax falls vorhanden
                let cleanPath = imagePath;
                
                // Entferne JSON-Array-Syntax: ["filename"] -> filename
                if (cleanPath.startsWith('["') && cleanPath.endsWith('"]')) {
                  cleanPath = cleanPath.slice(2, -2);
                }
                // Entferne einfache Anführungszeichen: "filename" -> filename
                else if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
                  cleanPath = cleanPath.slice(1, -1);
                }
                // Entferne unvollständige JSON-Array-Syntax: ["filename -> filename
                else if (cleanPath.startsWith('["') && !cleanPath.endsWith('"]')) {
                  cleanPath = cleanPath.slice(2);
                }
                // Entferne unvollständige Anführungszeichen: "filename -> filename
                else if (cleanPath.startsWith('"') && !cleanPath.endsWith('"')) {
                  cleanPath = cleanPath.slice(1);
                }
                
                // Verwende den /api/images/ Endpunkt für alle Bilder
                if (cleanPath.startsWith('/uploads/')) {
                  return `http://localhost:8000/api/images/${cleanPath.replace('/uploads/', '')}`;
                }
                // Wenn es bereits eine absolute URL ist, verwende sie direkt
                if (cleanPath.startsWith('http')) {
                  return cleanPath;
                }
                // REPARIERT: Für Dateinamen ohne Pfad
                if (cleanPath.includes('.') && !cleanPath.includes('/')) {
                  return `http://localhost:8000/api/images/${cleanPath}`;
                }
                // REPARIERT: Stelle sicher, dass alle Pfade korrekt formatiert sind
                if (cleanPath.startsWith('http://localhost:8000')) {
                  return cleanPath;
                }
                return `http://localhost:8000/api/images/${cleanPath}`;
              });
            }
            if (typeof imagesData === 'string') {
              try {
                const parsed = JSON.parse(imagesData);
                if (Array.isArray(parsed)) {
                  return parsed.map(img => {
                    const imagePath = String(img);
                    // Entferne JSON-Array-Syntax falls vorhanden
                    let cleanPath = imagePath;
                    if (cleanPath.startsWith('["') && cleanPath.endsWith('"]')) {
                      cleanPath = cleanPath.slice(2, -2);
                    }
                    if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
                      cleanPath = cleanPath.slice(1, -1);
                    }
                    
                    if (cleanPath.startsWith('/uploads/')) {
                      return `http://localhost:8000/api/images/${cleanPath.replace('/uploads/', '')}`;
                    }
                    const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
                    return `${apiUrl}/api/images/${cleanPath}`;
                  });
                }
                return [];
              } catch {
                return [];
              }
            }
            // Fallback für leere Arrays oder keine Bilder
            return ['http://localhost:8000/api/images/noimage.jpeg'];
          })(),
          createdAt: String(ad.created_at || ad.createdAt || ''),
          updatedAt: String(ad.updated_at || ad.updatedAt || ''),
          userId: String(ad.user_id || ad.userId || ''),
          status: (ad.status as 'active' | 'inactive' | 'sold') || 'active',
          views: Number(ad.views) || 0,
          created_at: String(ad.created_at || ''),
          attributes: (() => {
            if (ad.attributes && typeof ad.attributes === 'object') {
              return ad.attributes as Record<string, string | number | boolean>;
            }
            return undefined;
          })(),
          seller: (() => {
            const sellerObj = (ad.seller && typeof ad.seller === 'object') ? (ad.seller as Record<string, unknown>) : undefined;
            const sellerIdCandidate = sellerObj?.id ?? ad.user_id ?? (ad as Record<string, unknown>).seller_id ?? (ad as Record<string, unknown>).owner_id;
            if (sellerObj || sellerIdCandidate) {
              return {
                id: Number(sellerIdCandidate) || undefined,
                name: String((sellerObj?.name) || ''),
                avatar: sellerObj?.avatar ? String(sellerObj.avatar) : undefined,
                rating: Number(sellerObj?.rating) || 0,
                reviewCount: Number(sellerObj?.reviewCount) || 0,
                userType: String((sellerObj?.userType) || 'unverified'),
                badge: sellerObj?.badge ? String(sellerObj.badge) : undefined,
                isFollowing: Boolean((sellerObj as any)?.isFollowing) || false
              };
            }
            return undefined;
          })(),
          vehicleDetails: (() => {
            if (ad.vehicleDetails && typeof ad.vehicleDetails === 'object') {
              const vehicle = ad.vehicleDetails as Record<string, unknown>;
              return {
                marke: String(vehicle.marke || ''),
                modell: String(vehicle.modell || ''),
                erstzulassung: String(vehicle.erstzulassung || ''),
                kilometerstand: String(vehicle.kilometerstand || ''),
                kraftstoff: String(vehicle.kraftstoff || ''),
                getriebe: String(vehicle.getriebe || ''),
                leistung: String(vehicle.leistung || ''),
                farbe: String(vehicle.farbe || ''),
                unfallfrei: Boolean(vehicle.unfallfrei)
              };
            }
            return undefined;
          })(),
          contactInfo: {
            phone: ad.phone ? String(ad.phone) : undefined,
            email: ad.email ? String(ad.email) : undefined,
          }
        };
      });

      // Cache deaktiviert - keine Zwischenspeicherung

      return processedAds;
    } catch (error) {
      logger.error('Failed to fetch ads', error);
      throw error;
    }
  },

  async getAdsByCategory(category: string): Promise<Ad[]> {
    const cacheKey = `ads-${category}`;
    const cached = getCachedData<Ad[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(getFullApiUrl(`api/listings?category=${encodeURIComponent(category)}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend gibt jetzt ein Objekt mit listings zurück
      const listings = Array.isArray(data) ? data : (data.listings || []);
      
      if (!Array.isArray(listings)) {
        throw new Error('Invalid response format: expected array');
      }

      const processedAds = listings.map((item: unknown) => {
        if (!item || typeof item !== 'object') {
          throw new Error('Invalid item in response');
        }
        
        const ad = item as Record<string, unknown>;
        
        return {
          id: String(ad.id || ''),
          title: String(ad.title || ''),
          description: String(ad.description || ''),
          price: Number(ad.price) || 0,
          location: String(ad.location || ''),
          category: String(ad.category || ''),
          condition: String(ad.condition || ''),
          images: (() => {
            const imagesData = ad.images;
            if (Array.isArray(imagesData) && imagesData.length > 0) {
              return imagesData.map(img => {
                const imagePath = String(img);
                // Entferne JSON-Array-Syntax falls vorhanden
                let cleanPath = imagePath;
                
                // Entferne JSON-Array-Syntax: ["filename"] -> filename
                if (cleanPath.startsWith('["') && cleanPath.endsWith('"]')) {
                  cleanPath = cleanPath.slice(2, -2);
                }
                // Entferne einfache Anführungszeichen: "filename" -> filename
                else if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
                  cleanPath = cleanPath.slice(1, -1);
                }
                // Entferne unvollständige JSON-Array-Syntax: ["filename -> filename
                else if (cleanPath.startsWith('["') && !cleanPath.endsWith('"]')) {
                  cleanPath = cleanPath.slice(2);
                }
                // Entferne unvollständige Anführungszeichen: "filename -> filename
                else if (cleanPath.startsWith('"') && !cleanPath.endsWith('"')) {
                  cleanPath = cleanPath.slice(1);
                }
                
                // Verwende den /api/images/ Endpunkt für alle Bilder
                if (cleanPath.startsWith('/uploads/')) {
                  return `http://localhost:8000/api/images/${cleanPath.replace('/uploads/', '')}`;
                }
                // Wenn es bereits eine absolute URL ist, verwende sie direkt
                if (cleanPath.startsWith('http')) {
                  return cleanPath;
                }
                // REPARIERT: Für Dateinamen ohne Pfad
                if (cleanPath.includes('.') && !cleanPath.includes('/')) {
                  return `http://localhost:8000/api/images/${cleanPath}`;
                }
                // REPARIERT: Stelle sicher, dass alle Pfade korrekt formatiert sind
                if (cleanPath.startsWith('http://localhost:8000')) {
                  return cleanPath;
                }
                return `http://localhost:8000/api/images/${cleanPath}`;
              });
            }
            if (typeof imagesData === 'string') {
              try {
                const parsed = JSON.parse(imagesData);
                if (Array.isArray(parsed)) {
                  return parsed.map(img => {
                    const imagePath = String(img);
                    // Entferne JSON-Array-Syntax falls vorhanden
                    let cleanPath = imagePath;
                    if (cleanPath.startsWith('["') && cleanPath.endsWith('"]')) {
                      cleanPath = cleanPath.slice(2, -2);
                    }
                    if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
                      cleanPath = cleanPath.slice(1, -1);
                    }
                    
                    if (cleanPath.startsWith('/uploads/')) {
                      return `http://localhost:8000/api/images/${cleanPath.replace('/uploads/', '')}`;
                    }
                    const apiUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
                    return `${apiUrl}/api/images/${cleanPath}`;
                  });
                }
                return [];
              } catch {
                return [];
              }
            }
            // Fallback für leere Arrays oder keine Bilder
            return ['http://localhost:8000/api/images/noimage.jpeg'];
          })(),
          createdAt: String(ad.created_at || ad.createdAt || ''),
          updatedAt: String(ad.updated_at || ad.updatedAt || ''),
          userId: String(ad.user_id || ad.userId || ''),
          status: (ad.status as 'active' | 'inactive' | 'sold') || 'active',
          views: Number(ad.views) || 0,
          created_at: String(ad.created_at || ''),
          attributes: (() => {
            if (ad.attributes && typeof ad.attributes === 'object') {
              return ad.attributes as Record<string, string | number | boolean>;
            }
            return undefined;
          })(),
          seller: (() => {
            if (ad.seller && typeof ad.seller === 'object') {
              const seller = ad.seller as Record<string, unknown>;
              return {
                name: String(seller.name || ''),
                avatar: seller.avatar ? String(seller.avatar) : undefined,
                rating: Number(seller.rating) || 0,
                reviewCount: Number(seller.reviewCount) || 0
              };
            }
            return undefined;
          })(),
          vehicleDetails: (() => {
            if (ad.vehicleDetails && typeof ad.vehicleDetails === 'object') {
              const vehicle = ad.vehicleDetails as Record<string, unknown>;
              return {
                marke: String(vehicle.marke || ''),
                modell: String(vehicle.modell || ''),
                erstzulassung: String(vehicle.erstzulassung || ''),
                kilometerstand: String(vehicle.kilometerstand || ''),
                kraftstoff: String(vehicle.kraftstoff || ''),
                getriebe: String(vehicle.getriebe || ''),
                leistung: String(vehicle.leistung || ''),
                farbe: String(vehicle.farbe || ''),
                unfallfrei: Boolean(vehicle.unfallfrei)
              };
            }
            return undefined;
          })(),
          contactInfo: {
            phone: ad.phone ? String(ad.phone) : undefined,
            email: ad.email ? String(ad.email) : undefined,
          }
        };
      });

      setCachedData(cacheKey, processedAds);
      return processedAds;
    } catch (error) {
      logger.error('Failed to fetch ads by category', error);
      throw error;
    }
  },

  async getAdById(id: string): Promise<Ad | null> {
    const cacheKey = `ad-${id}`;
    const cached = getCachedData<Ad>(cacheKey);
    if (cached) return cached;

    try {
      // Token aus localStorage holen (falls vorhanden)
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Authorization Header nur hinzufügen wenn Token vorhanden
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getFullApiUrl(`api/listings/${id}`), {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      const ad = data as Record<string, unknown>;
      
      const processedAd: Ad = {
        id: String(ad.id || ''),
        title: String(ad.title || ''),
        description: String(ad.description || ''),
        price: Number(ad.price) || 0,
        location: String(ad.location || ''),
        category: String(ad.category || ''),
        condition: String(ad.condition || ''),
        images: (() => {
          const imagesData = ad.images;
          if (Array.isArray(imagesData)) {
            return imagesData.map(img => {
              const imagePath = String(img);
              if (imagePath.startsWith('/uploads/')) {
                return `http://localhost:8000${imagePath}`;
              }
              return imagePath;
            });
          }
          if (typeof imagesData === 'string') {
            try {
              const parsed = JSON.parse(imagesData);
              if (Array.isArray(parsed)) {
                return parsed.map(img => {
                  const imagePath = String(img);
                  if (imagePath.startsWith('/uploads/')) {
                    return `http://localhost:8000${imagePath}`;
                  }
                  return imagePath;
                });
              }
              return [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
        createdAt: String(ad.created_at || ad.createdAt || ''),
        updatedAt: String(ad.updated_at || ad.updatedAt || ''),
        userId: String(ad.user_id || ad.userId || ''),
        status: (ad.status as 'active' | 'inactive' | 'sold') || 'active',
        views: Number(ad.views) || 0,
        created_at: String(ad.created_at || ''),
        attributes: (() => {
                      if (ad.attributes && typeof ad.attributes === 'object') {
              return ad.attributes as Record<string, string | number | boolean>;
            }
          return undefined;
        })(),
        seller: (() => {
          const sellerObj = (ad.seller && typeof ad.seller === 'object') ? (ad.seller as Record<string, unknown>) : undefined;
          const sellerIdCandidate = sellerObj?.id ?? ad.user_id ?? (ad as Record<string, unknown>).seller_id ?? (ad as Record<string, unknown>).owner_id;
          if (sellerObj || sellerIdCandidate) {
            return {
              id: Number(sellerIdCandidate) || undefined,
              name: String((sellerObj?.name) || ''),
              avatar: sellerObj?.avatar ? String(sellerObj.avatar) : undefined,
              rating: Number(sellerObj?.rating) || 0,
              reviewCount: Number(sellerObj?.reviewCount) || 0,
              userType: String((sellerObj?.userType) || 'unverified'),
              badge: sellerObj?.badge ? String(sellerObj.badge) : undefined,
              isFollowing: Boolean((sellerObj as any)?.isFollowing) || false
            };
          }
          return undefined;
        })(),
        vehicleDetails: (() => {
                      if (ad.vehicleDetails && typeof ad.vehicleDetails === 'object') {
              const vehicle = ad.vehicleDetails as Record<string, unknown>;
            return {
              marke: String(vehicle.marke || ''),
              modell: String(vehicle.modell || ''),
              erstzulassung: String(vehicle.erstzulassung || ''),
              kilometerstand: String(vehicle.kilometerstand || ''),
              kraftstoff: String(vehicle.kraftstoff || ''),
              getriebe: String(vehicle.getriebe || ''),
              leistung: String(vehicle.leistung || ''),
              farbe: String(vehicle.farbe || ''),
              unfallfrei: Boolean(vehicle.unfallfrei)
            };
          }
          return undefined;
        })(),
        contactInfo: {
          phone: ad.phone ? String(ad.phone) : undefined,
          email: ad.email ? String(ad.email) : undefined,
        }
      };

      setCachedData(cacheKey, processedAd);
      return processedAd;
    } catch (error) {
      logger.error('Failed to fetch ad by ID', error);
      throw error;
    }
  },

  async deleteAd(id: string): Promise<void> {
    try {
      const response = await fetch(getFullApiUrl(`api/listings/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Clear cache after deletion
      clearCache();
    } catch (error) {
      logger.error('Failed to delete ad', error);
      throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Token für authentifizierten Upload (Endpoint erfordert Auth)
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nicht eingeloggt (kein Token)');
      }

      // Korrektes Backend-Endpoint: /api/upload
      const response = await fetch(getFullApiUrl('api/upload'), {
        method: 'POST',
        headers: {
          // Content-Type NICHT setzen, Browser setzt Boundary automatisch
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn('Konnte Upload-Fehlerdetails nicht parsen:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const imageUrl = data.url || `http://localhost:8000/api/images/${data.filename}`;

      return imageUrl;
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      logger.error('Failed to upload image', error);
      throw error;
    }
  },

  async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
    try {
      const response = await fetch(getFullApiUrl(`api/listings/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedAd = await response.json();
      
      // Clear cache after update
      clearCache();
      
      return updatedAd;
    } catch (error) {
      logger.error('Failed to update ad', error);
      throw error;
    }
  },

  clearCache,

  // Dynamische Formulare Integration
  async createListingWithDynamicAttributes(listingData: {
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    condition: string;
    images: string[];
    dynamicAttributes: Array<{ key: string; value: string | number | boolean }>;
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  }): Promise<Ad> {
    try {
      // Die Attribute sind bereits im richtigen Format (key, value)
      const backendAttributes = listingData.dynamicAttributes;

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Kein Authentifizierungstoken gefunden');
      }

      const response = await fetch(getFullApiUrl('api/listings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          location: listingData.location,
          category: listingData.category,
          condition: listingData.condition,
          images: listingData.images,
          attributes: backendAttributes
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn('Konnte Fehlerdetails nicht parsen:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const newAd = await response.json();

      
      // Cache nach Erstellung löschen
      clearCache();
      
      return newAd;
    } catch (error) {
      console.error('Fehler in createListingWithDynamicAttributes:', error);
      logger.error('Failed to create listing with dynamic attributes', error);
      throw error;
    }
  },

  // dynamic form helpers removed
}; 
