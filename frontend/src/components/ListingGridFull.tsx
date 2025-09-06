import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Skeleton } from '@mui/material';
import { adService } from '@/services/adService';
import type { Ad } from '@/services/adService';
import AdCard from './AdCard';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSnackbar } from '@/context/SnackbarContext';

export const ListingGridFull = ({ 
  category, 
  subcategory, 
  search, 
  location, 
  priceMin, 
  priceMax, 
  sort 
}: { 
  category?: string, 
  subcategory?: string, 
  search?: string, 
  location?: string, 
  priceMin?: string, 
  priceMax?: string, 
  sort?: string 
}) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        const allAds = await adService.getAllAds();
        setAds(allAds);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Fehler beim Laden der Anzeigen');
        showSnackbar('Fehler beim Laden der Anzeigen', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [showSnackbar]);

  // Filtere Anzeigen basierend auf den Suchkriterien
  const filteredAds = React.useMemo(() => {
    let adsToFilter = ads;

    if (category) {
      adsToFilter = adsToFilter.filter(ad => 
        ad.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (subcategory) {
      adsToFilter = adsToFilter.filter(ad => 
        ad.title?.toLowerCase().includes(subcategory.toLowerCase()) ||
        ad.description?.toLowerCase().includes(subcategory.toLowerCase())
      );
    }

    if (search) {
      adsToFilter = adsToFilter.filter(ad => 
        ad.title?.toLowerCase().includes(search.toLowerCase()) ||
        ad.description?.toLowerCase().includes(search.toLowerCase()) ||
        ad.category?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (location) {
      adsToFilter = adsToFilter.filter(ad => 
        ad.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (priceMin) {
      const minPrice = parseFloat(priceMin);
      adsToFilter = adsToFilter.filter(ad => ad.price >= minPrice);
    }

    if (priceMax) {
      const maxPrice = parseFloat(priceMax);
      adsToFilter = adsToFilter.filter(ad => ad.price <= maxPrice);
    }

    // Sortierung
    if (sort === 'price-asc') {
      adsToFilter.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      adsToFilter.sort((a, b) => b.price - a.price);
    } else if (sort === 'date-asc') {
      adsToFilter.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'date-desc') {
      adsToFilter.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return adsToFilter;
  }, [ads, category, subcategory, search, location, priceMin, priceMax, sort]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', // Mobile: 2 Spalten
            sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
            md: 'repeat(3, 1fr)', // Desktop: 3 Spalten
            lg: 'repeat(4, 1fr)', // Large: 4 Spalten
            xl: 'repeat(5, 1fr)'  // Extra Large: 5 Spalten
          },
          gap: { xs: 2, sm: 2, md: 2.5, lg: 3 }
        }}>
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={300} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (filteredAds.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Keine Anzeigen gefunden
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Versuche andere Suchkriterien oder erstelle eine neue Anzeige.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {filteredAds.length} Anzeige{filteredAds.length !== 1 ? 'n' : ''} gefunden
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', // Mobile: 2 Spalten
          sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
          md: 'repeat(3, 1fr)', // Desktop: 3 Spalten
          lg: 'repeat(4, 1fr)', // Large: 4 Spalten
          xl: 'repeat(5, 1fr)'  // Extra Large: 5 Spalten
        },
        gap: { xs: 2, sm: 2, md: 2.5, lg: 3 },
        alignItems: 'start' // Verhindert, dass Karten sich aneinander anpassen
      }}>
        {filteredAds.map((ad) => (
          <AdCard
            key={ad.id}
            {...ad}
          />
        ))}
      </Box>
    </Box>
  );
}; 