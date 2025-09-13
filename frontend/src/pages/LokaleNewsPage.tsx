import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  useTheme,
  useMediaQuery,
  IconButton,
  Pagination,
  Skeleton,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  BookmarkBorder as BookmarkIcon,
  Share as ShareIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockArticles, getMockData } from '../utils/mockData';
import type { NewsArticle } from '../utils/mockData';

const LokaleNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Verwende globale Mock-Daten mit Caching für bessere Performance
    const articlesData = getMockData('articles', mockArticles);
    setArticles(articlesData);
    setLoading(false);
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || article.location === selectedLocation;
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'trending' && article.trending) ||
                        (activeTab === 'local' && article.category === 'Lokale News');
      
      return matchesSearch && matchesCategory && matchesLocation && matchesTab;
    });
  }, [articles, searchTerm, selectedCategory, selectedLocation, activeTab]);

  const handleBookmark = useCallback((articleId: string) => {
    // Hier würde die Lesezeichen-Funktionalität implementiert

  }, []);

  const handleShare = useCallback((articleId: string) => {
    // Hier würde die Teilen-Funktionalität implementiert

  }, []);

  // Weitere Event-Handler mit useCallback optimieren
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);



  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleShowFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  if (error) {
    return (
      <Box sx={{ 
        bgcolor: '#ffffff', 
        minHeight: '100vh', 
        py: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', color: '#e74c3c' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Fehler beim Laden der Nachrichten
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

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
            Lokale Nachrichten
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
            Bleiben Sie auf dem Laufenden über das, was in Ihrer Stadt passiert
          </Typography>
        </Box>

        {/* Tabs - Premium Glasmorphism */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: { xs: 4, md: 5 },
          gap: 1,
          p: 2,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: 1,
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
          {[
            { value: 'all', label: 'Alle Nachrichten' },
            { value: 'trending', label: 'Trending' },
            { value: 'local', label: 'Lokal' }
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'contained' : 'outlined'}
              onClick={() => setActiveTab(tab.value)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderRadius: 0.5,
                px: { xs: 3, md: 4 },
                py: { xs: 1.5, md: 2 },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.9rem', md: '1rem' },
                transition: 'all 0.2s ease',
                ...(activeTab === tab.value ? {
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: `
                    0 4px 12px rgba(55, 65, 81, 0.3),
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    transform: 'none',
                    boxShadow: `
                      0 6px 16px rgba(55, 65, 81, 0.4),
                      inset 0 1px 0 rgba(255,255,255,0.3)
                    `
                  }
                } : {
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#374151',
                  boxShadow: `
                    0 4px 12px rgba(0,0,0,0.05),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.95)',
                    transform: 'none',
                    boxShadow: `
                      0 6px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `
                  }
                })
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Search and Filters - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          {isMobile ? (
            // Mobile Layout
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Nach Nachrichten suchen..."
                  value={searchTerm}
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
                  borderRadius: 1,
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
                    <MenuItem value="Lokale News">Lokale News</MenuItem>
                    <MenuItem value="Verkehr">Verkehr</MenuItem>
                    <MenuItem value="Kultur">Kultur</MenuItem>
                    <MenuItem value="Wirtschaft">Wirtschaft</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Standort"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    size="small"
                    sx={{ bgcolor: '#ffffff' }}
                  >
                    <MenuItem value="all">Alle Standorte</MenuItem>
                    <MenuItem value="München">München</MenuItem>
                    <MenuItem value="Berlin">Berlin</MenuItem>
                    <MenuItem value="Hamburg">Hamburg</MenuItem>
                    <MenuItem value="Köln">Köln</MenuItem>
                    <MenuItem value="Stuttgart">Stuttgart</MenuItem>
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
              borderRadius: 1,
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
                placeholder="Nach Nachrichten suchen..."
                value={searchTerm}
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
                <MenuItem value="Lokale News">Lokale News</MenuItem>
                <MenuItem value="Verkehr">Verkehr</MenuItem>
                <MenuItem value="Kultur">Kultur</MenuItem>
                <MenuItem value="Wirtschaft">Wirtschaft</MenuItem>
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
                <MenuItem value="all">Alle Standorte</MenuItem>
                <MenuItem value="München">München</MenuItem>
                <MenuItem value="Berlin">Berlin</MenuItem>
                <MenuItem value="Hamburg">Hamburg</MenuItem>
                <MenuItem value="Köln">Köln</MenuItem>
                <MenuItem value="Stuttgart">Stuttgart</MenuItem>
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

        {/* Results and Actions - Premium Glasmorphism */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: { xs: 3, md: 4 },
          p: 3,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: 1,
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
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontWeight: 600,
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {filteredArticles.length} Nachrichten gefunden
          </Typography>
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-listing')}
            sx={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: 1,
              px: { xs: 4, md: 5 },
              py: { xs: 1.5, md: 2 },
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.1rem' },
              textTransform: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `
                0 8px 32px rgba(5, 150, 105, 0.3),
                0 2px 8px rgba(5, 150, 105, 0.2),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
              transition: 'all 0.2s ease',
              '&:hover': { 
                background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                transform: 'none',
                boxShadow: `
                  0 12px 40px rgba(5, 150, 105, 0.4),
                  0 4px 12px rgba(5, 150, 105, 0.3),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `
              }
            }}
          >
            Nachricht einreichen
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
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} width="80%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Articles Grid */}
        {!loading && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
              : '1fr',
            gap: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 }
          }}>
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
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
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  {/* Header with Badges */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant={isMobile ? 'h6' : 'h6'} 
                        component="h3" 
                        sx={{ 
                          mb: 1,
                          fontWeight: 600, 
                          color: '#2c3e50',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {article.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      {article.featured && (
                        <Tooltip title="Empfohlen">
                          <StarIcon sx={{ color: '#ffc107', fontSize: '1rem' }} />
                        </Tooltip>
                      )}
                      {article.trending && (
                        <Tooltip title="Trending">
                          <TrendingIcon sx={{ color: '#e74c3c', fontSize: '1rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Summary */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.summary}
                  </Typography>

                  {/* Meta Information */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <PersonIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {article.author}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TimeIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {article.publishDate}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <VisibilityIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {article.views} Aufrufe
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {article.readTime} Min. Lesezeit
                    </Typography>
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {article.tags.slice(0, 3).map((tag, index) => (
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
                    {article.tags.length > 3 && (
                      <Chip
                        label={`+${article.tags.length - 3}`}
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

                  {/* Action Buttons - Enhanced Micro-Interactions */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<BookmarkIcon />}
                      onClick={() => handleBookmark(article.id)}
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
                      Merken
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => handleShare(article.id)}
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
                      Teilen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && filteredArticles.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredArticles.length / 12)}
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
        {!loading && filteredArticles.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 },
            color: '#7f8c8d'
          }}>
            <TrendingIcon sx={{ fontSize: { xs: '4rem', md: '6rem' }, mb: 2, opacity: 0.5 }} />
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Keine Nachrichten gefunden
            </Typography>
            <Typography variant="body2">
              Versuche es mit anderen Suchkriterien oder reiche eine Nachricht ein.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LokaleNewsPage;
