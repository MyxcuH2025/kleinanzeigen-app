import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Chip,
  Rating,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Language,
  Store,
  Star,
  Verified,
  ArrowBack,
  Message,
  Share
} from '@mui/icons-material';
import { shopService } from '../services/shopService';
import CustomIcon from '../components/CustomIcon';

interface Shop {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  image?: string;
  banner?: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  listing_count: number;
  opening_hours?: string;
  social_media?: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
}

const ShopProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadShop(parseInt(id));
    }
  }, [id]);

  const loadShop = async (shopId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const shops = await shopService.getShops();
      const foundShop = shops.find(s => s.id === shopId);
      
      if (foundShop) {
        setShop(foundShop);
      } else {
        setError('Shop nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Shops:', error);
      setError('Fehler beim Laden des Shops');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContact = () => {
    if (shop?.email) {
      window.location.href = `mailto:${shop.email}`;
    }
  };

  const handleCall = () => {
    if (shop?.phone) {
      window.location.href = `tel:${shop.phone}`;
    }
  };

  const handleWebsite = () => {
    if (shop?.website) {
      window.open(shop.website, '_blank');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !shop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Shop nicht gefunden'}
        </Alert>
        <Button startIcon={<CustomIcon iconName="back" sx={{ fontSize: 20 }} />} onClick={handleBack}>
          Zurück
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<CustomIcon iconName="back" sx={{ fontSize: 20 }} />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Zurück
        </Button>
        
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Box display="flex" justifyContent="center">
                <Avatar
                  src={shop.image}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid #f3f4f6'
                  }}
                >
                  <Store sx={{ fontSize: 60 }} />
                </Avatar>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 9 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                  {shop.name}
                </Typography>
                {shop.verified && (
                  <Tooltip title="Verifizierter Shop">
                    <Verified sx={{ color: '#10b981', fontSize: 28 }} />
                  </Tooltip>
                )}
                {shop.featured && (
                  <Chip
                    label="Empfohlen"
                    size="small"
                    sx={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {shop.category} • {shop.location}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating value={shop.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {shop.rating} ({shop.review_count} Bewertungen)
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {shop.description}
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<CustomIcon iconName="chat" sx={{ fontSize: 20 }} />}
                  onClick={handleContact}
                  sx={{
                    backgroundColor: '#374151',
                    '&:hover': { backgroundColor: '#1f2937' }
                  }}
                >
                  Kontaktieren
                </Button>
                
                {shop.phone && (
                  <Button
                    variant="outlined"
                    startIcon={<CustomIcon iconName="phone" sx={{ fontSize: 20 }} />}
                    onClick={handleCall}
                  >
                    Anrufen
                  </Button>
                )}
                
                {shop.website && (
                  <Button
                    variant="outlined"
                    startIcon={<CustomIcon iconName="website" sx={{ fontSize: 20 }} />}
                    onClick={handleWebsite}
                  >
                    Website
                  </Button>
                )}
                
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Details */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Shop-Informationen
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LocationOn color="action" />
              <Typography variant="body2" color="text.secondary">
                {shop.address}, {shop.location}
              </Typography>
            </Box>
            
            {shop.opening_hours && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Öffnungszeiten: {shop.opening_hours}
                </Typography>
              </Box>
            )}
            
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`${shop.listing_count} Anzeigen`} size="small" />
              <Chip label="Shop" size="small" />
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Statistiken
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Star color="action" />
              <Typography variant="body2">
                {shop.rating} von 5 Sternen
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" mb={1}>
              {shop.review_count} Bewertungen
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={1}>
              {shop.listing_count} aktive Anzeigen
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Mitglied seit {new Date(shop.created_at).toLocaleDateString('de-DE')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ShopProfilePage;
