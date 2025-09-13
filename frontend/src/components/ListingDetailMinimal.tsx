import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Avatar,
  Rating,
  TextField,
  CircularProgress,
  Alert,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Copy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import bestehende Services
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { apiService } from '@/services/api';

// Types
interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  user_id: number;
  created_at: string;
  status: 'active' | 'paused' | 'draft' | 'expired';
  views: number;
  favorites: number;
  attributes?: Record<string, any>;
  seller?: {
    id: number;
    name: string;
    avatar?: string;
    rating?: number;
    review_count?: number;
    online?: boolean;
    phone?: string;
    email?: string;
  };
}

const ListingDetailMinimal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { showSnackbar } = useSnackbar();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'properties' | 'description' | 'reviews' | 'location' | 'similar'>('properties');
  const [expanded, setExpanded] = useState(false);
  const [similarListings, setSimilarListings] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Memoized Values
  const isFavorited = useMemo(() => {
    return ad ? favorites.has(ad.id.toString()) : false;
  }, [favorites, ad]);

  const canContact = useMemo(() => {
    return user && ad && user.id !== ad.user_id;
  }, [user, ad]);

  // Daten laden
  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Fallback zu Demo-Daten für bessere UX
      const mockData: Ad = {
        id: parseInt(id),
        title: "Minimalistisches Next-Level Design",
        description: "Diese Demo-Anzeige zeigt die neue minimalistisch-design Detail-Seite. Weniger visueller Aufwand, aber mehr Funktionalität.\n\nFeatures:\n• Inline-Eigenschaften ohne Tabs\n• Smart-Expansion für Beschreibung\n• Kompakte Bewertungen\n• Minimaler Standort-Info\n• Intelligente ähnliche Anzeigen",
        price: 199.99,
        category: "Design",
        location: "Berlin",
        images: ["/images/noimage.jpeg"],
        user_id: 1,
        created_at: new Date().toISOString(),
        status: "active",
        views: 156,
        favorites: 23,
        attributes: {
          zustand: "Neu",
          versand: true,
          garantie: true,
          verhandelbar: false
        },
        seller: {
          id: 1,
          name: "Design Expert",
          avatar: "/images/noimage.jpeg",
          rating: 4.9,
          review_count: 89,
          online: true,
          phone: "+49 123 456789",
          email: "design@example.com"
        }
      };
      
      setAd(mockData);
      setReviews([
        {
          id: 1,
          user: { name: "Max M.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Perfektes minimalistisches Design!",
          created_at: new Date().toISOString()
        }
      ]);
      setSimilarListings([
        { ...mockData, id: 2, title: "Ähnliches Design Item", price: 149.99 },
        { ...mockData, id: 3, title: "Verwandtes Produkt", price: 249.99 }
      ]);
    } catch (err: any) {
      setError('Anzeige konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event Handlers
  const handleToggleFavorite = useCallback(async () => {
    if (!ad || !user) return;
    try {
      if (isFavorited) {
        await removeFavorite(ad.id.toString());
        showSnackbar('Aus Favoriten entfernt', 'success');
      } else {
        await addFavorite(ad.id.toString());
        showSnackbar('Zu Favoriten hinzugefügt', 'success');
      }
    } catch (err) {
      showSnackbar('Fehler beim Aktualisieren der Favoriten', 'error');
    }
  }, [ad, user, isFavorited, addFavorite, removeFavorite, showSnackbar]);

  const handleShare = useCallback(() => {
    if (navigator.share && ad) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSnackbar('Link kopiert', 'success');
    }
  }, [ad, showSnackbar]);

  const handleContact = useCallback((method: 'phone' | 'email') => {
    if (!ad?.seller) return;
    
    if (method === 'phone' && ad.seller.phone) {
      window.open(`tel:${ad.seller.phone}`);
    } else if (method === 'email' && ad.seller.email) {
      window.open(`mailto:${ad.seller.email}`);
    }
  }, [ad]);

  // Loading State
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#dcf8c6' }} />
        </Box>
      </Container>
    );
  }

  // Error State
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!ad) return null;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {ad.title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#dcf8c6' }}>
              € {ad.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}>
              <IconButton onClick={handleToggleFavorite}>
                {isFavorited ? <FavoriteIcon sx={{ color: '#dcf8c6' }} /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Teilen">
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Meta Info */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={ad.category} size="small" />
          <Chip label={ad.location} size="small" variant="outlined" />
          <Chip label={`${ad.views} Aufrufe`} size="small" variant="outlined" />
          <Chip label={`${ad.favorites} Favoriten`} size="small" variant="outlined" />
        </Box>
      </Box>

      {/* Hauptinhalt */}
      <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
        
        {/* Eigenschaften - Inline */}
        {activeSection === 'properties' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Eigenschaften
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(ad.attributes || {}).map(([key, value]) => (
                <Grid item xs={6} sm={4} key={key}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    {typeof value === 'boolean' ? (
                      <Chip
                        icon={value ? <CheckIcon /> : <CancelIcon />}
                        label={value ? 'Ja' : 'Nein'}
                        color={value ? 'success' : 'error'}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {String(value)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Beschreibung - Smart Expansion */}
        {activeSection === 'description' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Beschreibung
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'none' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {ad.description}
            </Typography>
            {ad.description.length > 150 && (
              <Button
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mt: 1, color: '#dcf8c6' }}
              >
                {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              </Button>
            )}
          </Box>
        )}

        {/* Bewertungen - Kompakt */}
        {activeSection === 'reviews' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Bewertungen ({reviews.length})
            </Typography>
            {ad.seller?.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={ad.seller.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {ad.seller.rating} ({ad.seller.review_count} Bewertungen)
                </Typography>
              </Box>
            )}
            {reviews.map((review) => (
              <Box key={review.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar src={review.user.avatar} sx={{ width: 24, height: 24, mr: 1 }}>
                    {review.user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.user.name}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" sx={{ ml: 1 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {review.comment}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Standort - Minimal */}
        {activeSection === 'location' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Standort
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: '#dcf8c6' }} />
              <Typography variant="body1">{ad.location}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => handleContact('phone')}
                size="small"
              >
                Anrufen
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => handleContact('email')}
                size="small"
              >
                E-Mail
              </Button>
            </Box>
          </Box>
        )}

        {/* Ähnliche Anzeigen - Smart */}
        {activeSection === 'similar' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Ähnliche Anzeigen
            </Typography>
            <Grid container spacing={2}>
              {similarListings.map((listing) => (
                <Grid item xs={12} sm={6} key={listing.id}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/listing/${listing.id}`)}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={listing.images[0] || '/images/noimage.jpeg'}
                      alt={listing.title}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {listing.title}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#dcf8c6', fontWeight: 700 }}>
                        € {listing.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {[
              { key: 'properties', label: 'Eigenschaften', icon: <InfoIcon /> },
              { key: 'description', label: 'Beschreibung', icon: <InfoIcon /> },
              { key: 'reviews', label: 'Bewertungen', icon: <StarIcon /> },
              { key: 'location', label: 'Standort', icon: <LocationIcon /> },
              { key: 'similar', label: 'Ähnliche', icon: <InfoIcon /> }
            ].map((section) => (
              <Button
                key={section.key}
                onClick={() => setActiveSection(section.key as any)}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 1.5,
                  borderRadius: 0,
                  color: activeSection === section.key ? '#dcf8c6' : '#666',
                  borderBottom: activeSection === section.key ? '2px solid #dcf8c6' : '2px solid transparent',
                  '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.1)' }
                }}
              >
                {section.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Verkäufer Info - Kompakt */}
      {ad.seller && (
        <Paper elevation={0} sx={{ mt: 3, p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={ad.seller.avatar} sx={{ mr: 2, bgcolor: '#dcf8c6' }}>
              {ad.seller.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {ad.seller.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={ad.seller.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {ad.seller.rating} ({ad.seller.review_count} Bewertungen)
                </Typography>
                <Chip 
                  label={ad.seller.online ? 'Online' : 'Offline'} 
                  color={ad.seller.online ? 'success' : 'default'}
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>
          </Box>

          {canContact && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                sx={{ 
                  bgcolor: '#dcf8c6', 
                  color: '#1a1a1a',
                  '&:hover': { bgcolor: '#c8e6c9' }
                }}
              >
                Nachricht senden
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => handleContact('phone')}
              >
                Anrufen
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ListingDetailMinimal;
