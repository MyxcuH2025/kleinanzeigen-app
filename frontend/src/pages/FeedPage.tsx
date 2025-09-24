import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  PersonAdd,
  Store,
  TrendingUp,
  People,
  FilterList,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import AdCard from '../components/AdCard';
// import { StoriesFeature } from '../features/stories';

// Lokale Definitionen
interface FeedListing {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  user_id: number;
  view_count: number;
  condition?: string;
  seller?: {
    id: number;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  is_from_followed: boolean;
}

interface FeedResponse {
  listings: FeedListing[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  following_count: number;
  is_personalized: boolean;
}

const FeedPage: React.FC = () => {
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const loadFeed = async (offset = 0, append = false) => {
    try {
      if (!user) {
        setError('Bitte logge dich ein, um deinen Feed zu sehen');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const apiUrl = 'http://localhost:8000'; // TEMP: Immer lokales Backend verwenden
      const response = await fetch(`${apiUrl}/api/feed?limit=20&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Feed konnte nicht geladen werden');
      }

      const data: FeedResponse = await response.json();
      
      if (append && feedData) {
        setFeedData({
          ...data,
          listings: [...feedData.listings, ...data.listings]
        });
      } else {
        setFeedData(data);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(0, false);
  };

  const handleLoadMore = () => {
    if (feedData?.pagination.has_more) {
      loadFeed(feedData.pagination.offset + feedData.pagination.limit, true);
    }
  };

  const handleListingClick = (listingId: number) => {
    navigate(`/listings/${listingId}`);
  };

  const handleSellerClick = (sellerId: number) => {
    navigate(`/user/${sellerId}`);
  };

  useEffect(() => {
    loadFeed();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Bitte logge dich ein, um deinen personalisierten Feed zu sehen.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Anmelden
        </Button>
      </Container>
    );
  }

  if (loading && !feedData) {
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Erneut versuchen
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            📰 Mein Feed
          </Typography>
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ 
              backgroundColor: 'primary.light',
              '&:hover': { backgroundColor: 'primary.main' }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>

        {/* Feed-Info */}
        {/* Stories-Feature - TEMPORÄR DEAKTIVIERT */}
        {/* <StoriesFeature 
          showInFeed={true}
          showCreateButton={true}
          maxStories={10}
        /> */}

        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<People />}
              label={`${feedData?.following_count || 0} gefolgte Accounts`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={feedData?.is_personalized ? <TrendingUp /> : <FilterList />}
              label={feedData?.is_personalized ? 'Personalisierter Feed' : 'Beliebte Anzeigen'}
              color={feedData?.is_personalized ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              label={`${feedData?.pagination.total || 0} Anzeigen verfügbar`}
              color="info"
              variant="outlined"
            />
          </Stack>
        </Paper>

        {/* Follow-Hinweis */}
        {feedData?.following_count === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Entdecke neue Accounts!</strong> Folge Shops und Verkäufern, um personalisierte Anzeigen in deinem Feed zu sehen.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/entities')}
              sx={{ mt: 1 }}
            >
              Accounts entdecken
            </Button>
          </Alert>
        )}
      </Box>

      {/* Feed-Listings */}
      {feedData?.listings && feedData.listings.length > 0 ? (
        <>
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
            alignItems: 'start'
          }}>
            {Array.isArray(feedData.listings) ? feedData.listings.map((listing) => (
              <Box key={listing.id} position="relative">
                {/* Followed-Badge */}
                {listing.is_from_followed && (
                  <Tooltip title="Von gefolgtem Account">
                    <Chip
                      label="Gefolgt"
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Tooltip>
                )}
                
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
                  seller={listing.seller}
                  vehicleDetails={undefined}
                />
              </Box>
            ))}
          </Box>

          {/* Load More Button */}
          {feedData.pagination.has_more && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
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
        </>
      ) : null}
      {!Array.isArray(feedData.listings) && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Anzeigen im Feed
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {feedData?.following_count === 0 
              ? 'Folge Accounts, um personalisierte Anzeigen zu sehen.'
              : 'Es gibt derzeit keine neuen Anzeigen von deinen gefolgten Accounts.'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/entities')}
          >
            Accounts entdecken
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default FeedPage;
