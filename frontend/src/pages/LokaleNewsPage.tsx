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
    console.log('Artikel mit ID', articleId, 'wurde zu Lesezeichen hinzugefügt');
  }, []);

  const handleShare = useCallback((articleId: string) => {
    // Hier würde die Teilen-Funktionalität implementiert
    console.log('Artikel mit ID', articleId, 'wird geteilt');
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
            Lokale Nachrichten
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Bleiben Sie auf dem Laufenden über das, was in Ihrer Stadt passiert
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: { xs: 3, md: 4 },
          gap: 1
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
                borderRadius: 2,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                ...(activeTab === tab.value ? {
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' }
                } : {
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    bgcolor: 'rgba(102, 126, 234, 0.04)'
                  }
                })
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          {isMobile ? (
            // Mobile Layout
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Nach Nachrichten suchen..."
                  value={searchTerm}
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
            // Desktop Layout
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 3,
              alignItems: 'end'
            }}>
              <TextField
                fullWidth
                placeholder="Nach Nachrichten suchen..."
                value={searchTerm}
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
                sx={{ minWidth: 150, bgcolor: '#ffffff' }}
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

        {/* Results and Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: { xs: 2, md: 3 }
        }}>
          <Typography variant="body2" color="text.secondary">
            {filteredArticles.length} Nachrichten gefunden
          </Typography>
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-listing')}
            sx={{
              bgcolor: '#28a745',
              borderRadius: 2,
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#218838' }
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
                  borderRadius: 2,
                  border: '1px solid #e1e8ed',
                  '&:hover': {
                    boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#667eea'
                  },
                  transition: 'all 0.2s ease'
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

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<BookmarkIcon />}
                      onClick={() => handleBookmark(article.id)}
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          bgcolor: '#667eea',
                          color: 'white'
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
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          bgcolor: '#667eea',
                          color: 'white'
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
