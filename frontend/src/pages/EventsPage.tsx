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

  // Weitere Event-Handler mit useCallback optimieren
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);





  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ 
              mb: { xs: 1, md: 2 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Lokale Events & Veranstaltungen
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Entdecken Sie spannende Events in Ihrer Nähe oder erstellen Sie Ihre eigene Veranstaltung
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          {isMobile ? (
            // Mobile Layout
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Events suchen..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#ffffff'
                    }
                  }}
                />
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e1e8ed',
                    '&:hover': { bgcolor: '#e9ecef' }
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
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e1e8ed'
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
            // Desktop Layout
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 3,
              alignItems: 'end'
            }}>
              <TextField
                fullWidth
                placeholder="Events suchen..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#ffffff'
                  }
                }}
              />
              <TextField
                select
                label="Kategorie"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ minWidth: 150, bgcolor: '#ffffff' }}
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
                sx={{ minWidth: 150, bgcolor: '#ffffff' }}
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
                    bgcolor: viewMode === 'grid' ? '#667eea' : '#f8f9fa',
                    color: viewMode === 'grid' ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: viewMode === 'grid' ? '#5a6fd8' : '#e9ecef'
                    }
                  }}
                >
                  <GridIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  sx={{
                    bgcolor: viewMode === 'list' ? '#667eea' : '#f8f9fa',
                    color: viewMode === 'list' ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: viewMode === 'list' ? '#5a6fd8' : '#e9ecef'
                    }
                  }}
                >
                  <ListIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>

        {/* Create Event Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: { xs: 3, md: 4 } 
        }}>
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
            sx={{
              bgcolor: '#667eea',
              borderRadius: 2,
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#5a6fd8' }
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
                  borderRadius: 2,
                  border: '1px solid #e1e8ed',
                  '&:hover': {
                    boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#667eea'
                  },
                  transition: 'all 0.2s ease'
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

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleContact(event)}
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          bgcolor: '#667eea',
                          color: 'white'
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
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5a6fd8' }
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
