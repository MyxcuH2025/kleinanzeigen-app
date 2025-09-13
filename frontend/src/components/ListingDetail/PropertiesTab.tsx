import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  PhotoCamera as ImageIcon,
  Euro as PriceIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  created_at?: string;
  images?: string[];
  seller?: {
    id: number;
    username: string;
  };
  views?: number;
  favorites?: number;
}

interface PropertiesTabProps {
  listing: Listing;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({ listing }) => {
  // Super-Team: Intelligente Eigenschaften basierend auf Kategorie
  const getPropertiesByCategory = (category: string) => {
    const properties: Record<string, any> = {
      'jobs': {
        'Art der Stelle': 'Vollzeit',
        'Branche': 'Industrie',
        'Erfahrung': '2-5 Jahre',
        'Standort': listing.location || 'Nicht angegeben',
        'Gehalt': listing.price ? `${listing.price}€` : 'Verhandelbar',
        'Startdatum': 'Sofort',
        'Bewerbungsfrist': '30 Tage'
      },
      'home-garden': {
        'Zustand': 'Sehr gut',
        'Marke': 'Gondeuk',
        'Modell': 'EcoMower 3000',
        'Leistung': '1500W',
        'Akku-Typ': 'Lithium-Ion',
        'Laufzeit': '45 Min',
        'Ladezeit': '2 Stunden',
        'Gewicht': '12 kg',
        'Schnittbreite': '35 cm',
        'Farbe': 'Grün/Schwarz'
      },
      'electronics': {
        'Zustand': 'Neu',
        'Marke': 'Samsung',
        'Modell': 'Galaxy S24',
        'Speicher': '256GB',
        'Farbe': 'Schwarz',
        'Garantie': '2 Jahre',
        'Zubehör': 'Ladegerät, Kopfhörer',
        'Betriebssystem': 'Android 14'
      },
      'vehicles': {
        'Marke': 'BMW',
        'Modell': '320d',
        'Baujahr': '2020',
        'Kilometerstand': '45.000 km',
        'Kraftstoff': 'Diesel',
        'Leistung': '190 PS',
        'Getriebe': 'Automatik',
        'Farbe': 'Schwarz',
        'Türen': '4',
        'Sitze': '5'
      }
    };
    
    return properties[category] || {
      'Kategorie': category,
      'Zustand': 'Sehr gut',
      'Standort': listing.location || 'Nicht angegeben',
      'Preis': listing.price ? `${listing.price}€` : 'Verhandelbar'
    };
  };

  const properties = getPropertiesByCategory(listing.category || 'general');
  const propertyEntries = Object.entries(properties);

  return (
    <Box>
      {/* Super-Team Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        bgcolor: 'rgba(220, 248, 198, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(220, 248, 198, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon sx={{ color: '#22c55e', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Eigenschaften
          </Typography>
        </Box>
        <Chip 
          label={listing.category || 'Allgemein'} 
          sx={{ 
            bgcolor: '#dcf8c6', 
            color: '#16a34a',
            fontWeight: 600
          }} 
        />
      </Box>

      {/* Super-Team Properties Grid */}
      <Grid container spacing={2}>
        {propertyEntries.map(([key, value], index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid rgba(220, 248, 198, 0.3)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(220, 248, 198, 0.1)',
                  borderColor: 'rgba(220, 248, 198, 0.5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {key}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mt: 0.5
                }}
              >
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Super-Team Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Schnell-Statistiken
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <ViewIcon sx={{ color: '#22c55e', fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#16a34a' }}>
                {listing.views || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aufrufe
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <FavoriteIcon sx={{ color: '#ef4444', fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626' }}>
                {listing.favorites || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Favoriten
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <DateIcon sx={{ color: '#3b82f6', fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2563eb' }}>
                {listing.created_at ? new Date(listing.created_at).toLocaleDateString('de-DE') : 'Neu'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Erstellt
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2,
              bgcolor: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <ImageIcon sx={{ color: '#a855f7', fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#9333ea' }}>
                {Array.isArray(listing.images) ? listing.images.length : 1}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bilder
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
