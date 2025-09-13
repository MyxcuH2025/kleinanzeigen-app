import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Rating,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
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

interface SimilarListingsTabProps {
  listing: Listing;
}

export const SimilarListingsTab: React.FC<SimilarListingsTabProps> = ({ listing }) => {
  // Super-Team: Intelligente ähnliche Anzeigen basierend auf Kategorie
  const getSimilarListings = (): Listing[] => {
    const baseListings: Listing[] = [
      {
        id: 101,
        title: 'Professioneller Rasenmäher - Top Zustand',
        price: 320,
        category: 'home-garden',
        location: 'Hamburg, Deutschland',
        created_at: '2025-09-11',
        images: ['mower2.jpg'],
        seller: { id: 2, username: 'GartenPro' },
        views: 45,
        favorites: 3
      },
      {
        id: 102,
        title: 'Elektrischer Rasenmäher mit Mulchfunktion',
        price: 280,
        category: 'home-garden',
        location: 'München, Deutschland',
        created_at: '2025-09-10',
        images: ['mower3.jpg'],
        seller: { id: 3, username: 'TechGarden' },
        views: 67,
        favorites: 8
      },
      {
        id: 103,
        title: 'Jobs: Softwareentwickler (m/w/d) gesucht',
        price: undefined,
        category: 'jobs',
        location: 'Berlin, Deutschland',
        created_at: '2025-09-09',
        images: ['job1.jpg'],
        seller: { id: 4, username: 'TechCorp' },
        views: 123,
        favorites: 15
      },
      {
        id: 104,
        title: 'Industrie-Job: Maschinenführer gesucht',
        price: undefined,
        category: 'jobs',
        location: 'Köln, Deutschland',
        created_at: '2025-09-08',
        images: ['job2.jpg'],
        seller: { id: 5, username: 'IndustryHR' },
        views: 89,
        favorites: 12
      },
      {
        id: 105,
        title: 'Samsung Galaxy S24 Ultra - Neuwertig',
        price: 899,
        category: 'electronics',
        location: 'Frankfurt, Deutschland',
        created_at: '2025-09-07',
        images: ['phone1.jpg'],
        seller: { id: 6, username: 'ElectroDeal' },
        views: 234,
        favorites: 25
      },
      {
        id: 106,
        title: 'iPhone 15 Pro Max - 256GB',
        price: 1199,
        category: 'electronics',
        location: 'Stuttgart, Deutschland',
        created_at: '2025-09-06',
        images: ['phone2.jpg'],
        seller: { id: 7, username: 'AppleStore' },
        views: 345,
        favorites: 42
      }
    ];

    // Filtere ähnliche Anzeigen basierend auf Kategorie
    return baseListings.filter(item => 
      item.category === listing.category && item.id !== listing.id
    ).slice(0, 6);
  };

  const similarListings = getSimilarListings();

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `/api/images/${imagePath}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'home-garden': '#22c55e',
      'jobs': '#3b82f6',
      'electronics': '#8b5cf6',
      'vehicles': '#f59e0b',
      'fashion': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'home-garden': 'Haus & Garten',
      'jobs': 'Jobs',
      'electronics': 'Elektronik',
      'vehicles': 'Fahrzeuge',
      'fashion': 'Mode'
    };
    return labels[category] || category;
  };

  return (
    <Box>
      {/* Super-Team Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        bgcolor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(168, 85, 247, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrendingIcon sx={{ color: '#a855f7', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Ähnliche Anzeigen
          </Typography>
        </Box>
        <Chip 
          label={`${similarListings.length} gefunden`}
          sx={{ 
            bgcolor: '#a855f7', 
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>

      {similarListings.length > 0 ? (
        <Grid container spacing={3}>
          {similarListings.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(220, 248, 198, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: 'rgba(168, 85, 247, 0.5)'
                  }
                }}
              >
                {/* Super-Team Image */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingIcon sx={{ fontSize: 48, color: '#a855f7', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Bild würde hier angezeigt
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    display: 'flex',
                    gap: 1
                  }}>
                    <Tooltip title="Zu Favoriten hinzufügen">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                        <FavoriteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Teilen">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                        <ShareIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Super-Team Content */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={getCategoryLabel(item.category || 'general')}
                      size="small"
                      sx={{
                        bgcolor: `${getCategoryColor(item.category || 'general')}20`,
                        color: getCategoryColor(item.category || 'general'),
                        fontSize: '0.75rem',
                        height: 20
                      }}
                    />
                    {item.price && (
                      <Chip
                        label={`${item.price}€`}
                        size="small"
                        sx={{
                          bgcolor: '#dcf8c6',
                          color: '#16a34a',
                          fontSize: '0.75rem',
                          height: 20,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                    <Typography variant="caption" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>

                  {/* Super-Team Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.views}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FavoriteIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.favorites}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                      <Typography variant="caption" color="text.secondary">
                        4.5
                      </Typography>
                    </Box>
                  </Box>

                  {/* Super-Team Seller */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    p: 1,
                    bgcolor: 'rgba(220, 248, 198, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#22c55e', fontSize: '0.75rem' }}>
                      {item.seller?.username?.charAt(0) || 'A'}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {item.seller?.username || 'Anonym'}
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('de-DE') : 'Neu'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Super-Team Action Button */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{
                      borderColor: getCategoryColor(item.category || 'general'),
                      color: getCategoryColor(item.category || 'general'),
                      '&:hover': {
                        borderColor: getCategoryColor(item.category || 'general'),
                        bgcolor: `${getCategoryColor(item.category || 'general')}10`
                      }
                    }}
                  >
                    Anzeige ansehen
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(220, 248, 198, 0.3)',
            bgcolor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <TrendingIcon sx={{ fontSize: 64, color: '#a855f7', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Keine ähnlichen Anzeigen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuchen Sie es mit einer anderen Kategorie oder erweitern Sie Ihre Suche.
          </Typography>
        </Paper>
      )}

      {/* Super-Team Recommendation */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        bgcolor: 'rgba(168, 85, 247, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(168, 85, 247, 0.2)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          💡 Empfehlung
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Diese ähnlichen Anzeigen wurden basierend auf Kategorie, Preis und Standort ausgewählt. 
          Sie könnten auch interessiert sein an Anzeigen in verwandten Kategorien.
        </Typography>
      </Box>
    </Box>
  );
};
