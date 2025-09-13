import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
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
  Fab,
  Zoom,
  Slide,
  Collapse,
  Badge,
  LinearProgress
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
  Schedule as ScheduleIcon,
  KeyboardArrowUp as ScrollTopIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Fullscreen as FullscreenIcon
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

interface SectionRef {
  ref: React.RefObject<HTMLElement>;
  title: string;
  id: string;
}

const ListingDetailNextLevel: React.FC = () => {
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
  const [activeSection, setActiveSection] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1])); // Properties & Description expanded by default
  const [similarListings, setSimilarListings] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // Refs für Smart Navigation
  const headerRef = useRef<HTMLElement>(null);
  const propertiesRef = useRef<HTMLElement>(null);
  const descriptionRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const similarRef = useRef<HTMLElement>(null);

  const sections: SectionRef[] = [
    { ref: propertiesRef, title: 'Eigenschaften', id: 'properties' },
    { ref: descriptionRef, title: 'Beschreibung', id: 'description' },
    { ref: reviewsRef, title: 'Bewertungen', id: 'reviews' },
    { ref: locationRef, title: 'Standort', id: 'location' },
    { ref: similarRef, title: 'Ähnliche', id: 'similar' }
  ];

  // Memoized Values
  const isFavorited = useMemo(() => {
    return ad ? favorites.has(ad.id.toString()) : false;
  }, [favorites, ad]);

  const canContact = useMemo(() => {
    return user && ad && user.id !== ad.user_id;
  }, [user, ad]);

  // Smart Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);

      // Find active section based on scroll position
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const scrollPosition = scrollY + headerHeight + 100;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].ref.current;
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Auto-play images
  useEffect(() => {
    if (autoPlay && ad?.images.length > 1) {
      const interval = setInterval(() => {
        setImageIndex(prev => (prev + 1) % ad.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, ad?.images.length]);

  // Daten laden
  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Enhanced Demo-Daten für bessere UX
      const mockData: Ad = {
        id: parseInt(id),
        title: "Next-Level UX Detail-Seite mit Smart Navigation",
        description: `Diese Demo-Anzeige zeigt die **Next-Level UX Detail-Seite** mit revolutionären Features:

## 🚀 **Smart Navigation Features:**
• **Scroll-basierte Navigation**: Automatische Sektion-Erkennung
• **Progressive Disclosure**: Wichtige Infos above-the-fold
• **Smart CTAs**: Conversion-optimierte Call-to-Actions
• **Mobile-First**: Swipe-Gestures und Touch-Optimierung
• **Performance**: Progressive Loading für bessere UX

## 📱 **Mobile UX Revolution:**
• **Swipe-Navigation**: Intuitive Touch-Gestures
• **Floating Action Buttons**: Immer sichtbare Aktionen
• **Smart Expansion**: Intelligente Sektion-Aufklappung
• **One-Hand Navigation**: Optimiert für Mobile-Usage

## 🎯 **Conversion-Optimierung:**
• **Above-the-fold CTAs**: Sofort sichtbare Kontakt-Buttons
• **Social Proof**: Bewertungen und Favoriten prominent
• **Urgency Indicators**: "Sofort verfügbar" Badges
• **Trust Signals**: Verkäufer-Verifikation und Online-Status

## ⚡ **Performance-Features:**
• **Progressive Loading**: Schnelle initiale Ladezeiten
• **Smart Caching**: Intelligente Daten-Vorladung
• **Lazy Images**: Optimierte Bild-Ladezeiten
• **Smooth Animations**: 60fps Transitions

Diese Seite ist das Ergebnis von 10 Super-Team Experten und optimiert für 40.000+ User!`,
        price: 399.99,
        category: "UX Design & Development",
        location: "Berlin, Deutschland",
        images: ["/images/noimage.jpeg", "/images/noimage.jpeg", "/images/noimage.jpeg"],
        user_id: 1,
        created_at: new Date().toISOString(),
        status: "active",
        views: 2847,
        favorites: 156,
        attributes: {
          zustand: "Neu",
          versand: true,
          garantie: true,
          verhandelbar: false,
          sofort_kauf: true,
          rückgabe: true,
          abholung: true,
          bezahlung: "PayPal, Überweisung, Bar, Krypto",
          verfügbarkeit: "Sofort verfügbar",
          kategorie: "UX Design & Development",
          tags: ["React", "TypeScript", "Material-UI", "Performance", "UX", "Mobile-First"],
          features: ["Smart Navigation", "Progressive Loading", "Mobile Optimized", "Conversion Focused"]
        },
        seller: {
          id: 1,
          name: "UX Expert Pro",
          avatar: "/images/noimage.jpeg",
          rating: 4.9,
          review_count: 247,
          online: true,
          phone: "+49 123 456789",
          email: "ux@example.com",
          responseTime: "Innerhalb 30 Minuten"
        }
      };
      
      setAd(mockData);
      
      // Enhanced Mock Reviews
      setReviews([
        {
          id: 1,
          user: { name: "Max M.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Revolutionäre UX! Die Smart Navigation ist genial - alles ist intuitiv und schnell erreichbar.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          helpful: 23
        },
        {
          id: 2,
          user: { name: "Sarah K.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Perfekte Mobile-Optimierung. Die Swipe-Gestures und Floating Buttons sind game-changing!",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          helpful: 18
        },
        {
          id: 3,
          user: { name: "Tom L.", avatar: "/images/noimage.jpeg" },
          rating: 5,
          comment: "Die Conversion-Optimierung ist beeindruckend. CTAs sind perfekt platziert und sichtbar.",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          helpful: 15
        }
      ]);

      // Enhanced Similar Listings
      setSimilarListings([
        { 
          ...mockData, 
          id: 2, 
          title: "UX Design Masterclass", 
          price: 299.99,
          views: 1567,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        { 
          ...mockData, 
          id: 3, 
          title: "Mobile-First Development", 
          price: 449.99,
          views: 2341,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        { 
          ...mockData, 
          id: 4, 
          title: "Performance Optimization", 
          price: 199.99,
          views: 892,
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
          text: "Ja, das Produkt ist sofort verfügbar! Haben Sie Fragen dazu?",
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

  const scrollToSection = (index: number) => {
    const section = sections[index];
    if (section.ref.current) {
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const targetPosition = section.ref.current.offsetTop - headerHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Loading State
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress sx={{ color: '#dcf8c6' }} />
          <Typography variant="body2" color="text.secondary">
            Lade Next-Level UX...
          </Typography>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
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
    <Container maxWidth="lg" sx={{ py: 0 }}>
      {/* Smart Header - Sticky */}
      <Paper 
        ref={headerRef}
        elevation={0} 
        sx={{ 
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #f0f0f0',
          borderRadius: 0,
          mb: 3
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {ad.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dcf8c6' }}>
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

          {/* Smart Meta Info */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
              label="Sofort verfügbar" 
              size="small" 
              color="success"
            />
          </Box>

          {/* Smart Navigation */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {sections.map((section, index) => (
              <Button
                key={section.id}
                onClick={() => scrollToSection(index)}
                variant={activeSection === index ? "contained" : "outlined"}
                size="small"
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: activeSection === index ? '#dcf8c6' : 'transparent',
                  color: activeSection === index ? '#1a1a1a' : '#666',
                  borderColor: '#dcf8c6',
                  '&:hover': { 
                    bgcolor: activeSection === index ? '#c8e6c9' : 'rgba(220, 248, 198, 0.1)' 
                  }
                }}
              >
                {section.title}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Enhanced Image Gallery */}
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="400"
                image={ad.images[imageIndex] || '/images/noimage.jpeg'}
                alt={ad.title}
                sx={{ objectFit: 'cover' }}
              />
              
              {/* Image Controls */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                {ad.images.length > 1 && (
                  <Tooltip title={autoPlay ? "Auto-Play stoppen" : "Auto-Play starten"}>
                    <IconButton
                      onClick={() => setAutoPlay(!autoPlay)}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                      }}
                    >
                      {autoPlay ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Vollbild">
                  <IconButton
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                    }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Image Counter */}
              {ad.images.length > 1 && (
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <Chip 
                    label={`${imageIndex + 1} / ${ad.images.length}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}
                  />
                </Box>
              )}
            </Box>
          </Card>

          {/* Smart Sections */}
          <Box ref={propertiesRef} sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(220, 248, 198, 0.1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleSection(0)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Eigenschaften
                </Typography>
                <IconButton size="small">
                  {expandedSections.has(0) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.has(0)}>
                <Box sx={{ p: 3 }}>
                  <ListingProperties 
                    attributes={ad.attributes || {}} 
                    title=""
                  />
                </Box>
              </Collapse>
            </Paper>
          </Box>

          <Box ref={descriptionRef} sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(220, 248, 198, 0.1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleSection(1)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Beschreibung
                </Typography>
                <IconButton size="small">
                  {expandedSections.has(1) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.has(1)}>
                <Box sx={{ p: 3 }}>
                  <ListingDescription 
                    description={ad.description}
                    title=""
                    onShare={handleShare}
                    onBookmark={handleToggleFavorite}
                    isBookmarked={isFavorited}
                  />
                </Box>
              </Collapse>
            </Paper>
          </Box>

          <Box ref={reviewsRef} sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(220, 248, 198, 0.1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleSection(2)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Bewertungen ({reviews.length})
                </Typography>
                <IconButton size="small">
                  {expandedSections.has(2) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.has(2)}>
                <Box sx={{ p: 3 }}>
                  <ListingReviews 
                    reviews={reviews}
                    averageRating={ad.seller?.rating}
                    totalReviews={ad.seller?.review_count}
                  />
                </Box>
              </Collapse>
            </Paper>
          </Box>

          <Box ref={locationRef} sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(220, 248, 198, 0.1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleSection(3)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Standort & Kontakt
                </Typography>
                <IconButton size="small">
                  {expandedSections.has(3) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.has(3)}>
                <Box sx={{ p: 3 }}>
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
              </Collapse>
            </Paper>
          </Box>

          <Box ref={similarRef} sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(220, 248, 198, 0.1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => toggleSection(4)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ähnliche Anzeigen ({similarListings.length})
                </Typography>
                <IconButton size="small">
                  {expandedSections.has(4) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.has(4)}>
                <Box sx={{ p: 3 }}>
                  <SimilarListings 
                    listings={similarListings}
                    title=""
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
              </Collapse>
            </Paper>
          </Box>
        </Grid>

        {/* Enhanced Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 120 }}>
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

      {/* Floating Action Buttons */}
      <Zoom in={showScrollTop}>
        <Fab
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#dcf8c6',
            color: '#1a1a1a',
            '&:hover': { bgcolor: '#c8e6c9' }
          }}
        >
          <ScrollTopIcon />
        </Fab>
      </Zoom>

      {/* Mobile Contact FAB */}
      {isMobile && canContact && (
        <Fab
          onClick={() => handleContact('phone')}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#dcf8c6',
            color: '#1a1a1a',
            '&:hover': { bgcolor: '#c8e6c9' }
          }}
        >
          <PhoneIcon />
        </Fab>
      )}
    </Container>
  );
};

export default ListingDetailNextLevel;
