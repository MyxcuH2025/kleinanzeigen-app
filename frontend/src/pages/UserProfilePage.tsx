import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Rating,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Language,
  Message,
  ArrowBack,
  Store,
  Search,
  Call,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { userProfileService } from '../services/userProfileService';
import AdCard from '../components/AdCard';
import FollowButton from '../components/FollowButton';
import Breadcrumb from '../components/Breadcrumb';
import CustomIcon from '../components/CustomIcon';
import { breadcrumbService } from '../services/breadcrumbService';
import { getImageUrl } from '../utils/imageUtils';

// Lokale Definitionen um Caching-Probleme zu vermeiden
interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  verification_state: string;
  verification_text: string;
  is_verified: boolean;
  created_at: string;
  location: string;
  phone: string;
  bio: string;
  website?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface UserListing {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  is_featured: boolean;
  view_count: number;
  contact_phone?: string;
  contact_email?: string;
  condition?: string;
  delivery_options: string[];
}


const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  });
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadUserProfile(parseInt(id));
    }
  }, [id]);

  const loadUserProfile = async (userId: number, offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userProfileService.getUserProfile(userId, 20, offset);
      
      setProfile(response.user);
      setListings(offset === 0 ? response.listings : [...listings, ...response.listings]);
      setPagination(response.pagination);
      
      // Breadcrumb-Pfad erstellen
      if (offset === 0) { // Nur beim ersten Laden
        const userName = `${response.user.first_name || 'Unbekannt'} ${response.user.last_name || 'User'}`;
        const breadcrumbPath = breadcrumbService.getUserProfileBreadcrumb(userName, userId);
        setBreadcrumbItems(breadcrumbPath);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('nicht gefunden')) {
          setError('Benutzer nicht gefunden');
        } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          setError('Verbindungsfehler - Backend nicht erreichbar');
        } else {
          setError(`Fehler beim Laden des Profils: ${err.message}`);
        }
      } else {
        setError('Unbekannter Fehler beim Laden des Profils');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreListings = () => {
    if (id && pagination.has_more) {
      loadUserProfile(parseInt(id), pagination.offset + pagination.limit);
    }
  };

  const handleListingClick = (listingId: number) => {
    navigate(`/listings/${listingId}`);
  };

  const handleContactUser = () => {
    // TODO: Implement contact functionality
    console.log('Contact user:', profile?.id);
  };

  const handleShowPhone = () => {
    // TODO: Implement phone reveal functionality
    console.log('Show phone for user:', profile?.id);
  };



  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeListings = filteredListings.filter(listing => listing.status === 'active');
  const completedListings = filteredListings.filter(listing => listing.status === 'sold' || listing.status === 'inactive');

  if (loading && !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<CustomIcon iconName="back" sx={{ fontSize: 20 }} />}
          onClick={() => navigate(-1)}
        >
          Zurück
        </Button>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Benutzer nicht gefunden
        </Alert>
      </Container>
    );
  }

  const getVerificationColor = (state: string) => {
    switch (state) {
      case 'seller_verified':
        return 'success';
      case 'email_verified':
        return 'info';
      case 'seller_pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header mit Zurück-Button */}
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Benutzer-Profil
          </Typography>
        </Box>
        
        {/* Breadcrumbs */}
        {breadcrumbItems.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Breadcrumb 
              items={breadcrumbItems}
              variant="user-profile"
              showChangeLink={false}
            />
          </Box>
        )}
      </Container>

      <Box display="flex" sx={{ gap: 3, pl: 3 }}>
        {/* Linke Sidebar - Profil-Info (Avito-Style) */}
        <Box sx={{ width: '300px', flexShrink: 0 }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, position: 'sticky', top: 20 }}>
            {/* Avatar und Name */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Avatar
                src={profile.avatar ? getImageUrl(profile.avatar) : undefined}
                sx={{
                  width: 80,
                  height: 80,
                  mb: 1.5,
                  border: '2px solid #e5e7eb',
                }}
              >
                {profile.first_name?.charAt(0) || 'U'}{profile.last_name?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" component="h2" textAlign="center" gutterBottom fontWeight={600}>
                {profile.first_name || 'Unbekannt'} {profile.last_name || 'User'}
              </Typography>
              
              {/* Rating und Reviews - TODO: Echte Bewertungen implementieren */}
              <Box display="flex" alignItems="center" mb={2}>
                <Rating
                  value={0}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Noch keine Bewertungen
                </Typography>
              </Box>

              {/* Follower/Following */}
              <Typography variant="body2" color="text.secondary" mb={2}>
                {profile.followers_count || 0} Follower{profile.following_count !== undefined ? `, ${profile.following_count} folgt` : ''}
              </Typography>

              {/* Mitglied seit */}
              <Typography variant="body2" color="text.secondary" mb={2}>
                Auf Kleinanzeigen seit {new Date(profile.created_at).getFullYear()}
              </Typography>
            </Box>

            {/* Verifizierungs-Badges */}
            <Stack spacing={1} mb={2}>
              {profile.is_verified && (
                <Box display="flex" alignItems="center">
                  <CustomIcon iconName="verified-seller" sx={{ color: '#10b981', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Verifizierter Verkäufer
                  </Typography>
                </Box>
              )}
              
              {/* TODO: Echte Transaktionsstatistiken implementieren */}
              <Box display="flex" alignItems="center">
                <CustomIcon iconName="no-purchases" sx={{ color: '#6366f1', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Noch keine Käufe
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <CustomIcon iconName="no-sales" sx={{ color: '#f59e0b', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Noch keine Verkäufe
                </Typography>
              </Box>
            </Stack>

            {/* Antwortzeit - TODO: Echte Antwortzeit implementieren */}
            <Box display="flex" alignItems="center" mb={2}>
              <CustomIcon iconName="response-time" sx={{ color: '#6b7280', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Antwortzeit unbekannt
              </Typography>
            </Box>

            {/* Kontakt-Buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CustomIcon iconName="phone" sx={{ fontSize: 20 }} />}
                onClick={handleShowPhone}
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': {
                    backgroundColor: '#059669',
                  }
                }}
              >
                Nummer anzeigen
              </Button>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<CustomIcon iconName="chat" sx={{ fontSize: 20 }} />}
                onClick={handleContactUser}
                sx={{
                  backgroundColor: '#6366f1',
                  '&:hover': {
                    backgroundColor: '#4f46e5',
                  }
                }}
              >
                Nachricht schreiben
              </Button>
              
              <FollowButton
                userId={profile.id}
                isFollowing={profile.is_following}
                size="medium"
                variant="outlined"
                showIcon={true}
                onFollowChange={(isFollowing) => {
                  // Update local state to reflect the change immediately
                  setProfile(prev => prev ? { 
                    ...prev, 
                    is_following: isFollowing,
                    followers_count: isFollowing 
                      ? (prev.followers_count || 0) + 1 
                      : Math.max((prev.followers_count || 0) - 1, 0)
                  } : null);
                  console.log('Follow status changed:', isFollowing);
                }}
              />
            </Stack>

            {/* Zusätzliche Info */}
            <Divider sx={{ my: 3 }} />
            
            {profile.location && (
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOn sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  {profile.location}
                </Typography>
              </Box>
            )}
            
            {profile.website && (
              <Box display="flex" alignItems="center" mb={1}>
                <Language sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                <Typography 
                  variant="body2" 
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => window.open(profile.website, '_blank')}
                >
                  Website besuchen
                </Typography>
              </Box>
            )}

            {/* Bio */}
            {profile.bio && profile.bio.trim() && profile.bio !== 'Keine Beschreibung' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {profile.bio}
                </Typography>
              </>
            )}
          </Paper>
        </Box>

        {/* Rechte Seite - Listings (Avito-Style) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Container maxWidth="lg" sx={{ px: 0 }}>
          {/* Tabs für Aktive/Abgeschlossene Anzeigen */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab 
                label={`Aktive ${activeListings.length}`} 
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                label={`Abgeschlossene ${completedListings.length}`} 
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {/* Suchleiste */}
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Suche im Profil"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          {/* Listings Grid */}
          {activeTab === 0 ? (
            activeListings.length === 0 ? (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Store sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Keine aktiven Anzeigen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dieser Benutzer hat derzeit keine aktiven Anzeigen.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', // Mobile: 2 Spalten
                  sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
                  md: 'repeat(3, 1fr)', // Desktop: 3 Spalten
                  lg: 'repeat(4, 1fr)', // Large: 4 Spalten
                  xl: 'repeat(5, 1fr)'  // Extra Large: 5 Spalten
                },
                gap: { xs: 1.5, sm: 1.5, md: 2, lg: 2.5 },
                alignItems: 'start' // Verhindert, dass Karten sich aneinander anpassen
              }}>
                {activeListings.map((listing) => (
                  <Box key={listing.id}>
                    <AdCard 
                      id={listing.id.toString()}
                      title={listing.title}
                      price={listing.price}
                      location={listing.location}
                      images={listing.images}
                      category={listing.category}
                      status={listing.status}
                      views={listing.view_count}
                      created_at={listing.created_at}
                      attributes={{}}
                      seller={{
                        name: `${profile.first_name || 'Unbekannt'} ${profile.last_name || 'User'}`,
                        avatar: profile.avatar ? `http://localhost:8000${profile.avatar}` : undefined
                      }}
                      vehicleDetails={undefined}
                    />
                  </Box>
                ))}
              </Box>
            )
          ) : (
            completedListings.length === 0 ? (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Store sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Keine abgeschlossenen Anzeigen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dieser Benutzer hat noch keine abgeschlossenen Anzeigen.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', // Mobile: 2 Spalten
                  sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
                  md: 'repeat(3, 1fr)', // Desktop: 3 Spalten
                  lg: 'repeat(4, 1fr)', // Large: 4 Spalten
                  xl: 'repeat(5, 1fr)'  // Extra Large: 5 Spalten
                },
                gap: { xs: 1.5, sm: 1.5, md: 2, lg: 2.5 },
                alignItems: 'start' // Verhindert, dass Karten sich aneinander anpassen
              }}>
                {completedListings.map((listing) => (
                  <Box key={listing.id} sx={{ opacity: 0.7 }}>
                    <AdCard 
                      id={listing.id.toString()}
                      title={listing.title}
                      price={listing.price}
                      location={listing.location}
                      images={listing.images}
                      category={listing.category}
                      status={listing.status}
                      views={listing.view_count}
                      created_at={listing.created_at}
                      attributes={{}}
                      seller={{
                        name: `${profile.first_name || 'Unbekannt'} ${profile.last_name || 'User'}`,
                        avatar: profile.avatar ? `http://localhost:8000${profile.avatar}` : undefined
                      }}
                      vehicleDetails={undefined}
                    />
                  </Box>
                ))}
              </Box>
            )
          )}

          {/* Load More Button */}
          {pagination.has_more && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                onClick={loadMoreListings}
                disabled={loading}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb',
                  }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Mehr Anzeigen laden'}
              </Button>
            </Box>
          )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfilePage;