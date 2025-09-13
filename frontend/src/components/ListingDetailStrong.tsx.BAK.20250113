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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Fade,
  Zoom
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
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Import modulare Komponenten
import {
  ListingProperties,
  ListingDescription,
  ListingReviews,
  ListingLocation,
  SimilarListings,
  EnhancedChatSidebar
} from './ListingDetail/';

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
    responseTime?: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listing-tabpanel-${index}`}
      aria-labelledby={`listing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ListingDetailStrong: React.FC = () => {
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
  const [tabValue, setTabValue] = useState(0);
  const [similarListings, setSimilarListings] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

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
      // Starke Demo-Daten für bessere UX
      const mockData: Ad = {
        id: parseInt(id),
        title: "Starke Next-Level Detail-Seite mit modularen Komponenten",
        description: `Diese Demo-Anzeige zeigt die neue **starke Detail-Seite** mit modularen Komponenten.

## 🚀 **Features:**
• **Modulare Architektur**: Jeder Bereich ist eine separate Komponente
• **Performance-Optimiert**: Lazy Loading, Memoization, Code-Splitting
• **Responsive Design**: Mobile-first, Touch-optimiert
• **Erweiterte Funktionalität**: Reviews, Chat, ähnliche Anzeigen
• **Accessibility**: WCAG-konform, Screen-Reader optimiert

## 📱 **Mobile-Optimierungen:**
• Touch-Targets mindestens 44px
• Swipe-Gestures für Navigation
• Optimierte Ladezeiten
• Kompakte Darstellung

## 🎨 **Design-Prinzipien:**
• Minimalistisch aber funktional
• Konsistente Farbpalette (#dcf8c6)
• Klare Hierarchie
• Intuitive Navigation

Diese Seite ist optimiert für 40.000+ gleichzeitige User!`,
        price: 299.99,
        category: "Design & Entwicklung",
        location: "Berlin, Deutschland",
        images: ["/images/noimage.jpeg"],
        user_id: 1,
        created_at: new Date().toISOString(),
        status: "active",
        views: 1247,
        favorites: 89,
        attributes: {
          zustand: "Neu",
          versand: true,
          garantie: true,
          verhandelbar: false,
          sofort_kauf: true,
          rückgabe: true,
          abholung: true,
          bezahlung: "PayPal, Überweisung, Bar",
          verfügbarkeit: "Sofort verfügbar",
          kategorie: "Design & Entwicklung",
          tags: ["React", "TypeScript", "Material-UI", "Performance"]
        },
        seller: {
          id: 1,
          name: "Design Expert Pro",
          avatar: "/images/noimage.jpeg",
          rating: 4.9,
          review_count: 127,
          online: true,
          phone: "+49 123 456789",
          email: "design@example.com",
          responseTime: "Innerhalb 1 Stunde"
        }
      };
      
      setAd(mockData);
      
      // Mock Reviews
      setReviews([
        {
          id: 1,
          user: { name: "Max M.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Perfekte modulare Architektur! Sehr professionell umgesetzt.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          helpful: 12
        },
        {
          id: 2,
          user: { name: "Sarah K.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Tolle Performance-Optimierungen. Lädt super schnell!",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          helpful: 8
        },
        {
          id: 3,
          user: { name: "Tom L.", avatar: "/images/noimage.jpeg" },
          rating: 4,
          comment: "Sehr gute mobile Optimierung. Funktioniert perfekt auf dem Handy.",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          helpful: 5
        }
      ]);

      // Mock Similar Listings
      setSimilarListings([
        { 
          ...mockData, 
          id: 2, 
          title: "Ähnliches Design Item", 
          price: 199.99,
          views: 456,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        { 
          ...mockData, 
          id: 3, 
          title: "Verwandtes Produkt", 
          price: 399.99,
          views: 789,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        { 
          ...mockData, 
          id: 4, 
          title: "Komplementäres Design", 
          price: 149.99,
          views: 234,
          created_at: new Date(Date.now() - 10800000).toISOString()
        }
      ]);

      // Mock Messages
      setMessages([
        {
          id: 1,
          text: "Hallo! Ist das Produkt noch verfügbar?",
          sender: "user",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: 2,
          text: "Ja, das Produkt ist sofort verfügbar!",
          sender: "seller",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          read: true
        }
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Loading State
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#dcf8c6' }} />
        </Box>
      </Container>
    );
  }

  // Error State
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!ad) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {ad.title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#dcf8c6' }}>
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
          <Chip 
            label={ad.category} 
            size="small" 
            sx={{ bgcolor: '#dcf8c6', color: '#1a1a1a', fontWeight: 600 }}
          />
          <Chip 
            icon={<LocationIcon />}
            label={ad.location} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            icon={<VisibilityIcon />}
            label={`${ad.views} Aufrufe`} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            icon={<FavoriteIcon />}
            label={`${ad.favorites} Favoriten`} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            icon={<ScheduleIcon />}
            label={new Date(ad.created_at).toLocaleDateString('de-DE')} 
            size="small" 
            variant="outlined" 
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Image */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardMedia
              component="img"
              height="400"
              image={ad.images[0] || '/images/noimage.jpeg'}
              alt={ad.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>

          {/* Tabs */}
          <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 48
                  },
                  '& .Mui-selected': {
                    color: '#dcf8c6 !important'
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: '#dcf8c6',
                    height: 3
                  }
                }}
              >
                <Tab label="Eigenschaften" />
                <Tab label="Beschreibung" />
                <Tab label="Bewertungen" />
                <Tab label="Standort" />
                <Tab label="Ähnliche Anzeigen" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Fade in={tabValue === 0} timeout={300}>
                <Box>
                  <ListingProperties 
                    attributes={ad.attributes || {}} 
                    title="Produkteigenschaften"
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Fade in={tabValue === 1} timeout={300}>
                <Box>
                  <ListingDescription 
                    description={ad.description}
                    title="Produktbeschreibung"
                    onShare={handleShare}
                    onBookmark={handleToggleFavorite}
                    isBookmarked={isFavorited}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Fade in={tabValue === 2} timeout={300}>
                <Box>
                  <ListingReviews 
                    reviews={reviews}
                    averageRating={ad.seller?.rating}
                    totalReviews={ad.seller?.review_count}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Fade in={tabValue === 3} timeout={300}>
                <Box>
                  <ListingLocation 
                    location={{
                      address: "Musterstraße 123",
                      city: "Berlin",
                      postalCode: "10115",
                      country: "Deutschland",
                      coordinates: { lat: 52.5200, lng: 13.4050 }
                    }}
                    contact={{
                      phone: ad.seller?.phone,
                      email: ad.seller?.email,
                      availableHours: "Mo-Fr: 9-18 Uhr, Sa: 10-16 Uhr"
                    }}
                    sellerName={ad.seller?.name}
                    onCall={() => handleContact('phone')}
                    onEmail={() => handleContact('email')}
                    onShare={handleShare}
                  />
                </Box>
              </Fade>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Fade in={tabValue === 4} timeout={300}>
                <Box>
                  <SimilarListings 
                    listings={similarListings}
                    title="Ähnliche Anzeigen"
                    onListingClick={(id) => navigate(`/listing/${id}`)}
                    onToggleFavorite={(id) => {
                      if (favorites.has(id.toString())) {
                        removeFavorite(id.toString());
                      } else {
                        addFavorite(id.toString());
                      }
                    }}
                    onShare={handleShare}
                  />
                </Box>
              </Fade>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <EnhancedChatSidebar
              seller={ad.seller!}
              messages={messages}
              onSendMessage={(message) => {
                setMessages(prev => [...prev, {
                  id: Date.now(),
                  text: message,
                  sender: 'user',
                  timestamp: new Date().toISOString(),
                  read: false
                }]);
              }}
              onCall={() => handleContact('phone')}
              onEmail={() => handleContact('email')}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
              isFavorited={isFavorited}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ListingDetailStrong;
