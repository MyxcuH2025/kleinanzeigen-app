import * as React from 'react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '../../services/chatService';
import { useUser } from '@/context/UserContext';
import {
  Container,
  Grid,
  Box,
  Skeleton,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Lazy-loaded components for better performance
const ImageGallery = React.lazy(() => import('./components/ImageGallery'));
const PriceHeader = React.lazy(() => import('./components/PriceHeader'));
const DescriptionBlock = React.lazy(() => import('./components/DescriptionBlock'));
const TabNavigation = React.lazy(() => import('./components/TabNavigation'));
const SellerSidebar = React.lazy(() => import('./components/SellerSidebar'));
const EnhancedChatSidebar = React.lazy(() => import('./components/EnhancedChatSidebar'));
const StickyMobileBar = React.lazy(() => import('./components/StickyMobileBar'));
const ChatModal = React.lazy(() => import('./modals/ChatModal'));
const ReportModal = React.lazy(() => import('./modals/ReportModal'));

// Import types and services
import { ListingDetail, ListingSummary, ReportData } from './types';
import { useListingDetailStore } from './store/listingDetail.store';
import Breadcrumb from '@/components/Breadcrumb';
import { breadcrumbService } from '@/services/breadcrumbService';
import { categories as frontendCategories } from '@/data/categories';

// Skeleton Loader Components
const ImageGallerySkeleton = () => (
  <Box sx={{ mb: 3 }}>
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
      ))}
    </Box>
  </Box>
);

const PriceHeaderSkeleton = () => (
  <Box sx={{ mb: 3 }}>
    <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="40%" height={64} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  </Box>
);

const SellerCardSkeleton = () => (
  <Box sx={{ mb: 3 }}>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </Box>
);

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Store state and actions
  const {
    listing,
    similarListings,
    loading,
    error,
    isFavorited,
    phoneRevealed,
    revealedPhone,
    chatOpen,
    reportOpen,
    loadListing,
    loadSimilarListings,
    toggleFavorite,
    revealPhone,
    incrementView,
    startChat,
    reportListing,
    openChat,
    closeChat,
    openReport,
    closeReport
  } = useListingDetailStore();

  // Local state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);

  // Load listing data on mount
  useEffect(() => {
    if (id) {
      loadListing(id);
      // Only increment view once per session
      const viewKey = `viewed_${id}`;
      if (!sessionStorage.getItem(viewKey)) {
        incrementView(id);
        sessionStorage.setItem(viewKey, 'true');
      }
    }
  }, [id, loadListing, incrementView]);

  // Load similar listings after main listing is loaded
  useEffect(() => {
    if (listing && id) {
      loadSimilarListings(id, 5); // 5km radius
    }
  }, [listing, id, loadSimilarListings]);

  // Load breadcrumbs when listing is loaded
  useEffect(() => {
    const loadBreadcrumbs = async () => {
      if (listing && listing.category) {
        try {
          console.log('🔍 Loading breadcrumbs for category:', listing.category);
          
          // Sofortigen Fallback-Breadcrumb erstellen (kein Loading)
          // Spezielle Behandlung für Hauptseiten
          let immediateFallback;
          
          if (listing.category === 'kleinanzeigen') {
            // "kleinanzeigen" ist die Hauptseite für Kleinteile
            immediateFallback = [
              {
                id: 0,
                name: 'Home',
                slug: 'home',
                icon: '🏠',
                url: '/'
              },
              {
                id: 999,
                name: 'Kleinanzeigen',
                slug: 'kleinanzeigen',
                icon: '📦',
                url: '/'
              }
            ];
          } else if (listing.category === 'auto-rad-boot') {
            // "auto-rad-boot" ist die Hauptseite für Fahrzeuge
            immediateFallback = [
              {
                id: 0,
                name: 'Home',
                slug: 'home',
                icon: '🏠',
                url: '/'
              },
              {
                id: 999,
                name: 'Auto, Rad & Boot',
                slug: 'auto-rad-boot',
                icon: '🚗',
                url: '/category/auto-rad-boot'
              }
            ];
          } else {
            // Normale Kategorien - verwende Frontend-Kategorien für korrekte Namen
            const frontendCategory = frontendCategories.find(cat => cat.value === listing.category);
            const categoryName = frontendCategory ? frontendCategory.label : listing.category;
            const categoryIcon = frontendCategory ? frontendCategory.icon : '📦';
            
            immediateFallback = [
              {
                id: 0,
                name: 'Home',
                slug: 'home',
                icon: '🏠',
                url: '/'
              },
              {
                id: 999,
                name: categoryName,
                slug: listing.category,
                icon: categoryIcon,
                url: `/category/${listing.category}`
              }
            ];
          }
          
          setBreadcrumbItems(immediateFallback);
          
          // Versuche Backend-Daten zu laden (im Hintergrund)
          // Nur für echte Kategorien, nicht für Hauptseiten
          if (listing.category !== 'kleinanzeigen' && listing.category !== 'auto-rad-boot') {
            try {
              await breadcrumbService.loadCategories();
              const breadcrumbPath = breadcrumbService.getBreadcrumbPath(listing.category);
              
              if (breadcrumbPath.length > 0) {
                console.log('🍞 Backend breadcrumb path loaded:', breadcrumbPath);
                // Home-Breadcrumb hinzufügen, da breadcrumbService nur die Kategorie zurückgibt
                const fullPath = [
                  {
                    id: 0,
                    name: 'Home',
                    slug: 'home',
                    icon: '🏠',
                    url: '/'
                  },
                  ...breadcrumbPath
                ];
                setBreadcrumbItems(fullPath);
              }
            } catch (error) {
              console.log('⚠️ Backend breadcrumbs failed, using fallback');
            }
          } else {
            console.log('🏠 Hauptseite erkannt, Backend-Breadcrumbs übersprungen');
          }
        } catch (error) {
          console.error('Fehler beim Laden der Breadcrumbs:', error);
        }
      }
    };

    loadBreadcrumbs();
  }, [listing]);

  // Event handlers
  const handleToggleFavorite = useCallback(async () => {
    if (listing) {
      await toggleFavorite(listing.id);
    }
  }, [listing, toggleFavorite]);

  const handleShare = useCallback(() => {
    if (navigator.share && listing) {
      navigator.share({
        title: listing.title,
        text: listing.descriptionMd,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  }, [listing]);

  const handleRevealPhone = useCallback(async () => {
    if (listing) {
      await revealPhone(listing.id);
    }
  }, [listing, revealPhone]);

  const handleQuickMessage = useCallback(async (messageArg?: string) => {
    const messageToSend = (messageArg ?? quickMessage).trim();
    if (!messageToSend || !listing) return;

    // Prüfe ob User eingeloggt ist
    const token = localStorage.getItem('token');
    if (!token) {
      const nextUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?next=${nextUrl}`);
      return;
    }

    try {
      // Bestehende Konversation finden
      const conversations = await chatService.getConversations();
      let conversationId = conversations.find((c) => c.listing?.id?.toString() === listing.id?.toString())?.id;

      // Falls nicht vorhanden, erstellen
      if (!conversationId) {
        // Schutz: keine Konversation mit sich selbst
        const ownerId = Number(listing.seller.id);
        const currentUserId = Number(user?.id);
        
        if (ownerId === currentUserId) {
          console.error('Du kannst dir selbst keine Nachricht schicken.');
          return;
        }

        const listingIdNum = Number(listing.id);
        if (!Number.isInteger(listingIdNum) || listingIdNum <= 0) {
          console.error('Nachricht kann nicht gesendet werden: Ungültige Anzeige-ID.');
          return;
        }
        
        conversationId = await chatService.createConversation(Number(listingIdNum), ownerId);
      }

      // Nachricht senden
      await chatService.sendMessage(Number(conversationId), messageToSend);
      setQuickMessage('');
      
      // Navigiere direkt zum geöffneten Chat mit Kontext-Informationen
      navigate(`/chat?conversationId=${conversationId}&listingId=${listing.id}&sellerId=${listing.seller.id}&listingTitle=${encodeURIComponent(listing.title)}&listingPrice=${listing.price}`);
      
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  }, [quickMessage, listing, navigate]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleQuickMessage();
    }
  }, [handleQuickMessage]);

  const handleSendEmail = useCallback(() => {
    if (listing?.seller.email) {
      window.open(`mailto:${listing.seller.email}`);
    }
  }, [listing]);

  const handleReportListing = useCallback(async (data: ReportData) => {
    await reportListing(data);
    closeReport();
    // TODO: Show success toast
  }, [reportListing, closeReport]);

  const handleListingClick = useCallback((listingId: string) => {
    navigate(`/listing/${listingId}`);
  }, [navigate]);

  const handleViewSimilar = useCallback(() => {
    // Scroll to similar listings section
    const similarSection = document.getElementById('similar-listings');
    if (similarSection) {
      similarSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const getImageUrl = useCallback((path: string) => {
    // REPARIERT: Base64-Bilder blockieren (verursacht "gleiche platzhalter bilder")
    if (path.startsWith('data:') || path.includes('base64')) {
      console.warn('❌ Base64-Image in ListingDetail blockiert:', path.substring(0, 50) + '...');
      return null; // Kein Bild anzeigen
    }
    
    // REPARIERT: Backend sendet Bilder als /api/images/filename
    if (path.startsWith('/api/images/')) {
      return `http://localhost:8000${path}`;
    }
    // Fallback für andere Formate
    if (path.startsWith('http')) {
      return path;
    }
    if (path.startsWith('/images/')) {
      return `http://localhost:8000${path}`;
    }
    // Default fallback - füge Backend-URL hinzu
    return `http://localhost:8000/api/images/${path}`;
  }, []);

  // Loading state
  if (loading && !listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
          {/* Main Content */}
          <Box>
            <ImageGallerySkeleton />
            <PriceHeaderSkeleton />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
          </Box>
          
          {/* Sidebar */}
          <Box>
            <SellerCardSkeleton />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  // No listing found
  if (!listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="info">
          Anzeige nicht gefunden
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 1, sm: 2, md: 3 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
        gap: { xs: 2, sm: 2, md: 3 },
        alignItems: 'start'
      }}>
        {/* Main Content */}
        <Box sx={{ 
          order: { xs: 2, lg: 1 },
          minWidth: 0 // Verhindert Overflow auf kleinen Bildschirmen
        }}>
          {/* Breadcrumb Navigation */}
          {breadcrumbItems.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <Breadcrumb items={breadcrumbItems} />
            </Box>
          ) : (
            <Box sx={{ mb: 2, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                🔍 Debug: Keine Breadcrumbs (Items: {breadcrumbItems.length})
              </Typography>
            </Box>
          )}

          {/* Image Gallery */}
          <Suspense fallback={<ImageGallerySkeleton />}>
            <ImageGallery
              images={listing.media}
              selectedIndex={selectedImageIndex}
              onImageChange={setSelectedImageIndex}
              onFullscreen={() => setFullscreenOpen(true)}
              onZoom={() => setFullscreenOpen(true)}
              getImageUrl={(path: string) => getImageUrl(path) || ''}
            />
          </Suspense>

          {/* Price Header */}
          <Suspense fallback={<PriceHeaderSkeleton />}>
            <PriceHeader
              listing={listing}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
              isFavorited={isFavorited}
            />
          </Suspense>

          {/* Description Block */}
          {/* Key Details Container - Like Kleinanzeigen.de (directly under Price/Title) */}
          <Paper elevation={0} sx={{ 
            p: { xs: 2, sm: 3 }, 
            border: '1px solid #f0f0f0', 
            borderRadius: 2, 
            mb: { xs: 2, sm: 3 }
          }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: { xs: 1.5, sm: 2 }
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Kategorie:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{listing.category}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Zustand:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{listing.condition || 'Nicht angegeben'}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Erstellt:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                    {new Date(listing.createdAt).toLocaleDateString('de-DE')}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Anzeigen-ID:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                    {listing.listingIdPublic}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Standort:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{listing.location.city}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Aufrufe:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{listing.views.toLocaleString('de-DE')}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Favoriten:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{listing.favorites}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 0.5, sm: 0 },
                  minHeight: { xs: 32, sm: 'auto' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Status:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                    {listing.status === 'active' ? '✅ Verfügbar' : listing.status}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>


          {/* Description Block - Now after Key Details and Features */}
          <Suspense fallback={<Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />}>
            <DescriptionBlock
              description={listing.descriptionMd}
              onShare={handleShare}
              onBookmark={handleToggleFavorite}
              isBookmarked={isFavorited}
            />
          </Suspense>

            {/* Tab Navigation with all sections */}
            <Suspense fallback={<Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />}>
              <TabNavigation
                listing={listing}
                similarListings={similarListings}
                onTabChange={(tabIndex: number) => {
                  console.log('Tab changed to:', tabIndex);
                }}
              />
            </Suspense>
        </Box>

        {/* Sidebar */}
        <Box sx={{ 
          order: { xs: 1, lg: 2 },
          position: 'static',
          bgcolor: 'transparent',
          borderRadius: 0,
          boxShadow: 'none',
          mb: { xs: 0, lg: 0 }
        }}>
          {/* Enhanced Chat Sidebar */}
          <Suspense fallback={<Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2, mb: 3 }} />}>
            <EnhancedChatSidebar 
              seller={{
                id: listing.seller.id,
                displayName: listing.seller.displayName,
                avatarUrl: listing.seller.avatarUrl,
                rating: listing.seller.rating,
                reviewsCount: listing.seller.reviewsCount,
                isOnline: listing.seller.isOnline,
                phone: listing.seller.phone,
                email: listing.seller.email,
                responseTime: listing.seller.responseTime
              }}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onCall={handleRevealPhone}
              onEmail={() => {/* TODO: Email functionality */}}
              onShare={handleShare}
              onSendMessage={(text: string) => handleQuickMessage(text)}
              messages={[]} // TODO: Load recent messages
              isExpanded={true}
              onToggleExpanded={() => {/* TODO: Toggle functionality */}}
            />
          </Suspense>



          {/* Quick Actions */}
          <Paper elevation={0} sx={{ 
            p: { xs: 2, sm: 2.5 }, 
            border: '1px solid #e8e8e8', 
            borderRadius: 1, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            mt: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: { xs: 1.5, sm: 1.2 },
                borderRadius: 1,
                bgcolor: '#fafafa',
                border: '1px solid #f0f0f0',
                minHeight: { xs: 48, sm: 'auto' } // Touch-friendly auf Mobile
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Anzeige melden</Typography>
                <Box 
                  sx={{ 
                    cursor: 'pointer', 
                    color: '#000000',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    py: { xs: 1, sm: 0.5 },
                    px: { xs: 2, sm: 1 },
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                  onClick={openReport}
                >
                  🚨 Melden
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: { xs: 1.5, sm: 1.2 },
                borderRadius: 1,
                bgcolor: '#fafafa',
                border: '1px solid #f0f0f0',
                minHeight: { xs: 48, sm: 'auto' } // Touch-friendly auf Mobile
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Anzeige teilen</Typography>
                <Box 
                  sx={{ 
                    cursor: 'pointer', 
                    color: '#000000',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    py: { xs: 1, sm: 0.5 },
                    px: { xs: 2, sm: 1 },
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                  onClick={handleShare}
                >
                  📤 Teilen
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: { xs: 1, sm: 0.5 },
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Anzeigen-ID</Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: '#1976d2',
                  fontSize: { xs: '0.85rem', sm: '0.875rem' }
                }}>
                  {listing.listingIdPublic}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Mobile Sticky Bar */}
      {isMobile && (
        <Suspense fallback={null}>
          <StickyMobileBar
            listing={listing}
            onToggleFavorite={handleToggleFavorite}
            onContact={handleRevealPhone}
            isFavorited={isFavorited}
          />
        </Suspense>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <ChatModal
          open={chatOpen}
          onClose={closeChat}
          conversation={null} // TODO: Get conversation from store
          onSendMessage={(text: string) => {
            // TODO: Implement send message
            console.log('Send message:', text);
          }}
          loading={false}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ReportModal
          open={reportOpen}
          onClose={closeReport}
          onSubmit={handleReportListing}
          loading={false}
        />
      </Suspense>
    </Container>
  );
};

export default ListingDetailPage;
