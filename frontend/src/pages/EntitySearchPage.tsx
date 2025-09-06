import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Button,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
// Replace Grid2 usage with Box-based responsive layout
import {
  Search,
  LocationOn,
  FilterList,
  Sort,
  Verified,
  Store,
  Business,
  Person,
} from '@mui/icons-material';
import { EntityCard, EntityCardSkeleton } from '../components/EntityCard';
import { adaptShopToEntity, adaptDienstleisterToEntity, adaptUserToEntity, createContactHandlers } from '../adapters/entityAdapters';
import { entitySearchService } from '../services/entitySearchService';

// Lokale Definitionen um Caching-Probleme zu vermeiden
type EntityType = 'all' | 'shops' | 'providers' | 'users';

interface EntitySearchParams {
  type: EntityType;
  search?: string;
  location?: string;
  verified?: boolean;
  sortBy?: 'name' | 'rating' | 'created' | 'verified';
  limit?: number;
  offset?: number;
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
      id={`entity-tabpanel-${index}`}
      aria-labelledby={`entity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EntitySearchPage: React.FC = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  
  // Tab-Mapping
  const tabToType: EntityType[] = ['all', 'shops', 'providers', 'users'];
  const typeToTab: Record<EntityType, number> = { all: 0, shops: 1, providers: 2, users: 3 };
  
  const [searchParams, setSearchParams] = useState<EntitySearchParams>({
    type: (urlSearchParams.get('type') as EntityType) || 'all',
    search: urlSearchParams.get('search') || '',
    location: urlSearchParams.get('location') || '',
    verified: urlSearchParams.get('verified') === 'true' ? true : undefined,
    sortBy: (urlSearchParams.get('sortBy') as any) || 'name',
    limit: 20,
    offset: 0
  });
  
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ shops: 0, providers: 0, users: 0, total: 0 });
  const [tabValue, setTabValue] = useState(typeToTab[searchParams.type]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    searchEntities();
  }, [searchParams]);

  const loadStats = async () => {
    try {
      const statsData = await entitySearchService.getEntityStats();
      setStats(statsData);
    } catch (error) {
      console.warn('Fehler beim Laden der Statistiken:', error);
    }
  };

  const searchEntities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await entitySearchService.searchEntities(searchParams);
      setEntities(result.entities);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (error) {
      setError('Fehler beim Laden der Daten');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams(prev => ({
      ...prev,
      type: tabToType[newValue],
      offset: 0
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      search: event.target.value,
      offset: 0
    }));
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      location: event.target.value,
      offset: 0
    }));
  };

  const handleSortChange = (event: any) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: event.target.value,
      offset: 0
    }));
  };

  const handleVerifiedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      verified: event.target.checked ? true : undefined,
      offset: 0
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams(prev => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 20)
    }));
  };

  const adaptEntity = (entity: any) => {
    switch (entity._entityType) {
      case 'shop':
        return adaptShopToEntity(entity);
      case 'provider':
        return adaptDienstleisterToEntity(entity);
      case 'user':
        return adaptUserToEntity(entity);
      default:
        return null;
    }
  };

  const contactHandlers = createContactHandlers();

  const renderEntityCards = () => {
    if (loading) {
      return (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',      // Mobile: 2 Spalten
            sm: 'repeat(3, 1fr)',      // Small: 3 Spalten
            md: 'repeat(4, 1fr)',      // Medium: 4 Spalten
            lg: 'repeat(5, 1fr)',      // Large: 5 Spalten
            xl: 'repeat(6, 1fr)'       // Extra Large: 6 Spalten
          },
          gap: { xs: 1.5, sm: 2, md: 2.5, lg: 2, xl: 1.5 },
          px: { xs: 2, sm: 1, md: 0 }
        }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index}>
              <EntityCardSkeleton />
            </Box>
          ))}
        </Box>
      );
    }

    if (entities.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Ergebnisse gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuchen Sie andere Suchbegriffe oder Filter
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',      // Mobile: 2 Spalten
          sm: 'repeat(3, 1fr)',      // Small: 3 Spalten  
          md: 'repeat(4, 1fr)',      // Medium: 4 Spalten
          lg: 'repeat(5, 1fr)',      // Large: 5 Spalten
          xl: 'repeat(6, 1fr)'       // Extra Large: 6 Spalten
        },
        gap: { xs: 1.5, sm: 2, md: 2.5, lg: 2, xl: 1.5 },
        alignItems: 'stretch',
        justifyContent: 'center',
        px: { xs: 2, sm: 1, md: 0 }
      }}>
        {entities.map((entity) => {
          const adaptedEntity = adaptEntity(entity);
          if (!adaptedEntity) return null;
          
          return (
            <Box 
              key={`${entity._entityType}-${entity.id}`}
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <EntityCard
                entity={adaptedEntity}
                onView={contactHandlers.handleView}
                onMessage={contactHandlers.handleMessage}
                onCall={contactHandlers.handleCall}
                onEmail={contactHandlers.handleEmail}
                onWebsite={contactHandlers.handleWebsite}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  const currentPage = Math.floor((searchParams.offset || 0) / (searchParams.limit || 20)) + 1;
  const totalPages = Math.ceil(totalCount / (searchParams.limit || 20));

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            color: '#1f2937',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Entitäten durchsuchen
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          paragraph
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: { xs: 'center', sm: 'left' },
            maxWidth: '600px'
          }}
        >
          Entdecken Sie Shops, Dienstleister und Benutzer in Ihrer Nähe
        </Typography>
        
        {/* Statistiken */}
        <Box 
          display="flex" 
          gap={{ xs: 1, sm: 1.5, md: 2 }} 
          mb={3} 
          flexWrap="wrap"
          justifyContent={{ xs: 'center', sm: 'flex-start' }}
          sx={{
            '& > *': {
              flex: { xs: '1 1 calc(50% - 4px)', sm: '0 1 auto' },
              minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
            }
          }}
        >
          <Chip
            icon={<Store />}
            label={`${stats.shops} Shops`}
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              fontWeight: 500,
              fontSize: '0.875rem',
              height: 36,
              '& .MuiChip-icon': {
                color: '#6b7280'
              }
            }}
          />
          <Chip
            icon={<Business />}
            label={`${stats.providers} Dienstleister`}
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              fontWeight: 500,
              fontSize: '0.875rem',
              height: 36,
              '& .MuiChip-icon': {
                color: '#6b7280'
              }
            }}
          />
          <Chip
            icon={<Person />}
            label={`${stats.users} Benutzer`}
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              fontWeight: 500,
              fontSize: '0.875rem',
              height: 36,
              '& .MuiChip-icon': {
                color: '#6b7280'
              }
            }}
          />
          <Chip
            label={`${stats.total} Gesamt`}
            sx={{
              backgroundColor: '#374151',
              color: 'white',
              fontWeight: 500,
              fontSize: '0.875rem',
              height: 36
            }}
          />
        </Box>
      </Box>

      {/* Filter und Suche */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 4,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr',                    // Mobile: 1 Spalte
            sm: '1fr 1fr',               // Small: 2 Spalten
            md: '2fr 1fr 1fr 1fr',       // Medium: 4 Spalten
            lg: '2fr 1.5fr 1fr 1.5fr'    // Large: 4 Spalten mit unterschiedlichen Breiten
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          alignItems: 'end'
        }}>
          <Box>
            <TextField
              fullWidth
              label="Suchen"
              value={searchParams.search}
              onChange={handleSearchChange}
              placeholder="Name, Beschreibung, Kategorie..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#374151',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#374151',
                  },
                },
              }}
            />
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="Standort"
              value={searchParams.location}
              onChange={handleLocationChange}
              placeholder="Stadt, Region..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#374151',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#374151',
                  },
                },
              }}
            />
          </Box>
          
          <Box>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sortierung</InputLabel>
              <Select
                value={searchParams.sortBy}
                onChange={handleSortChange}
                label="Sortierung"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                }
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#374151',
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="rating">Bewertung</MenuItem>
                <MenuItem value="created">Erstellt</MenuItem>
                <MenuItem value="verified">Verifiziert</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={searchParams.verified === true}
                  onChange={handleVerifiedChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#374151',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#374151',
                      },
                    },
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Verified fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Nur Verifizierte
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Paper>

      {/* Tabs für Entity-Typen */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: '#e5e7eb', 
        mb: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        px: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="Entity-Typen"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 56,
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#374151',
              },
              '& .MuiTab-iconWrapper': {
                marginBottom: '4px',
                '& svg': {
                  fontSize: '1.25rem'
                }
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#374151',
              height: 3,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Tab 
            label={`Alle (${stats.total})`} 
            icon={<FilterList />}
            iconPosition="top"
          />
          <Tab 
            label={`Shops (${stats.shops})`} 
            icon={<Store />}
            iconPosition="top"
          />
          <Tab 
            label={`Dienstleister (${stats.providers})`} 
            icon={<Business />}
            iconPosition="top"
          />
          <Tab 
            label={`Benutzer (${stats.users})`} 
            icon={<Person />}
            iconPosition="top"
          />
        </Tabs>
      </Box>

      {/* Ergebnisse */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderEntityCards()}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mt={6}
          mb={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              backgroundColor: '#fafafa',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  '&.Mui-selected': {
                    backgroundColor: '#374151',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1f2937',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(55, 65, 81, 0.08)',
                  }
                }
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Ergebnisse-Info */}
      {!loading && entities.length > 0 && (
        <Box 
          textAlign="center" 
          mt={4}
          mb={2}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc',
              display: 'inline-block'
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Zeige {entities.length} von {totalCount} Ergebnissen
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default EntitySearchPage;
