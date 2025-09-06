import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  ViewList as ListIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { apiService } from '@/services/api';

interface AnalyticsData {
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  responseRate: number;
  avgResponseTime: number;
  topPerformingListings: Array<{
    id: number;
    title: string;
    views: number;
    messages: number;
    favorites: number;
  }>;
  monthlyStats: Array<{
    month: string;
    views: number;
    messages: number;
    favorites: number;
  }>;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string;
  user_id: number;
  created_at: string;
  status: 'active' | 'paused' | 'draft' | 'expired';
  views: number;
  messages: number;
  favorites: number;
  highlighted?: boolean;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: unknown;
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    farbe: string;
    unfallfrei: boolean;
  };
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle Status');
  const [categoryFilter, setCategoryFilter] = useState('Alle Kategorien');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);


  useEffect(() => {
    if (user) {
      console.log('Benutzer ist eingeloggt, lade Dashboard-Daten...', user);
      loadDashboardData();
    } else {
      console.log('Kein Benutzer eingeloggt');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('Starte Laden der Dashboard-Daten...');
      setLoading(true);
      
      // Lade echte Daten vom Backend
      console.log('Rufe API-Endpunkte auf...');
      const [listingsResponse, analyticsResponse] = await Promise.all([
        apiService.get('/api/listings/user'),
        apiService.get('/api/analytics/user')
      ]);

      console.log('Listings-Response:', listingsResponse);
      console.log('Analytics-Response:', analyticsResponse);

      // Setze echte Anzeigen-Daten
      if ((listingsResponse as Record<string, unknown>).listings && Array.isArray((listingsResponse as Record<string, unknown>).listings)) {
        const listingsData = (listingsResponse as Record<string, unknown>).listings as Listing[];
        console.log('Setze Anzeigen-Daten:', listingsData);
        setListings(listingsData);
        
        // Extrahiere verfügbare Kategorien aus den echten Daten
        const categories: string[] = [...new Set(listingsData.map((listing: Listing) => listing.category))];
        setAvailableCategories(categories);
      } else {
        console.log('Keine Anzeigen-Daten gefunden oder falsches Format:', listingsResponse);
      }

      // Setze echte Analytics-Daten
      if (analyticsResponse) {
        const analyticsData: AnalyticsData = {
          totalViews: (analyticsResponse as Record<string, unknown>).totalViews as number || 0,
          totalMessages: (analyticsResponse as Record<string, unknown>).totalMessages as number || 0,
          totalFavorites: (analyticsResponse as Record<string, unknown>).totalFavorites as number || 0,
          responseRate: (analyticsResponse as Record<string, unknown>).responseRate as number || 0,
          avgResponseTime: (analyticsResponse as Record<string, unknown>).avgResponseTime as number || 0,
          topPerformingListings: ((analyticsResponse as Record<string, unknown>).topPerformingListings as Array<{
            id: number;
            title: string;
            views: number;
            messages: number;
            favorites: number;
          }>) || [],
          monthlyStats: ((analyticsResponse as Record<string, unknown>).monthlyStats as Array<{
            month: string;
            views: number;
            messages: number;
            favorites: number;
          }>) || []
        };
        console.log('Setze Analytics-Daten:', analyticsData);
        setAnalytics(analyticsData);
      } else {
        console.log('Keine Analytics-Daten gefunden:', analyticsResponse);
      }

    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
      showSnackbar('Fehler beim Laden der Dashboard-Daten', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    showSnackbar('Dashboard aktualisiert', 'success');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Alle Status' || listing.status === statusFilter;
    const matchesCategory = categoryFilter === 'Alle Kategorien' || listing.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'info';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  // Neue Funktionen für die Aktions-Buttons
  const handleEdit = (listing: Listing) => {
    // Navigiere zur Bearbeitungsseite
    window.open(`/edit-listing/${listing.id}`, '_blank');
  };

  const handleView = (listing: Listing) => {
    // Öffne die Anzeige in einem neuen Tab
    window.open(`/listing/${listing.id}`, '_blank');
  };

  const handleShare = async (listing: Listing) => {
    try {
      const shareUrl = `${window.location.origin}/listing/${listing.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} - ${listing.price}€`,
          url: shareUrl
        });
      } else {
        // Fallback: URL in die Zwischenablage kopieren
        await navigator.clipboard.writeText(shareUrl);
        // Hier könnte man einen Snackbar/Toast anzeigen
        alert('Link wurde in die Zwischenablage kopiert!');
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      
      const response = await fetch(`/api/listings/${listing.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Status lokal aktualisieren
        setListings(prevListings => 
          prevListings.map(l => 
            l.id === listing.id ? { ...l, status: newStatus } : l
          )
        );
      } else {
        console.error('Fehler beim Ändern des Status');
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error);
    }
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedListing) return;

    try {
      const response = await fetch(`/api/listings/${selectedListing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Anzeige aus der lokalen Liste entfernen
        setListings(prevListings => 
          prevListings.filter(l => l.id !== selectedListing.id)
        );
        setShowDeleteDialog(false);
        setSelectedListing(null);
      } else {
        console.error('Fehler beim Löschen der Anzeige');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Anzeige:', error);
    }
  };

  const handleHighlight = async (listing: Listing) => {
    try {
      const response = await fetch(`/api/listings/${listing.id}/highlight`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ highlighted: !listing.highlighted })
      });

      if (response.ok) {
        // Highlight-Status lokal aktualisieren
        setListings(prevListings => 
          prevListings.map(l => 
            l.id === listing.id ? { ...l, highlighted: !l.highlighted } : l
          )
        );
      } else {
        console.error('Fehler beim Ändern des Highlight-Status');
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Highlight-Status:', error);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">Bitte melden Sie sich an, um Ihr Dashboard zu sehen.</Alert>
      </Box>
    );
  }

  return (
    <DashboardLayout>
      {/* Debug-Informationen */}
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 0, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Debug-Info:</strong> Benutzer: {user.email} | 
          Anzeigen geladen: {listings.length} | 
          Analytics geladen: {analytics ? 'Ja' : 'Nein'} | 
          Loading: {loading ? 'Ja' : 'Nein'}
        </Typography>
      </Box>

      {/* Keine Anzeigen gefunden */}
      {!loading && listings.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            <Typography variant="h6" gutterBottom>
              Keine Anzeigen gefunden
            </Typography>
            <Typography variant="body2">
              Sie haben noch keine Anzeigen erstellt. Erstellen Sie Ihre erste Anzeige, um Ihr Dashboard zu nutzen.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Fehler beim Laden */}
      {!loading && !analytics && listings.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            <Typography variant="h6" gutterBottom>
              Daten konnten nicht geladen werden
            </Typography>
            <Typography variant="body2">
              Es gab ein Problem beim Laden Ihrer Dashboard-Daten. Versuchen Sie es erneut oder kontaktieren Sie den Support.
            </Typography>
            <Button 
              onClick={handleRefresh} 
              variant="outlined" 
              sx={{ mt: 2, borderRadius: 0 }}
            >
              Erneut versuchen
            </Button>
          </Alert>
        </Box>
      )}

      <Box sx={{ 
          bgcolor: '#ffffff', 
          minHeight: '100vh', 
          color: 'text.primary',
          '& .MuiButton-root': {
            minHeight: { xs: '48px', sm: '40px' },
            fontSize: { xs: '16px', sm: '14px' },
          },
          '& .MuiIconButton-root': {
            minWidth: { xs: '48px', sm: '40px' },
            minHeight: { xs: '48px', sm: '40px' },
          }
        }}>
        
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              Dashboard 📊
            </Typography>
            <Typography 
              variant="body1" 
              color="#7f8c8d"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Verwalte deine Anzeigen und verfolge deine Performance
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 1 },
            alignItems: 'center'
          }}>
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                minWidth: { xs: '48px', sm: '40px' },
                minHeight: { xs: '48px', sm: '40px' },
                bgcolor: '#ecf0f1',
                color: '#34495e',
                '&:hover': {
                  bgcolor: '#d5dbdb'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Key Metrics */}
        {loading ? (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 }
          }}>
            {[...Array(4)].map((_, index) => (
              <Card key={index} sx={{ 
                height: { xs: '120px', sm: '140px' },
                borderRadius: 0,
                boxShadow: 'none',
                border: '1px solid #ecf0f1',
                bgcolor: '#ffffff'
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 }
          }}>
            {[
              { title: 'Gesamtaufrufe', value: analytics?.totalViews || 0, icon: <VisibilityIcon />, color: '#e74c3c', trend: '+15%' },
              { title: 'Nachrichten', value: analytics?.totalMessages || 0, icon: <MessageIcon />, color: '#3498db', trend: '+8%' },
              { title: 'Favoriten', value: analytics?.totalFavorites || 0, icon: <FavoriteIcon />, color: '#9b59b6', trend: '+12%' },
              { title: 'Antwortrate', value: `${analytics?.responseRate || 0}%`, icon: <AssessmentIcon />, color: '#27ae60', trend: '+5%' },
            ].map((metric) => (
              <Card key={metric.title} sx={{ 
                height: { xs: '120px', sm: '140px' },
                borderRadius: 0,
                boxShadow: 'none',
                border: '1px solid #ecf0f1',
                bgcolor: '#ffffff',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f8f9fa',
                  borderColor: '#bdc3c7'
                },
                '&:active': {
                  bgcolor: '#ecf0f1'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      borderRadius: 0, 
                      bgcolor: metric.color, 
                      color: 'white',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: { xs: '32px', sm: '40px' },
                      minHeight: { xs: '32px', sm: '40px' }
                    }}>
                      {metric.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h4" 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#2c3e50',
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }}
                      >
                        {metric.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="#7f8c8d"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {metric.title}
                      </Typography>
                    </Box>
                    <Chip 
                      label={metric.trend} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#d5f4e6', 
                        color: '#27ae60',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        borderRadius: 0
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Content Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: '48px', sm: '40px' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#3498db',
                height: 3
              }
            }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Dashboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<ListIcon />} 
              label="Anzeigen" 
              iconPosition="start"
            />
            <Tab 
              icon={<ChatIcon />} 
              label="Nachrichten" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          /* Dashboard Tab */
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 2, sm: 3 }
          }}>
            {/* Top Performing Listings */}
            <Card sx={{ 
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid #ecf0f1',
              bgcolor: '#ffffff'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    mb: { xs: 2, sm: 3 }, 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }}
                >
                  Top-Performing Anzeigen
                </Typography>
                {loading ? (
                  <Box>
                    {[...Array(4)].map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={80} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    {analytics?.topPerformingListings.map((listing, index) => (
                      <Box 
                        key={listing.id}
                        sx={{ 
                          p: { xs: 2, sm: 3 }, 
                          mb: 2,
                          borderRadius: 0,
                          bgcolor: '#f8f9fa',
                          border: '1px solid #ecf0f1'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: '#2c3e50'
                            }}
                          >
                            {listing.title}
                          </Typography>
                          <Chip 
                            label={`#${index + 1}`} 
                            size="small" 
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              bgcolor: '#3498db',
                              color: 'white',
                              borderRadius: 0
                            }}
                          />
                        </Box>
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 2
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#e74c3c',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              {listing.views}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Aufrufe
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              {listing.messages}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Nachrichten
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#9b59b6',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              {listing.favorites}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Favoriten
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Monthly Performance */}
            <Card sx={{ 
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid #ecf0f1',
              bgcolor: '#ffffff'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    mb: { xs: 2, sm: 3 }, 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }}
                >
                  Monatliche Performance
                </Typography>
                {loading ? (
                  <Box>
                    {[...Array(6)].map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={60} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    {analytics?.monthlyStats.map((stat, index) => (
                      <Box key={stat.month} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: '#2c3e50'
                            }}
                          >
                            {stat.month}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="#7f8c8d"
                            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                          >
                            {stat.views} Aufrufe
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 1
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#e74c3c',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {stat.views}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Aufrufe
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {stat.messages}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Nachrichten
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#9b59b6',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {stat.favorites}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="#7f8c8d"
                              sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                            >
                              Favoriten
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stat.views / 2000) * 100} 
                          sx={{ 
                            mt: 1,
                            height: { xs: 3, sm: 4 }, 
                            borderRadius: 0,
                            bgcolor: '#ecf0f1',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#e74c3c'
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 1 && (
          /* Anzeigen Tab */
          <Box>
            {/* Search and Filter Section */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid #ecf0f1',
              bgcolor: '#ffffff'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                  alignItems: 'center'
                }}>
                  <Box>
                    <TextField
                      fullWidth
                      placeholder="Anzeigen durchsuchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          '& fieldset': {
                            borderColor: '#ecf0f1'
                          }
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                          borderRadius: 0,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ecf0f1'
                          }
                        }}
                      >
                        <MenuItem value="Alle Status">Alle Status</MenuItem>
                        <MenuItem value="active">Aktiv</MenuItem>
                        <MenuItem value="paused">Pausiert</MenuItem>
                        <MenuItem value="draft">Entwurf</MenuItem>
                        <MenuItem value="expired">Abgelaufen</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Kategorie</InputLabel>
                      <Select
                        value={categoryFilter}
                        label="Kategorie"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        sx={{
                          borderRadius: 0,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ecf0f1'
                          }
                        }}
                      >
                        <MenuItem value="Alle Kategorien">Alle Kategorien</MenuItem>
                        {availableCategories.map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                    <Button
                      variant="contained"
                      startIcon={<FilterIcon />}
                      sx={{
                        bgcolor: '#27ae60',
                        '&:hover': { bgcolor: '#229954' },
                        minHeight: { xs: '48px', sm: '40px' },
                        borderRadius: 0,
                        boxShadow: 'none'
                      }}
                    >
                      Filter
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Listings Table */}
            <Card sx={{ 
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid #ecf0f1',
              bgcolor: '#ffffff'
            }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Anzeige</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Kategorie</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Preis</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Aufrufe</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Nachrichten</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Favoriten</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Erstellt</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredListings.map((listing) => (
                        <TableRow key={listing.id} hover sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={listing.images ? (Array.isArray(listing.images) ? listing.images[0] : listing.images) : undefined}
                                sx={{ width: 50, height: 50, borderRadius: 0 }}
                              >
                                {listing.title.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: '#2c3e50' }}>
                                  {listing.title}
                                </Typography>
                                {listing.highlighted && (
                                  <Chip
                                    label="Hervorgehoben"
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      bgcolor: '#27ae60',
                                      color: 'white',
                                      borderRadius: 0
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={listing.category}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.75rem',
                                borderRadius: 0,
                                borderColor: '#ecf0f1'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                              {listing.price.toLocaleString('de-DE')} €
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={listing.status === 'active' ? 'Aktiv' : 
                                     listing.status === 'paused' ? 'Pausiert' : 
                                     listing.status === 'draft' ? 'Entwurf' : 'Abgelaufen'}
                              size="small"
                              color={getStatusColor(listing.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                              sx={{ 
                                fontSize: '0.75rem',
                                borderRadius: 0
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#7f8c8d">
                              {listing.views}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#7f8c8d">
                              {listing.messages}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#7f8c8d">
                              {listing.favorites}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#7f8c8d">
                              {new Date(listing.created_at).toLocaleDateString('de-DE')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Anzeige bearbeiten">
                                <IconButton size="small" sx={{ color: '#3498db', '&:hover': { bgcolor: '#ebf3fd' } }} onClick={() => handleEdit(listing)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Anzeige anzeigen">
                                <IconButton size="small" sx={{ color: '#17a2b8', '&:hover': { bgcolor: '#e8f4f8' } }} onClick={() => handleView(listing)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Anzeige teilen">
                                <IconButton size="small" sx={{ color: '#6c757d', '&:hover': { bgcolor: '#f8f9fa' } }} onClick={() => handleShare(listing)}>
                                  <ShareIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {listing.status === 'active' ? (
                                <Tooltip title="Anzeige pausieren">
                                  <IconButton size="small" sx={{ color: '#ffc107', '&:hover': { bgcolor: '#fff8e1' } }} onClick={() => handleToggleStatus(listing)}>
                                    <PauseIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Anzeige aktivieren">
                                  <IconButton size="small" sx={{ color: '#28a745', '&:hover': { bgcolor: '#e8f5e8' } }} onClick={() => handleToggleStatus(listing)}>
                                    <PlayIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={listing.highlighted ? 'Aus Highlight entfernen' : 'Anzeige hervorheben'}>
                                <IconButton size="small" sx={{ color: '#95a5a6', '&:hover': { bgcolor: '#ecf0f1' } }} onClick={() => handleHighlight(listing)}>
                                  <StarIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Anzeige löschen">
                                <IconButton size="small" sx={{ color: '#dc3545', '&:hover': { bgcolor: '#fde8e8' } }} onClick={() => handleDelete(listing)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          /* Nachrichten Tab */
          <Card sx={{ 
            borderRadius: 0,
            boxShadow: 'none',
            border: '1px solid #ecf0f1',
            bgcolor: '#ffffff'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 64, color: '#bdc3c7', mb: 2 }} />
              <Typography variant="h6" color="#7f8c8d" sx={{ mb: 1 }}>
                Nachrichten-Center
              </Typography>
              <Typography variant="body2" color="#7f8c8d">
                Hier werden alle Nachrichten zu deinen Anzeigen angezeigt.
              </Typography>
              <Typography variant="body2" color="#7f8c8d">
                Das Feature wird bald verfügbar sein.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 0,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#dc3545', 
          color: 'white',
          borderRadius: 0
        }}>
          Anzeige löschen
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Sind Sie sicher, dass Sie die Anzeige "{selectedListing?.title}" unwiderruflich löschen möchten?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 0 }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 0 }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};
