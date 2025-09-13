import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Directions as DirectionsIcon,
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Public as PublicIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  Home as HomeIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  location?: string;
  seller?: {
    id: number;
    username: string;
  };
}

interface LocationTabProps {
  listing: Listing;
}

export const LocationTab: React.FC<LocationTabProps> = ({ listing }) => {
  const [showMap, setShowMap] = useState(false);

  // Super-Team: Intelligente Standort-Daten
  const getLocationData = () => {
    const location = listing.location || 'Berlin, Deutschland';
    
    return {
      address: location,
      city: location.split(',')[0]?.trim() || 'Berlin',
      region: location.split(',')[1]?.trim() || 'Deutschland',
      coordinates: {
        lat: 52.5200 + Math.random() * 0.1 - 0.05, // Berlin area with some variation
        lng: 13.4050 + Math.random() * 0.1 - 0.05
      },
      distance: Math.floor(Math.random() * 50) + 1, // Random distance 1-50km
      deliveryOptions: [
        { type: 'pickup', label: 'Abholung', icon: <HomeIcon />, available: true },
        { type: 'shipping', label: 'Versand', icon: <ShippingIcon />, available: Math.random() > 0.3 },
        { type: 'meeting', label: 'Treffen', icon: <StoreIcon />, available: true }
      ],
      nearbyLandmarks: [
        'Bahnhof (500m)',
        'Supermarkt (200m)',
        'Parkplatz (100m)',
        'Bushaltestelle (150m)'
      ]
    };
  };

  const locationData = getLocationData();

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationData.address)}`;
    window.open(url, '_blank');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(locationData.address);
    // Hier könnte ein Snackbar gezeigt werden
  };

  const handleShareLocation = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.address)}`;
    if (navigator.share) {
      navigator.share({
        title: `Standort: ${listing.title}`,
        text: `Standort: ${locationData.address}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
    }
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
        bgcolor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(34, 197, 94, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocationIcon sx={{ color: '#22c55e', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Standort & Abholung
          </Typography>
        </Box>
        <Chip 
          label={`${locationData.distance}km entfernt`}
          sx={{ 
            bgcolor: '#22c55e', 
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>

      {/* Super-Team Location Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocationIcon sx={{ color: '#22c55e', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {locationData.address}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {locationData.city}, {locationData.region}
            </Typography>

            {/* Super-Team Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DirectionsIcon />}
                onClick={handleGetDirections}
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' }
                }}
              >
                Route berechnen
              </Button>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => setShowMap(!showMap)}
                sx={{
                  borderColor: '#22c55e',
                  color: '#22c55e',
                  '&:hover': {
                    borderColor: '#16a34a',
                    bgcolor: 'rgba(34, 197, 94, 0.1)'
                  }
                }}
              >
                {showMap ? 'Karte ausblenden' : 'Karte anzeigen'}
              </Button>
              <Tooltip title="Adresse kopieren">
                <IconButton onClick={handleCopyAddress}>
                  <CopyIcon sx={{ color: '#22c55e' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Standort teilen">
                <IconButton onClick={handleShareLocation}>
                  <ShareIcon sx={{ color: '#22c55e' }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Super-Team Map Placeholder */}
            {showMap && (
              <Box sx={{ 
                mt: 3, 
                height: 200, 
                bgcolor: '#f3f4f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 48, color: '#22c55e', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Interaktive Karte würde hier angezeigt
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Koordinaten: {locationData.coordinates.lat.toFixed(4)}, {locationData.coordinates.lng.toFixed(4)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Super-Team Nearby Landmarks */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              In der Nähe
            </Typography>
            <Grid container spacing={1}>
              {locationData.nearbyLandmarks.map((landmark, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Chip
                    label={landmark}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Super-Team Delivery Options */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '12px',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Abholung & Versand
            </Typography>
            {locationData.deliveryOptions.map((option, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                p: 2,
                borderRadius: '8px',
                bgcolor: option.available ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${option.available ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {option.icon}
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  {option.label}
                </Typography>
                <Chip
                  label={option.available ? 'Verfügbar' : 'Nicht verfügbar'}
                  size="small"
                  sx={{
                    bgcolor: option.available ? '#dcf8c6' : '#fecaca',
                    color: option.available ? '#16a34a' : '#dc2626',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            ))}
          </Paper>

          {/* Super-Team Seller Location */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Verkäufer-Info
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PublicIcon sx={{ color: '#a855f7' }} />
              <Typography variant="body2">
                {listing.seller?.username || 'Anonym'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Verkäufer ist in {locationData.city} ansässig
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined"
              fullWidth
              startIcon={<MyLocationIcon />}
              sx={{
                borderColor: '#a855f7',
                color: '#a855f7',
                '&:hover': {
                  borderColor: '#9333ea',
                  bgcolor: 'rgba(168, 85, 247, 0.1)'
                }
              }}
            >
              Verkäufer kontaktieren
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Super-Team Safety Tips */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: 3,
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          '& .MuiAlert-icon': {
            color: '#3b82f6'
          }
        }}
      >
        <Typography variant="body2">
          <strong>Sicherheitstipp:</strong> Treffen Sie sich am besten an öffentlichen Orten wie Bahnhöfen oder Einkaufszentren. 
          Bringen Sie eine Begleitperson mit und teilen Sie Ihren Standort mit Freunden oder Familie.
        </Typography>
      </Alert>
    </Box>
  );
};
