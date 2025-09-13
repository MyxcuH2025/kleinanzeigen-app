import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import AdCard from '@/components/AdCard';
// UniversalFilter wurde entfernt - verwende einfache Filter-Logik

const PLACEHOLDER_IMAGE_URL = '/images/noimage.jpeg';

interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  attributes: Record<string, string | number | boolean>;
  category: string;
  subcategory?: string;
  condition?: string;
  created_at: string;
  views: number;
}



export const UniversalListingPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const categoryValue = category || 'kleinanzeigen';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});

  const fetchListings = async (appliedFilters: Record<string, string | number | boolean> = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Baue Query-Parameter
      const queryParams = new URLSearchParams({
        category: categoryValue,
        ...appliedFilters
      });

      // Entferne leere Werte
      for (const [key, value] of queryParams.entries()) {
        if (value === '' || value === null || value === undefined) {
          queryParams.delete(key);
        }
      }

      const response = await fetch(`http://localhost:8000/api/listings?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Verarbeite die Bilder für jedes Listing
      const processedListings = data.map((listing: Listing) => {
        let parsedImages: string[] = [];
        try {
          if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
            const images = listing.images;
            if (Array.isArray(images) && images.length > 0) {
              parsedImages = images.map((imagePath: string) => {
                        if (imagePath.startsWith('/uploads/')) {
          return `http://localhost:8000/api/images/${imagePath.replace('/uploads/', '')}`;
        }
                return imagePath;
              });
            }
          }
        } catch (error) {
          console.warn('Fehler beim Parsen der Bilder für Listing:', listing.id, error);
        }
        
        // Fallback-Bild wenn keine Bilder vorhanden
        if (parsedImages.length === 0) {
          parsedImages = [PLACEHOLDER_IMAGE_URL];
        }

        return {
          ...listing,
          images: parsedImages
        };
      });
      
      setListings(processedListings);
    } catch (err) {
      console.error('Fehler beim Laden der Listings:', err);
      setError('Fehler beim Laden der Anzeigen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Lade Listings beim Mount und bei Filter-Änderungen
  useEffect(() => {
    fetchListings(filters);
  }, [categoryValue, filters]);



  const handleRefresh = () => {
    fetchListings(filters);
  };

  const getCategoryTitle = () => {
    const titles: { [key: string]: string } = {
      immobilien: 'Immobilien',
      autos: 'Autos & Fahrzeuge',
      services: 'Services & Dienstleistungen',
      kleinanzeigen: 'Kleinanzeigen'
    };
    return titles[categoryValue] || categoryValue;
  };

  const getCategoryDescription = () => {
    const descriptions: { [key: string]: string } = {
      immobilien: 'Finden Sie Ihre Traumimmobilie - Wohnungen, Häuser und Grundstücke',
      autos: 'Fahrzeuge aller Art - Autos, Motorräder, Nutzfahrzeuge und mehr',
      services: 'Professionelle Dienstleistungen für alle Bereiche',
      kleinanzeigen: 'Alles andere - von Elektronik bis Möbel'
    };
    return descriptions[categoryValue] || '';
  };

  if (loading && listings.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {getCategoryTitle()}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {getCategoryDescription()}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {listings.length} Anzeigen gefunden
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
          >
            Aktualisieren
          </Button>
        </Box>
      </Box>

      {/* Filter - temporär entfernt */}
      {/* <UniversalFilter
        category={categoryValue}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      /> */}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Listings */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Anzeigen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuchen Sie andere Filter-Einstellungen oder erstellen Sie eine neue Anzeige.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 2 }}>
          {listings.map((listing) => (
            <Box key={listing.id} sx={{ display: 'flex' }}>
              <AdCard {...listing} id={listing.id.toString()} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}; 
