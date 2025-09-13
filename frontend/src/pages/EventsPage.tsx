import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Pagination,
  Skeleton,
  MenuItem
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
  Euro as EuroIcon,
  People as PeopleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Event as EventIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockEvents, getMockData } from '../utils/mockData';
import type { Event } from '../utils/mockData';

const EventsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Verwende globale Mock-Daten mit Caching für bessere Performance
    const eventsData = getMockData('events', mockEvents);
    setEvents(eventsData);
    setLoading(false);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesLocation = selectedLocation === '' || event.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation]);

  const handleContact = useCallback((event: Event) => {
    if (event.phone) {
      window.open(`tel:${event.phone}`, '_self');
    } else if (event.email) {
      window.open(`mailto:${event.email}`, '_self');
    } else if (event.website) {
      window.open(`https://${event.website}`, '_blank');
    }
  }, []);

  const handleEventClick = useCallback((id: string) => {
    navigate(`/events/${id}`);
  }, [navigate]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }, []);

  const getDaysUntilEvent = useCallback((dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vergangen';
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    return `In ${diffDays} Tagen`;
  }, []);

  const getCountdownInfo = useCallback((dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return null;
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 7) return null; // Nur für Events in den nächsten 7 Tagen
    
    return { days, hours, minutes };
  }, []);

  // Weitere Event-Handler mit useCallback optimieren
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);





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
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Lokale Events & Veranstaltungen
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#64748b'
            }}
          >
            Entdecken Sie spannende Events in Ihrer Nähe oder erstellen Sie Ihre eigene Veranstaltung
          </Typography>
        </Box>

        {/* Search and Filters - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          {isMobile ? (
            // Mobile Layout
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Events suchen..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 1,
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
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 1,
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,0.05),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.95)',
                      transform: 'none',
                      boxShadow: `
                        0 6px 16px rgba(0,0,0,0.08),
                        inset 0 1px 0 rgba(255,255,255,0.8)
                      `
                    }
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Box>
              
              {showFilters && (
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  p: 3,
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)',
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
                  <TextField
                    select
                    label="Kategorie"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    size="small"
                    sx={{ bgcolor: '#ffffff' }}
                  >
                    <MenuItem value="all">Alle Kategorien</MenuItem>
                    <MenuItem value="music">Musik</MenuItem>
                    <MenuItem value="sports">Sport</MenuItem>
                    <MenuItem value="culture">Kultur</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                    <MenuItem value="food">Essen & Trinken</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Standort"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    size="small"
                    sx={{ bgcolor: '#ffffff' }}
                  >
                    <MenuItem value="">Alle Standorte</MenuItem>
                    <MenuItem value="berlin">Berlin</MenuItem>
                    <MenuItem value="hamburg">Hamburg</MenuItem>
                    <MenuItem value="munich">München</MenuItem>
                    <MenuItem value="cologne">Köln</MenuItem>
                  </TextField>
                </Box>
              )}
            </Box>
          ) : (
            // Desktop Layout - Premium Glasmorphism
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 3,
              alignItems: 'end',
              p: 4,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.2)',
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
              <TextField
                fullWidth
                placeholder="Events suchen..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 1,
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
              <TextField
                select
                label="Kategorie"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ 
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 1,
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
              >
                <MenuItem value="all">Alle Kategorien</MenuItem>
                <MenuItem value="music">Musik</MenuItem>
                <MenuItem value="sports">Sport</MenuItem>
                <MenuItem value="culture">Kultur</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="food">Essen & Trinken</MenuItem>
              </TextField>
              <TextField
                select
                label="Standort"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                sx={{ 
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 1,
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
              >
                <MenuItem value="">Alle Standorte</MenuItem>
                <MenuItem value="berlin">Berlin</MenuItem>
                <MenuItem value="hamburg">Hamburg</MenuItem>
                <MenuItem value="munich">München</MenuItem>
                <MenuItem value="cologne">Köln</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  sx={{
                    background: viewMode === 'grid' 
                      ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                      : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    color: viewMode === 'grid' ? 'white' : '#374151',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 1,
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,0.05),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: viewMode === 'grid' 
                        ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                        : 'rgba(255,255,255,0.95)',
                      transform: 'none',
                      boxShadow: `
                        0 6px 16px rgba(0,0,0,0.08),
                        inset 0 1px 0 rgba(255,255,255,0.8)
                      `
                    }
                  }}
                >
                  <GridIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  sx={{
                    background: viewMode === 'list' 
                      ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                      : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    color: viewMode === 'list' ? 'white' : '#374151',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 1,
                    boxShadow: `
                      0 4px 12px rgba(0,0,0,0.05),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: viewMode === 'list' 
                        ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                        : 'rgba(255,255,255,0.95)',
                      transform: 'none',
                      boxShadow: `
                        0 6px 16px rgba(0,0,0,0.08),
                        inset 0 1px 0 rgba(255,255,255,0.8)
                      `
                    }
                  }}
                >
                  <ListIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>

        {/* Create Event Button - Premium Glasmorphism */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: { xs: 4, md: 5 } 
        }}>
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
            sx={{
              background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
              borderRadius: 1,
              px: { xs: 4, md: 5 },
              py: { xs: 1.5, md: 2 },
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.1rem' },
              textTransform: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `
                0 8px 32px rgba(55, 65, 81, 0.3),
                0 2px 8px rgba(55, 65, 81, 0.2),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
              transition: 'all 0.2s ease',
              '&:hover': { 
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                transform: 'none',
                boxShadow: `
                  0 12px 40px rgba(55, 65, 81, 0.4),
                  0 4px 12px rgba(55, 65, 81, 0.3),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `
              }
            }}
          >
            Event erstellen
          </Button>
        </Box>

        {/* Loading Skeleton */}
        {loading && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={160} />
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Events Grid */}
        {!loading && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
              : '1fr',
            gap: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 }
          }}>
            {filteredEvents.map((event) => (
              <Card 
                key={event.id} 
                sx={{ 
                  borderRadius: 1,
                  border: '1px solid transparent',
                  background: `
                    linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)) border-box
                  `,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 8px 32px rgba(0,0,0,0.12),
                    0 4px 16px rgba(0,0,0,0.08),
                    0 2px 8px rgba(0,0,0,0.04),
                    inset 0 1px 0 rgba(255,255,255,0.8)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                    zIndex: 1
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 0
                  },
                  '&:hover': {
                    transform: 'none',
                    boxShadow: `
                      0 24px 48px rgba(0,0,0,0.15),
                      0 12px 24px rgba(0,0,0,0.1),
                      0 4px 12px rgba(0,0,0,0.06),
                      inset 0 1px 0 rgba(255,255,255,0.9)
                    `,
                    background: `
                      linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2)) border-box
                    `,
                    '&::after': {
                      opacity: 1
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={event.image}
                    alt={event.title}
                    sx={{
                      width: '100%',
                      height: viewMode === 'list' ? 200 : 160,
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />
                  {event.verified && (
                    <Chip
                      label={<VerifiedIcon sx={{ fontSize: 14, color: '#667eea' }} />}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#ffffff',
                        borderRadius: 1
                      }}
                    />
                  )}
                  
                  {/* Countdown Timer für bald stattfindende Events */}
                  {getCountdownInfo(event.date) && (
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 2
                    }}>
                      {(() => {
                        const countdown = getCountdownInfo(event.date);
                        return countdown ? (
                          <>
                            {countdown.days > 0 && `${countdown.days}d `}
                            {countdown.hours}h {countdown.minutes}m
                          </>
                        ) : null;
                      })()}
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography 
                    variant={isMobile ? 'h6' : 'h6'} 
                    component="h3" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#2c3e50',
                      lineHeight: 1.3,
                      mb: 1
                    }}
                  >
                    {event.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {event.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.date)} • {event.time}
                    </Typography>
                    {getCountdownInfo(event.date) && (
                      <Chip
                        label="Bald!"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LocationIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EuroIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.price === 'Eintritt frei' ? 'Kostenlos' : `€${event.price}`}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PeopleIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.attendees}/{event.maxAttendees} Teilnehmer
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {event.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: '#f8f9fa',
                          color: '#667eea',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    ))}
                    {event.tags.length > 3 && (
                      <Chip
                        label={`+${event.tags.length - 3}`}
                        size="small"
                        sx={{
                          bgcolor: '#f8f9fa',
                          color: '#667eea',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleContact(event)}
                      sx={{
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid transparent',
                        backgroundImage: `
                          linear-gradient(white, white) padding-box,
                          linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)) border-box
                        `,
                        color: '#374151',
                        borderRadius: 0.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: `
                          0 4px 16px rgba(0,0,0,0.08),
                          0 2px 8px rgba(0,0,0,0.04),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          transition: 'left 0.5s ease',
                          zIndex: 0
                        },
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)',
                          transform: 'none',
                          boxShadow: `
                            0 8px 24px rgba(0,0,0,0.12),
                            0 4px 12px rgba(0,0,0,0.08),
                            inset 0 1px 0 rgba(255,255,255,0.9)
                          `,
                          '&::before': {
                            left: '100%'
                          }
                        },
                        '&:active': {
                          transform: 'none',
                          transition: 'all 0.1s ease'
                        }
                      }}
                    >
                      Kontakt
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => handleEventClick(event.id)}
                      sx={{
                        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                        borderRadius: 0.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: `
                          0 4px 16px rgba(55, 65, 81, 0.3),
                          0 2px 8px rgba(55, 65, 81, 0.2),
                          inset 0 1px 0 rgba(255,255,255,0.2)
                        `,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s ease',
                          zIndex: 0
                        },
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                          transform: 'none',
                          boxShadow: `
                            0 8px 24px rgba(55, 65, 81, 0.4),
                            0 4px 12px rgba(55, 65, 81, 0.3),
                            inset 0 1px 0 rgba(255,255,255,0.3)
                          `,
                          '&::before': {
                            left: '100%'
                          }
                        },
                        '&:active': {
                          transform: 'none',
                          transition: 'all 0.1s ease'
                        }
                      }}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && filteredEvents.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredEvents.length / 12)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
        )}

        {/* No Results */}
        {!loading && filteredEvents.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 },
            color: '#7f8c8d'
          }}>
            <EventIcon sx={{ fontSize: { xs: '4rem', md: '6rem' }, mb: 2, opacity: 0.5 }} />
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Keine Events gefunden
            </Typography>
            <Typography variant="body2">
              Versuche es mit anderen Suchkriterien oder erstelle dein eigenes Event.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default EventsPage;
