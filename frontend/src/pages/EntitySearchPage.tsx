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
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)',
        backdropFilter: 'blur(20px)',
        zIndex: 0
      }
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box mb={{ xs: 4, sm: 5 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: { xs: 'center', sm: 'left' },
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Entitäten durchsuchen
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              textAlign: { xs: 'center', sm: 'left' },
              maxWidth: '700px',
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#64748b'
            }}
          >
            Entdecken Sie Shops, Dienstleister und Benutzer in Ihrer Nähe
          </Typography>
        
        {/* Statistiken - Premium Glasmorphism */}
        <Box 
          display="flex" 
          gap={{ xs: 1.5, sm: 2, md: 2.5 }} 
          mb={4} 
          flexWrap="wrap"
          justifyContent={{ xs: 'center', sm: 'flex-start' }}
          sx={{
            '& > *': {
              flex: { xs: '1 1 calc(50% - 6px)', sm: '0 1 auto' },
              minWidth: { xs: 'calc(50% - 6px)', sm: 'auto' }
            }
          }}
        >
          <Chip
            icon={<Store />}
            label={`${stats.shops} Shops`}
            sx={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              color: '#374151',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 42,
              borderRadius: 0.5,
              boxShadow: `
                0 4px 12px rgba(0,0,0,0.08),
                0 1px 3px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              transition: 'all 0.2s ease',
              '& .MuiChip-icon': {
                color: '#6b7280',
                fontSize: '1.1rem'
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-1px)',
                boxShadow: `
                  0 6px 16px rgba(0,0,0,0.12),
                  0 2px 4px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `
              }
            }}
          />
          <Chip
            icon={<Business />}
            label={`${stats.providers} Dienstleister`}
            sx={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              color: '#374151',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 42,
              borderRadius: 0.5,
              boxShadow: `
                0 4px 12px rgba(0,0,0,0.08),
                0 1px 3px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              transition: 'all 0.2s ease',
              '& .MuiChip-icon': {
                color: '#6b7280',
                fontSize: '1.1rem'
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-1px)',
                boxShadow: `
                  0 6px 16px rgba(0,0,0,0.12),
                  0 2px 4px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `
              }
            }}
          />
          <Chip
            icon={<Person />}
            label={`${stats.users} Benutzer`}
            sx={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              color: '#374151',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 42,
              borderRadius: 0.5,
              boxShadow: `
                0 4px 12px rgba(0,0,0,0.08),
                0 1px 3px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              transition: 'all 0.2s ease',
              '& .MuiChip-icon': {
                color: '#6b7280',
                fontSize: '1.1rem'
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-1px)',
                boxShadow: `
                  0 6px 16px rgba(0,0,0,0.12),
                  0 2px 4px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.8)
                `
              }
            }}
          />
          <Chip
            label={`${stats.total} Gesamt`}
            sx={{
              background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              height: 42,
              borderRadius: 0.5,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `
                0 4px 12px rgba(55, 65, 81, 0.3),
                0 1px 3px rgba(55, 65, 81, 0.2),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                transform: 'translateY(-1px)',
                boxShadow: `
                  0 6px 16px rgba(55, 65, 81, 0.4),
                  0 2px 4px rgba(55, 65, 81, 0.3),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `
              }
            }}
          />
        </Box>
      </Box>

      {/* Filter und Suche - Premium Glasmorphism */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          mb: 5,
          borderRadius: 1,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            zIndex: 1
          }
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
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 0.5,
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.05),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  transition: 'all 0.2s ease',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    boxShadow: `
                      0 6px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(55, 65, 81, 0.6)',
                    borderWidth: 2,
                    boxShadow: `
                      0 8px 20px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
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
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 0.5,
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.05),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  transition: 'all 0.2s ease',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    boxShadow: `
                      0 6px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(55, 65, 81, 0.6)',
                    borderWidth: 2,
                    boxShadow: `
                      0 8px 20px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
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
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 0.5,
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.05),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  transition: 'all 0.2s ease',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    boxShadow: `
                      0 6px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(55, 65, 81, 0.6)',
                    borderWidth: 2,
                    boxShadow: `
                      0 8px 20px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
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

      {/* Tabs für Entity-Typen - Premium Glasmorphism */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'rgba(255,255,255,0.3)', 
        mb: 5,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        px: 3,
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.08),
          0 2px 8px rgba(0,0,0,0.05),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          zIndex: 1
        }
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
              fontSize: '1rem',
              minHeight: 64,
              color: '#64748b',
              borderRadius: 0.5,
              margin: '8px 4px',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#374151',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: `
                  0 4px 12px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                transform: 'translateY(-1px)'
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.4)',
                color: '#374151',
                transform: 'translateY(-1px)'
              },
              '& .MuiTab-iconWrapper': {
                marginBottom: '6px',
                '& svg': {
                  fontSize: '1.3rem'
                }
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
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

      {/* Pagination - Premium Glasmorphism */}
      {totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          mt={8}
          mb={6}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.08),
                0 2px 8px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                zIndex: 1
              }
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
                  borderRadius: 0.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minWidth: 40,
                  height: 40,
                  margin: '0 2px',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                    color: 'white',
                    boxShadow: `
                      0 4px 12px rgba(55, 65, 81, 0.3),
                      inset 0 1px 0 rgba(255,255,255,0.2)
                    `,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: `
                        0 6px 16px rgba(55, 65, 81, 0.4),
                        inset 0 1px 0 rgba(255,255,255,0.3)
                      `
                    }
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    transform: 'translateY(-1px)',
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `
                  }
                }
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Ergebnisse-Info - Premium Glasmorphism */}
      {!loading && entities.length > 0 && (
        <Box 
          textAlign="center" 
          mt={6}
          mb={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              display: 'inline-block',
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.08),
                0 2px 8px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                zIndex: 1
              }
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#64748b'
              }}
            >
              Zeige {entities.length} von {totalCount} Ergebnissen
            </Typography>
          </Paper>
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default EntitySearchPage;
