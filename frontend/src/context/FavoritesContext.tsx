import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoriteService } from '@/services/favoriteService';
import { useUser } from './UserContext';

interface FavoritesContextType {
  favorites: Set<string>;
  addFavorite: (listingId: string) => Promise<void>;
  removeFavorite: (listingId: string) => Promise<void>;
  isFavorite: (listingId: string) => boolean;
  refreshFavorites: () => Promise<void>;
  isLoading: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  addFavorite: async () => {},
  removeFavorite: async () => {},
  isFavorite: () => false,
  refreshFavorites: async () => {},
  isLoading: false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Favoriten beim User-Login laden
  useEffect(() => {
    if (user) {
      refreshFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [user]);

  const refreshFavorites = async () => {
    if (!user) {
      console.log('No user logged in, skipping favorites refresh');
      setFavorites(new Set());
      return;
    }

    // Prüfe ob der Token noch gültig ist
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, clearing favorites');
      setFavorites(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const favoritesData = await favoriteService.getFavorites();
      
      console.log('Favorites data received:', favoritesData); // Debug log
      
      if (!favoritesData || favoritesData.length === 0) {
        console.log('No favorites found, setting empty set'); // Debug log
        setFavorites(new Set());
        return;
      }
      
      // Neue Backend-Struktur: { favorites: [{ favorite_id, listing: { id, ... } }] }
      const favoritesArray = Array.isArray(favoritesData) ? favoritesData : (favoritesData as Record<string, unknown>)?.favorites || [];
      
      console.log('Processing favorites array:', favoritesArray); // Debug log
      
      const favoriteIds = new Set<string>((favoritesArray as unknown[]).map((fav: unknown) => {
        const favRecord = fav as Record<string, unknown>;
        // Neue Struktur: fav.listing.id
        if (favRecord.listing && typeof favRecord.listing === 'object' && (favRecord.listing as Record<string, unknown>).id) {
          console.log(`Found favorite with listing.id: ${(favRecord.listing as Record<string, unknown>).id}`); // Debug log
          return String((favRecord.listing as Record<string, unknown>).id);
        }
        // Fallback für alte Struktur: fav.listing_id
        if (favRecord.listing_id) {
          console.log(`Found favorite with listing_id: ${favRecord.listing_id}`); // Debug log
          return String(favRecord.listing_id);
        }
        console.log('Invalid favorite structure:', favRecord); // Debug log
        return null;
      }).filter((id: unknown) => id !== null) as string[]);
      
      console.log('Final favorite IDs:', Array.from(favoriteIds)); // Debug log
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Bei Token-Fehlern den User ausloggen
      if (error instanceof Error && error.message?.includes('Nicht eingeloggt')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setFavorites(new Set());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (listingId: string) => {
    if (!user) throw new Error('Nicht eingeloggt');

    try {
      await favoriteService.addFavorite(listingId);
      await refreshFavorites();
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('bereits in deinen Favoriten')) {
        await refreshFavorites();
        return;
      }
      throw error;
    }
  };

  const removeFavorite = async (listingId: string) => {
    if (!user) throw new Error('Nicht eingeloggt');

    try {
      await favoriteService.removeFavorite(listingId);
      await refreshFavorites();
    } catch (error) {
      throw error;
    }
  };

  const isFavorite = (listingId: string): boolean => {
    const normalizedId = listingId.toString();
    const result = favorites.has(normalizedId);
    console.log(`isFavorite check for ${listingId} (normalized: ${normalizedId}): ${result}`); // Debug log
    console.log('Current favorites set:', Array.from(favorites)); // Debug log
    return result;
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      refreshFavorites,
      isLoading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}; 